import { HttpApiBuilder } from "@effect/platform"
import type { ApiGroup } from "@effect/platform/HttpApiGroup"
import { Api } from "@stemma/api/Api"
import { User } from "@stemma/api/domain/User"
import type { Authorization } from "@stemma/api/presentation/middlewares/Authorization"
import type { Layer } from "effect"
import { Effect } from "effect"

export const AuthGroupLive: Layer.Layer<
  ApiGroup<"Api", "Auth">,
  never,
  Authorization
> = HttpApiBuilder.group(Api, "Auth", (handlers) =>
  Effect.succeed(
    handlers
      .handle("login", () =>
        // TODO: implement real login
        Effect.succeed(crypto.randomUUID())
      )
      .handle("me", () =>
        // TODO: implement real user lookup
        Effect.succeed(
          new User({
            id: crypto.randomUUID(),
            email: "placeholder@example.com",
            name: "Placeholder",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        )
      )
      .handle(
        "logout",
        () =>
          // TODO: implement real logout
          Effect.void
      )
  )
)
