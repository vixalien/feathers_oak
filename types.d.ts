// deno-lint-ignore-file no-explicit-any
import {
  Oak,
  Context,
  Feathers,
  FeathersParams,
  HookContext,
  Router,
  Service,
  OakRouter,
  OakMiddleware
} from "./deps.ts";

export interface RouteLookup {
  service: Service<any>;
  params: {
    [key: string]: any;
  };
}

export interface FeathersApplication<Services = any, Settings = any>
  extends Feathers<Services, Settings> {
  router: Router<RouteLookup>;
  lookup(path: string): RouteLookup;
}

export interface ContextState<A = FeathersApplication> {
  feathers?: Partial<FeathersParams> & { [key: string]: any };
  lookup?: RouteLookup;
  hook?: HookContext;
  app: A;
}

export type ApplicationAddons = {
  listen(port?: number, ...args: any[]): Promise<void>;
  use(...middlewares: Middleware[]): Application;
  serviceRouter: OakRouter;
};

export type Application<T = any, C = any> =
  & Omit<Oak<ContextState>, "listen">
  & FeathersApplication<T, C>
  & ApplicationAddons;

type ConstructedContext<A = Application, S = ContextState> = Context<S> & {
  app: A;
};

export type Middleware<A = Application> = OakMiddleware<
  ContextState,
  ConstructedContext<A>
>;
