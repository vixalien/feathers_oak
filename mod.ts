// deno-lint-ignore-file no-explicit-any
import { Oak, Feathers, routing, OakMiddleware } from "./deps.ts";

import type { Application, Middleware } from "./types.d.ts";

export * from './types.d.ts';
export * from './rest.ts';

const debug = console.debug.bind(`feathers-koa`);

export function app<S = any, C = any>(feathersApp: Feathers<S, C>, oakApp = new Oak()): Application<S, C> {
  if (!feathersApp) {
    return oakApp as any;
  }

  if (typeof feathersApp.setup !== "function") {
    throw new Error("feathers-oak requires a valid Feathers application instance");
  }

  const app = feathersApp as unknown as Application<S, C>;
  const { listen: oakListen, use: oakUse } = oakApp;
  const { use: feathersUse } = feathersApp;

  Object.assign(app, {
    use(location: string | Middleware, ...args: any[]) {
      if (typeof location === 'string') {
        return (feathersUse as any).call(this, location, ...args);
      }

      return oakUse.call(this, location as OakMiddleware);
    },

    async listen(port?: number) {
      await oakListen.call(this, { port });

      await app.setup(oakApp);
      debug('Feathers application listening');

      return oakApp;
    },
  });

  const appDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(app)),
    ...Object.getOwnPropertyDescriptors(app)
  }

  const newDescriptors = {
    ...Object.getOwnPropertyDescriptors(Object.getPrototypeOf(oakApp)),
    ...Object.getOwnPropertyDescriptors(oakApp)
  }

  // Copy all non-existing properties (including non-enumerables)
  // that don't already exist on the Express app
  Object.keys(newDescriptors).forEach((prop) => {
    const appProp = appDescriptors[prop]
    const newProp = newDescriptors[prop]

    if (appProp === undefined && newProp !== undefined) {
      Object.defineProperty(app, prop, newProp)
    }
  });

  routing()(app as any);
  app.use((ctx, next) => {
    ctx.state.feathers = { ...ctx.state.feathers, provider: 'rest' };
    return next();
  });

  return app;
}
