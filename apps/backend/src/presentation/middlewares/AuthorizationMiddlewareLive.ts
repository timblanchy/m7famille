import { UnauthorizedError } from "@stemma/api/domain/Errors"
import { Authorization } from "@stemma/api/presentation/middlewares/Authorization"
import { Effect, Layer, Redacted } from "effect"
import { SessionRepository } from "../../domain/SessionRepository.js"

export const AuthorizationMiddlewareLive = Layer.effect(
  Authorization,
  Effect.gen(function* () {
    const sessionRepo = yield* SessionRepository

    return {
      bearer: (token) =>
        sessionRepo.findByToken(Redacted.value(token)).pipe(
          Effect.flatMap((session) =>
            session
              ? Effect.succeed(session)
              : Effect.fail(new UnauthorizedError())
          ),
          Effect.catchTag("DatabaseError", (e) =>
            Effect.logError("Database error in auth middleware", e).pipe(
              Effect.flatMap(() => Effect.fail(new UnauthorizedError()))
            )
          )
        ),
    }
  })
)
