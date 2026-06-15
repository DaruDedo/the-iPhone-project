import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

let client: ReturnType<typeof postgres> | null = null;
let db: PostgresJsDatabase<typeof schema> | null = null;

function getDatabaseUrl() {
  return process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL || "";
}

export function hasDatabaseUrl() {
  return Boolean(getDatabaseUrl());
}

export function getDb() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return null;
  }

  if (!client) {
    client = postgres(databaseUrl, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
    });
  }

  db ??= drizzle(client, { schema });

  return db;
}
