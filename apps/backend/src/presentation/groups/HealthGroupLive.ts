import { HttpApiBuilder } from "@effect/platform"
import { Api } from "@m7famille/api/Api"
import { Effect } from "effect"

export const HealthGroupLive = HttpApiBuilder.group(Api, "Health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("OK"))
)
