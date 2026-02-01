import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform/index"
import { Schema } from "effect"
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../domain/Errors.js"
import { Member } from "../../domain/Member.js"
import { Authorization } from "../middlewares/Authorization.js"

const create = HttpApiEndpoint.post("create", "/")
  .setPayload(
    Schema.Struct({
      name: Schema.String,
      birthDate: Schema.Option(Schema.Date),
    })
  )
  .addError(BadRequestError)
  .annotate(OpenApi.Description, "Create a new member")
  .middleware(Authorization)

const get = HttpApiEndpoint.get("get", "/:id")
  .setPath(Schema.Struct({ id: Schema.UUID }))
  .addSuccess(Member)
  .addError(NotFoundError)
  .addError(UnauthorizedError)
  .annotate(OpenApi.Description, "Get a member")
  .middleware(Authorization)

export const MemberGroup = HttpApiGroup.make("Member")
  .add(create)
  .add(get)
  .addError(InternalServerError)
  .annotate(OpenApi.Description, "Member")
  .prefix("/member")
