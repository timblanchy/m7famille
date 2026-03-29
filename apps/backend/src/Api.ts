import { HttpApiBuilder, HttpApiSwagger } from "@effect/platform"
import { NodeRuntime } from "@effect/platform-node"
import { Api } from "@m7famille/api/Api"
import { DrizzleClient } from "@m7famille/db"
import {
  Config,
  Effect,
  FiberRef,
  Layer,
  Logger,
  LogLevel,
  Option,
} from "effect"
import { DrizzleUserRepositoryLive } from "./infrastructure/DrizzleUserRepository.js"
import { NodeHttpLive } from "./NodeHttpLive.js"
import { AuthGroupLive } from "./presentation/groups/AuthGroupLive.js"
import { FamilyGroupLive } from "./presentation/groups/FamilyGroupLive.js"
import { HealthGroupLive } from "./presentation/groups/HealthGroupLive.js"
import { MemberGroupLive } from "./presentation/groups/MemberGroupLive.js"
import { AuthorizationMiddlewareLive } from "./presentation/middlewares/AuthorizationMiddlewareLive.js"
import { CorsMiddlewareLive } from "./presentation/middlewares/CorsMiddlewareLive.js"
import { LoggerMiddlewareLive } from "./presentation/middlewares/LoggerMiddlewareLive.js"

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthGroupLive),
  Layer.provide(AuthGroupLive),
  Layer.provide(FamilyGroupLive),
  Layer.provide(MemberGroupLive),
  Layer.provide(LoggerMiddlewareLive),
  Layer.provide(AuthorizationMiddlewareLive),
  Layer.provide(DrizzleUserRepositoryLive),
  Layer.provide(DrizzleClient.Default)
)

const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(CorsMiddlewareLive),
  Layer.provide(HttpApiSwagger.layer()),
  Layer.provide(ApiLive),
  Layer.provide(NodeHttpLive)
)

const LogLevelMap: Record<string, LogLevel.LogLevel> = {
  TRACE: LogLevel.Trace,
  DEBUG: LogLevel.Debug,
  INFO: LogLevel.Info,
  WARN: LogLevel.Warning,
  WARNING: LogLevel.Warning,
  ERROR: LogLevel.Error,
  FATAL: LogLevel.Fatal,
  ALL: LogLevel.All,
  NONE: LogLevel.None,
  OFF: LogLevel.None,
}

const level = Config.string("LOG_LEVEL").pipe(
  Effect.catchAll(() => Effect.succeed("info")),
  Effect.map((level) => LogLevelMap[level.toUpperCase()] ?? LogLevel.Info)
)

level.pipe(
  Effect.flatMap((logLevel) =>
    Layer.launch(ServerLive).pipe(
      Logger.withMinimumLogLevel(logLevel),
      Effect.locally(
        FiberRef.unhandledErrorLogLevel,
        Option.some(LogLevel.Error)
      )
    )
  ),
  NodeRuntime.runMain
)
