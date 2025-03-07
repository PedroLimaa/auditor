import { Lucia, TimeSpan } from "lucia";

import { NodePostgresAdapter } from "@lucia-auth/adapter-postgresql";
import { postgresClient } from "./index";

const { client } = postgresClient();

const adapter = new NodePostgresAdapter(client, {
  user: "users",
  session: "user_session",
});

import type { DatabaseUser } from "../../interface/db";

export const lucia = new Lucia(adapter, {
  sessionExpiresIn: new TimeSpan(2, "h"),
  sessionCookie: {
    attributes: {
      secure: !import.meta.dev,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: Omit<DatabaseUser, "id">;
  }
}
