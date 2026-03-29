import { HttpApiBuilder } from "@effect/platform"
import { Api } from "@stemma/api/Api"
import {
  BadRequestError,
  InternalServerError,
  InvalidCredentialsError,
} from "@stemma/api/domain/Errors"
import { CurrentSession } from "@stemma/api/domain/Session"
import { Effect } from "effect"
import { PasswordService } from "../../domain/PasswordService.js"
import { SessionRepository } from "../../domain/SessionRepository.js"
import { UserRepository } from "../../domain/UserRepository.js"

const mapDbError = Effect.mapError(() => new InternalServerError())

export const AuthGroupLive = HttpApiBuilder.group(Api, "Auth", (handlers) =>
  Effect.gen(function* () {
    const userRepo = yield* UserRepository
    const sessionRepo = yield* SessionRepository
    const passwordService = yield* PasswordService

    return handlers
      .handle("signup", ({ payload }) =>
        Effect.gen(function* () {
          const existing = yield* userRepo
            .findByEmail(payload.email)
            .pipe(mapDbError)
          if (existing) {
            return yield* new BadRequestError({
              message: "Email already used",
            })
          }
          const hashedPassword = yield* passwordService.hash(payload.password)
          const user = yield* userRepo
            .create({
              email: payload.email,
              name: payload.name,
              password: hashedPassword,
            })
            .pipe(mapDbError)
          const session = yield* sessionRepo.create(user.id).pipe(mapDbError)
          return session.token
        })
      )
      .handle("login", ({ payload }) =>
        Effect.gen(function* () {
          const result = yield* userRepo
            .findWithPasswordByEmail(payload.email)
            .pipe(mapDbError)
          if (!result) {
            return yield* new InvalidCredentialsError()
          }
          const valid = yield* passwordService.verify(
            payload.password,
            result.password
          )
          if (!valid) {
            return yield* new InvalidCredentialsError()
          }
          const session = yield* sessionRepo
            .create(result.user.id)
            .pipe(mapDbError)
          return session.token
        })
      )
      .handle("me", () =>
        Effect.gen(function* () {
          const session = yield* CurrentSession
          return session.user
        })
      )
      .handle("logout", () =>
        Effect.gen(function* () {
          const session = yield* CurrentSession
          yield* sessionRepo.deleteByToken(session.token).pipe(mapDbError)
        })
      )
  })
)
