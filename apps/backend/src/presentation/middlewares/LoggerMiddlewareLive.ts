import { Logger } from "@m7famille/api/presentation/middlewares/Logger"
import { HttpServerRequest } from "@effect/platform"
import { Effect, Layer } from "effect"

const logger = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  if (request.url.endsWith("/health")) {
    return
  }
  yield* Effect.logDebug(`Request: ${request.method} ${request.url}`)
})

export const LoggerMiddlewareLive = Layer.effect(Logger, Effect.succeed(logger))
