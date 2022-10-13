export {
  Application as Oak,
  Context,
  Router,
} from "https://deno.land/x/oak@v11.1.0/mod.ts";

export type { Middleware } from "https://deno.land/x/oak@v11.1.0/mod.ts";

export {
  createContext,
  defaultServiceMethods,
  getServiceOptions,
} from "https://deno.land/x/feathers@v5.0.0-pre.31/mod.ts";

export type {
  Application as Feathers,
  HookContext,
  Params,
  Service,
} from "https://deno.land/x/feathers@v5.0.0-pre.31/mod.ts";

export {
  MethodNotAllowed,
} from "https://deno.land/x/feathers@v5.0.0-pre.31/_errors/mod.ts";

export {
  NotFound,
} from "https://deno.land/x/feathers@v5.0.0-pre.31/_errors/mod.ts";

export {
  authenticate,
  AuthenticationService,
} from "https://esm.sh/@feathersjs/authentication@5.0.0-pre.31";

export {
  http,
  routing,
} from "https://esm.sh/@feathersjs/transport-commons@5.0.0-pre.31";

export type {
  Router as FeathersRouter,
} from "https://unpkg.com/@feathersjs/transport-commons@5.0.0-pre.31/lib/routing/router.d.ts";
