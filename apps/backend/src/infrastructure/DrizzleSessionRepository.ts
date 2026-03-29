import { Session } from "@stemma/api/domain/Session"
import { User } from "@stemma/api/domain/User"
import { DrizzleClient } from "@stemma/db"
import { sessions, users } from "@stemma/db/schema"
import { eq } from "drizzle-orm"
import { Effect, Layer } from "effect"
import { SessionRepository } from "../domain/SessionRepository.js"

export const DrizzleSessionRepositoryLive = Layer.effect(
  SessionRepository,
  Effect.gen(function* () {
    const drizzle = yield* DrizzleClient

    return {
      create: (userId) =>
        drizzle.use((db) => {
          const token = crypto.randomUUID()
          return db
            .insert(sessions)
            .values({ token, userId })
            .returning({ token: sessions.token })
            .then((rows) => rows[0]!)
        }),

      findByToken: (token) =>
        drizzle
          .use((db) =>
            db
              .select()
              .from(sessions)
              .innerJoin(users, eq(sessions.userId, users.id))
              .where(eq(sessions.token, token))
              .then((rows) => rows[0] ?? null)
          )
          .pipe(
            Effect.map((row) => {
              if (!row) return null
              return new Session({
                id: row.sessions.id,
                createdAt: row.sessions.createdAt,
                token: row.sessions.token,
                user: new User({
                  id: row.users.id,
                  email: row.users.email,
                  name: row.users.name,
                  createdAt: row.users.createdAt,
                  updatedAt: row.users.updatedAt,
                }),
              })
            })
          ),

      deleteByToken: (token) =>
        drizzle
          .use((db) => db.delete(sessions).where(eq(sessions.token, token)))
          .pipe(Effect.asVoid),
    }
  })
)
