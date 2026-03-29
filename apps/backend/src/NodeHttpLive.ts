import { NodeHttpServer } from "@effect/platform-node"
import { Config, Effect, Layer } from "effect"
import { createServer } from "node:http"

export const NodeHttpLive = Config.number("BACKEND_PORT").pipe(
  Effect.map((port) =>
    Layer.tap(
      NodeHttpServer.layer(() => createServer(), { port }),
      () => Effect.logInfo(`Listening at http://localhost:${port}`)
    )
  ),
  Layer.unwrapEffect
)
