import { Config, Effect, Redacted } from "effect"

export class AppConfig extends Effect.Service<AppConfig>()("AppConfig", {
  effect: Effect.all({
    backendPort: Config.number("BACKEND_PORT"),
    databaseUrl: Config.redacted("DATABASE_URL"),
    passwordPepper: Config.redacted("PASSWORD_PEPPER"),
  }).pipe(
    Effect.tap(({ backendPort, databaseUrl }) =>
      Effect.logInfo(
        `Config loaded — port=${backendPort}, db=${Redacted.value(databaseUrl).replace(/\/\/.*@/, "//***@")}`
      )
    )
  ),
}) {}
