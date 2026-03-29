import { User } from "@stemma/api/domain/User"
import { DrizzleClient } from "@stemma/db"
import { users } from "@stemma/db/schema"
import { eq } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { UserRepository } from "../domain/UserRepository.js"

const toUser = (row: typeof users.$inferSelect): User =>
  new User({
    id: row.id,
    email: row.email,
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })

export const DrizzleUserRepositoryLive = Layer.effect(
  UserRepository,
  Effect.gen(function* () {
    const drizzle = yield* DrizzleClient

    return {
      findById: (id) =>
        drizzle
          .use((db) =>
            db
              .select()
              .from(users)
              .where(eq(users.id, id))
              .then((rows) => rows[0] ?? null)
          )
          .pipe(Effect.map((row) => (row ? toUser(row) : null))),

      findByEmail: (email) =>
        drizzle
          .use((db) =>
            db
              .select()
              .from(users)
              .where(eq(users.email, email))
              .then((rows) => rows[0] ?? null)
          )
          .pipe(Effect.map((row) => (row ? toUser(row) : null))),

      create: (params) =>
        drizzle
          .use((db) =>
            db
              .insert(users)
              .values(params)
              .returning()
              .then((rows) => rows[0]!)
          )
          .pipe(Effect.map(toUser)),
    }
  })
)
