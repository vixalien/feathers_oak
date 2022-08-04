// deno-lint-ignore-file no-explicit-any
import {
  createContext,
  defaultServiceMethods,
  Feathers,
  getServiceOptions,
  http,
  MethodNotAllowed,
  Router,
  routing,
} from "./deps.ts";

import { AppState, Middleware, RoutedFeathers } from "./types.d.ts";

const debug = console.debug.bind("feathers-oak/rest");

const serviceMiddleware = (): Middleware => {
  return async (context, next) => {
    if (!context.state.lookup) {
      return next();
    }

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
    const params = {
      query: Object.fromEntries(searchParams),
      headers: Object.fromEntries(headers),
      route,
      ...context.state.feathers,
    };
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

const initializeState = (app: RoutedFeathers): Middleware => {
  return (context, next) => {
    context.state.app = app;
    context.state.feathers = {
      ...context.state.feathers,
      provider: "rest",
    };
    const lookup = context.state.app.lookup(context.request.url.pathname);

    context.state.lookup = lookup;

    return next();
  };
};

export const formatter: Middleware = (_, next) => {
  return next();
};

export type RestOptions = {
  formatter?: Middleware;
  // authentication?: AuthenticationSettings
};

export const restRouter = (
  feathersApp: Feathers,
  options?: RestOptions | Middleware,
) => {
  const routedApp = feathersApp as RoutedFeathers;
  // @ts-expect-error routing expects a different thing
  routedApp.configure(routing());
  options = typeof options === "function" ? { formatter: options } : options;

  const formatterMiddleware = options?.formatter || formatter;

  const router = new Router<AppState>();

  router.get("/blops", (ctx) => {
    ctx.response.body =
      "Router must have atleast one non-USE middleware so blop";
  });

  router.all(
    "(.*)",
    initializeState(routedApp),
    formatterMiddleware,
    serviceMiddleware(),
  );

  return router;
};
