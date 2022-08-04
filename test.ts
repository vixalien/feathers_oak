import { restRouter } from "./mod.ts";
import { OakMiddleware, OakRouter, Oak, routing } from "./deps.ts";
import { feathers } from "https://deno.land/x/feathers/mod.ts";

import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.31.0/mod.ts";

import { MongoService } from "../mongo/mod.ts";
import { _ } from "../mongo/deps.ts";

const client = new MongoClient();

interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
}

// Connecting to a Local Database
await client.connect("mongodb://127.0.0.1:27017");

const db = client.database("rwarrims");
const users = db.collection<UserSchema>("feathers-test");

const notFound: OakMiddleware = async (ctx, next) => {
  await next();
  ctx.response.body = `Cannot ${ctx.request.method} ${ctx.request.url.pathname}`;
}

// initializing feathers & oak
const app = feathers();
const site = new Oak();
app.configure(routing() as any);

app.use("users", new MongoService({
  Model: users
}));

const rest = restRouter(app);

site.use(rest.routes(), rest.allowedMethods());

site.use(notFound);

site.listen({
  port: 3000
});
