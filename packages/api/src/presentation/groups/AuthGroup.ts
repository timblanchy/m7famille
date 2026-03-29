import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform/index"
import { Schema } from "effect"
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from "../../domain/Errors.js"
import { User } from "../../domain/User.js"
import { Authorization } from "../middlewares/Authorization.js"

const login = HttpApiEndpoint.post("login", "/login")
  .addSuccess(Schema.UUID)
  .addError(UnauthorizedError)

const me = HttpApiEndpoint.get("me", "/me")
  .addSuccess(User)
  .addError(NotFoundError)
  .addError(UnauthorizedError)
  .annotate(OpenApi.Description, "Get the current user")
  .middleware(Authorization)

const logout = HttpApiEndpoint.post("logout", "/logout")
  .addSuccess(Schema.Void)
  .addError(NotFoundError)
  .addError(BadRequestError)
  .annotate(OpenApi.Description, "Logout")
  .middleware(Authorization)

export const AuthGroup = HttpApiGroup.make("Auth")
  .add(login)
  .add(me)
  .add(logout)
  .addError(InternalServerError)
  .annotate(OpenApi.Description, "Authentication")
  .prefix("/auth")
