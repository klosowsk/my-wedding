// PostgreSQL migration script for my-wedding
// Uses DATABASE_URL environment variable

import { existsSync } from "fs"
import pg from "pg"

const databaseUrl = process.env.DATABASE_URL

async function runMigrations() {
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required")
    process.exit(1)
  }

  console.log(`Connecting to PostgreSQL...`)
  console.log(`DB host: ${new URL(databaseUrl).hostname}`)

  const pool = new pg.Pool({ connectionString: databaseUrl })

  try {
    // Test connection
    await pool.query("SELECT 1")
    console.log("PostgreSQL connection successful")

    // Check if we have migration files
    const hasMigrations = existsSync("./packages/db/drizzle/meta/_journal.json")

    if (hasMigrations) {
      const { drizzle } = await import("drizzle-orm/node-postgres")
      const { migrate } = await import("drizzle-orm/node-postgres/migrator")
      const db = drizzle(pool)
      await migrate(db, { migrationsFolder: "./packages/db/drizzle" })
      console.log("PostgreSQL migrations completed successfully")
    } else {
      console.log("No migrations found - skipping")
    }
  } catch (error) {
    console.error("Migration error:", error.message)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations().catch((error) => {
  console.error("Migration error:", error)
  process.exit(1)
})
