import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres"
import { Config, Effect, Schema } from "effect"
import pg from "pg"
import * as schema from "./schema/index.js"

export class DatabaseError extends Schema.TaggedError<DatabaseError>()(
  "DatabaseError",
  { message: Schema.String }
) {
  static fromUnknownError(error: unknown, message: string): DatabaseError {
    if (error instanceof Error) {
      return new DatabaseError({
        message: `${message}: ${error.message}`,
      })
    }
    return new DatabaseError({ message: `${message}: Unknown error` })
  }
}

export type DrizzleDb = NodePgDatabase<typeof schema>

export class DrizzleClient extends Effect.Service<DrizzleClient>()(
  "DrizzleClient",
  {
    scoped: Effect.gen(function* () {
      const connectionString = yield* Config.string("DATABASE_URL")
      const skipDbCheck = yield* Config.string("SKIP_DB_CHECK").pipe(
        Config.withDefault("false")
      )

      const pool = yield* Effect.acquireRelease(
        Effect.try({
          try: () => new pg.Pool({ connectionString }),
          catch: (cause) =>
            DatabaseError.fromUnknownError(
              cause,
              "Creating PostgreSQL pool failed"
            ),
        }).pipe(Effect.tap(Effect.log("PostgreSQL pool created"))),
        (pool) =>
          Effect.promise(() => pool.end()).pipe(
            Effect.tap(() => Effect.log("PostgreSQL pool closed"))
          )
      )

      const db: DrizzleDb = drizzle(pool, { schema })

      const use = <A>(f: (db: DrizzleDb) => Promise<A>) =>
        Effect.tryPromise({
          try: () => f(db),
          catch: (cause) =>
            DatabaseError.fromUnknownError(
              cause,
              "DrizzleClient action failed"
            ),
        })

      if (skipDbCheck === "false") {
        yield* Effect.tryPromise({
          try: () => pool.query("SELECT 1"),
          catch: (cause) =>
            DatabaseError.fromUnknownError(
              cause,
              "PostgreSQL connection check failed"
            ),
        })
        yield* Effect.log("Connected to PostgreSQL")
      } else {
        yield* Effect.logWarning(
          "Skipping PostgreSQL connection check (SKIP_DB_CHECK is set)"
        )
      }

      return { db, use } as const
    }),
  }
) {}
