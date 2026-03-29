import type { Session } from "@stemma/api/domain/Session"
import type { DatabaseError } from "@stemma/db"
import { Context, type Effect } from "effect"

export interface ISessionRepository {
  readonly create: (
    userId: string
  ) => Effect.Effect<{ token: string }, DatabaseError>
  readonly findByToken: (
    token: string
  ) => Effect.Effect<Session | null, DatabaseError>
  readonly deleteByToken: (token: string) => Effect.Effect<void, DatabaseError>
}

export class SessionRepository extends Context.Tag("SessionRepository")<
  SessionRepository,
  ISessionRepository
>() {}
