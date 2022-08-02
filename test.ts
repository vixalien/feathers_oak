import { rest } from "./mod.ts";
import { routing } from "./deps.ts";
import { feathers } from "https://deno.land/x/feathers/mod.ts";
import { Application } from "https://deno.land/x/oak/mod.ts";

import {
  MongoClient,
  ObjectId,
} from "https://deno.land/x/mongo@v0.31.0/mod.ts";

import { MongoService } from "../mongo/mod.ts";

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

const app = feathers();
/// @ts-ignore routing
app.configure(routing())
app.use("users", new MongoService({
  Model: users
}));

const site = new Application();
const res = rest(app);
res(site);
console.log("here");
site.listen({
  port: 3000
})
  .then(l => console.log(l));
