// deno-lint-ignore-file no-explicit-any
import {
  Feathers,
  HookContext,
  Middleware as OakMiddleware,
  Params,
  Router,
  Service,
} from "./deps.ts";

export interface RouteLookup {
  service: Service<any>;
  params: {
    [key: string]: any;
  };
}

export interface RoutedFeathers<Services = any, Settings = any>
  extends Feathers<Services, Settings> {
  router: Router<RouteLookup>;
  lookup(path: string): RouteLookup;
}

export type Middleware = OakMiddleware<AppState>;

export interface AppState {
  app: RoutedFeathers;
  lookup?: RouteLookup;
  hook?: HookContext;
  feathers?: Partial<Params> & { [key: string]: any };
}
