// deno-lint-ignore-file no-explicit-any
import {
  createContext,
  defaultServiceMethods,
  getServiceOptions,
  http,
  MethodNotAllowed,
  OakMiddleware,
  OakRouter,
  Feathers,
  routing,
} from "./deps.ts";

import {
  Middleware,
  Application
} from "./types.d.ts";

const debug = console.debug.bind("feathers-oak/rest");

const serviceMiddleware = (): Middleware => {
  return async (context, _next) => {
    const {
      headers,
      body,
      method: httpMethod,
      url: { pathname, searchParams },
    } = context.request;
    const methodOverride = headers.get(http.METHOD_HEADER) || undefined;

    const { service, params: { __id: id = null, ...route } } = context.state
      .lookup!;
    const method = http.getServiceMethod(httpMethod, id, methodOverride);
    const { methods } = getServiceOptions(service);

    debug(
      `Found service for path ${pathname}, attempting to run ${method} service method`,
    );

    if (
      !methods?.includes(method) ||
      methodOverride && defaultServiceMethods.includes(methodOverride)
    ) {
      const error = new MethodNotAllowed(
        `Method \`${method}\` is not supported by this endpoint.`,
      );
      context.response.status = error.code;
      throw error;
    }

    const createArguments = http.argumentsFor[method as "get"] ||
      http.argumentsFor.default;
    const params = { searchParams, headers, route, ...context.state.feathers };
    const args = createArguments({ id, data: body, params });
    const contextBase = createContext(service, method, { http: {} });
    context.state.hook = contextBase;

    const ctx = await (service as any)[method](...args, contextBase);
    context.state.hook = ctx;

    const response = http.getResponse(ctx);
    context.response.status = response.status;
    // applying headers
    for (const [key, value] of Object.entries(response.headers)) {
      [value].flat().map((individualValue) => {
        context.response.headers.append(key, individualValue);
      });
    }
    context.response.body = response.body;
  };
};

const servicesMiddleware = (): Middleware => {
  return (context, next) => {
    const app = context.app;
    const lookup = app.lookup(context.request.url.pathname);

    if (!lookup) {
      return next();
    }

    context.state.lookup = lookup;

    return serviceMiddleware()(context, next);
  };
};

export const formatter: Middleware = () => { };

export type RestOptions = {
  formatter?: Middleware;
  // authentication?: AuthenticationSettings
};

export const rest = (feathersApp: Feathers, options?: RestOptions | Middleware) => {
  routing()(feathersApp as any);
  options = typeof options === "function" ? { formatter: options } : options;

  const formatterMiddleware = options?.formatter || formatter;
  // const authenticationOptions = options.authentication

  return (app: Application) => {
    app.use((ctx, next) => {
      ctx.app = feathersApp;
      return next();
    })

    // app.use(parseAuthentication(authenticationOptions))
    app.use(servicesMiddleware());

    feathersApp.mixins.push(() => {
      const router = new OakRouter();
      router.use(serviceMiddleware() as OakMiddleware);
      router.use(formatterMiddleware as OakMiddleware);

      feathersApp.serviceRouter = router;
    });
  };
};
