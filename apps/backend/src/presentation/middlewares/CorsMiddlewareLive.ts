import { HttpApiBuilder } from "@effect/platform"
import { Config, Effect, Layer } from "effect"

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:3030"]

export const CorsMiddlewareLive = Layer.unwrapEffect(
  Effect.gen(function* () {
    const envOrigins = yield* Config.array(
      Config.string(),
      "ALLOWED_ORIGINS"
    ).pipe(Effect.catchAll(() => Effect.succeed([])))

    const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...envOrigins]

    return HttpApiBuilder.middlewareCors({
      allowedOrigins,
      allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "Accept",
        "Accept-Language",
        "Accept-Encoding",
        "b3",
        "x-b3-traceid",
        "x-b3-spanid",
        "x-b3-parentspanid",
        "x-b3-sampled",
        "x-b3-flags",
        "traceparent",
        "tracestate",
      ],
      exposedHeaders: ["Content-Type", "Authorization"],
      maxAge: 600,
      credentials: true,
    })
  })
)
