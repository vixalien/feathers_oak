# feathers_oak

[Feathers](https://feathersjs.com]) - [Oak](https://github.com/oakserver/oak) 🦕
framework bindings and REST provider. Oak works under both Deno and NPM.

## Usage

`feathers_oak` requires 2 pre-existing `feathers` and `oak` apps. It just binds
them together so that you can use your services from oak as a REST endpoint with
oak.

```ts
// Oak
import { Application } from "https://deno.land/x/oak/mod.ts";

// Importing feathers
import { feathers } from "https://deno.land/x/feathers/mod.ts";
import {
  errorHandler,
  restRouter,
  routing,
} from "https://deno.land/x/feathers_oak/mod.ts";

// we will use mongo and it's feathers adapter as an example, but you can use whatever database adapter you like
import { MongoClient } from "https://deno.land/x/mongo/mod.ts";
import { MongoService } from "https://deno.land/x/feathers_mongo/mod.ts";

// initialising the mongo client & service
const client = new MongoClient();
await client.connect("mongodb://127.0.0.1:27017");

interface UserSchema {
  _id: ObjectId;
  username: string;
  password: string;
  age: number;
}

const db = client.database("test");
const users = db.collection<UserSchema>("users");
const Users = new MongoService<UserSchema>({
  // set the collection
  Model: users,
  // default pagination options
  paginate: {
    default: 10,
    max: 50,
  },
});

// creating the feathers app
const app = feathers();
// IMPORTANT: must initialize routing before adding services
app.configure(routing() as any);
app.use("users", Users);

// creating the oak site & adding feathers REST router
const site = new Application();
const router = restRouter(app);
site.use(errorHandler());
site.use(router.routes(), router.allowedMethods());

// start the site
site.listen({
  post: 3000,
});
```

NOTE: this project is WIP, and some things may not work or misbehave. This
README will be updated when this package reachs `v1`.
