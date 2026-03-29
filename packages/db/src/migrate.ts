import { drizzle } from "drizzle-orm/node-postgres"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import pg from "pg"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsFolder =
  process.env.MIGRATIONS_FOLDER ?? join(__dirname, "../drizzle")

const client = new pg.Client({ connectionString })
await client.connect()

const db = drizzle(client)

console.log(`Running migrations from ${migrationsFolder}...`)
await migrate(db, { migrationsFolder })
console.log("Migrations complete.")

await client.end()
