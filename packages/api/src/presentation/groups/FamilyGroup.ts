import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform/index"
import { Schema } from "effect"
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../domain/Errors.js"
import { Family } from "../../domain/Family.js"
import { Authorization } from "../middlewares/Authorization.js"

const create = HttpApiEndpoint.post("create", "/")
  .setPayload(
    Schema.Struct({
      name: Schema.String,
    })
  )
  .addError(BadRequestError)
  .annotate(OpenApi.Description, "Create a new family")
  .middleware(Authorization)

const get = HttpApiEndpoint.get("get", "/:id")
  .setPath(Schema.Struct({ id: Schema.UUID }))
  .addSuccess(Family)
  .addError(NotFoundError)
  .addError(UnauthorizedError)
  .annotate(OpenApi.Description, "Get a family")
  .middleware(Authorization)

export const FamilyGroup = HttpApiGroup.make("Family")
  .add(create)
  .add(get)
  .addError(InternalServerError)
  .annotate(OpenApi.Description, "Family")
  .prefix("/family")
