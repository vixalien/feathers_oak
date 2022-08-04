import { Middleware, NotFound } from "./deps.ts";

export const errorHandler = (): Middleware => async (ctx, next) => {
  try {
    await next();

    if (!ctx.response.body && ctx.respond) {
      throw new NotFound(
        `Cannot ${ctx.request.method} ${ctx.request.url.pathname}`,
      );
    }
    // deno-lint-ignore no-explicit-any
  } catch (error: any) {
    ctx.response.status = error.code || 500;
    ctx.response.body = typeof error.toJSON === "function" ? error.toJSON() : {
      message: error.message,
    };
  }
};
