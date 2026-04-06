// PostgreSQL migration script for my-wedding
// Uses DATABASE_URL environment variable

import { existsSync } from "fs";
import postgres from "postgres";

const databaseUrl = process.env.DATABASE_URL;

async function runMigrations() {
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  console.log(`DB host: ${new URL(databaseUrl).hostname}`);

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 5,
    connect_timeout: 10,
  });

  try {
    // Test connection
    await sql`SELECT 1`;
    console.log("PostgreSQL connection successful");

    // Check if we have migration files
    const hasMigrations = existsSync("./packages/db/drizzle/meta/_journal.json");

    if (hasMigrations) {
      const { drizzle } = await import("drizzle-orm/postgres-js");
      const { migrate } = await import("drizzle-orm/postgres-js/migrator");
      const db = drizzle(sql);
      await migrate(db, { migrationsFolder: "./packages/db/drizzle" });
      console.log("PostgreSQL migrations completed successfully");
    } else {
      console.log("No migrations found - skipping");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Migration error:", message);
    process.exit(1);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

runMigrations().catch((error) => {
  console.error("Migration error:", error);
  process.exit(1);
});
