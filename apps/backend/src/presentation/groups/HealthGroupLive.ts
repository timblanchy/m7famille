import { Api } from "@m7famille/api/Api"
import { HttpApiBuilder } from "@effect/platform"
import { Effect } from "effect"

export const HealthGroupLive = HttpApiBuilder.group(Api, "Health", (handlers) =>
  handlers.handle("health", () => Effect.succeed("OK"))
)
