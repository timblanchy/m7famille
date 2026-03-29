import { Session } from "@m7famille/api/domain/Session"
import { User } from "@m7famille/api/domain/User"
import { Authorization } from "@m7famille/api/presentation/middlewares/Authorization"
import { Effect, Layer } from "effect"

export const AuthorizationMiddlewareLive = Layer.effect(
  Authorization,
  Effect.succeed({
    bearer: (_token) =>
      // TODO: implement real token validation
      Effect.succeed(
        new Session({
          id: crypto.randomUUID(),
          createdAt: new Date(),
          token: "placeholder",
          user: new User({
            id: "placeholder",
            email: "placeholder@example.com",
            name: "Placeholder",
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        })
      ),
  })
)
