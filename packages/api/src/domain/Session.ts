import { Clock, Context, Effect, pipe } from "effect/index"
import * as S from "effect/Schema"
import { User } from "./User.js"

export class Session extends S.Class<Session>("Session")({
  id: S.String,
  createdAt: S.Date,
  token: S.String,
  user: User,
}) {
  public static create = ({ token, user }: { token: string; user: User }) =>
    pipe(
      Clock.currentTimeMillis,
      Effect.map((ts) => new Date(ts)),
      Effect.map(
        (now) =>
          new Session({
            id: crypto.randomUUID(),
            createdAt: now,
            token,
            user,
          })
      )
    )
}

export class CurrentSession extends Context.Tag("CurrentSession")<
  CurrentSession,
  Session
>() {}
