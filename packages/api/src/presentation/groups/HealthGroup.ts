import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform"
import { Schema } from "effect"
import { InternalServerError } from "../../domain/Errors.js"

const getHealth = HttpApiEndpoint.get("health", "/health").addSuccess(
  Schema.String
)

export const HealthGroup = HttpApiGroup.make("Health")
  .add(getHealth)
  .addError(InternalServerError)
