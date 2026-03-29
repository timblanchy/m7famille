import { Api } from "@m7famille/api/Api"
import { Member } from "@m7famille/api/domain/Member"
import type { Authorization } from "@m7famille/api/presentation/middlewares/Authorization"
import { HttpApiBuilder } from "@effect/platform"
import type { ApiGroup } from "@effect/platform/HttpApiGroup"
import { Option } from "effect"
import type { Layer } from "effect"
import { Effect } from "effect"

export const MemberGroupLive: Layer.Layer<
  ApiGroup<"Api", "Member">,
  never,
  Authorization
> = HttpApiBuilder.group(Api, "Member", (handlers) =>
  Effect.succeed(
    handlers
      .handle(
        "create",
        ({ payload: _payload }) =>
          // TODO: implement real member creation
          Effect.void
      )
      .handle("get", ({ path }) =>
        // TODO: implement real member lookup
        Effect.succeed(
          new Member({
            id: path.id,
            data: {
              gender: "M" as const,
              name: "Placeholder",
              birthDate: Option.none(),
            },
            rels: {
              parents: [],
              spouses: [],
              children: [],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        )
      )
  )
)
