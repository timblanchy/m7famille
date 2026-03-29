import { HttpApiBuilder } from "@effect/platform"
import type { ApiGroup } from "@effect/platform/HttpApiGroup"
import { Api } from "@m7famille/api/Api"
import { Family } from "@m7famille/api/domain/Family"
import type { Authorization } from "@m7famille/api/presentation/middlewares/Authorization"
import type { Layer } from "effect"
import { Effect } from "effect"

export const FamilyGroupLive: Layer.Layer<
  ApiGroup<"Api", "Family">,
  never,
  Authorization
> = HttpApiBuilder.group(Api, "Family", (handlers) =>
  Effect.succeed(
    handlers
      .handle(
        "create",
        ({ payload: _payload }) =>
          // TODO: implement real family creation
          Effect.void
      )
      .handle("get", ({ path }) =>
        // TODO: implement real family lookup
        Effect.succeed(
          new Family({
            id: path.id,
            name: "Placeholder Family",
            members: [],
            createdAt: new Date(),
          })
        )
      )
  )
)
