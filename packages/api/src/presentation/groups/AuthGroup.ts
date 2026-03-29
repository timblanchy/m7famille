import { HttpApiEndpoint, HttpApiGroup, OpenApi } from "@effect/platform/index"
import { Schema } from "effect"
import {
  BadRequestError,
  InternalServerError,
  InvalidCredentialsError,
  NotFoundError,
  UnauthorizedError,
} from "../../domain/Errors.js"
import { User } from "../../domain/User.js"
import { Authorization } from "../middlewares/Authorization.js"

const signup = HttpApiEndpoint.post("signup", "/signup")
  .setPayload(
    Schema.Struct({
      email: Schema.String,
      name: Schema.String,
      password: Schema.String,
    })
  )
  .addSuccess(Schema.UUID)
  .addError(BadRequestError)
  .annotate(OpenApi.Description, "Create a new account")

const login = HttpApiEndpoint.post("login", "/login")
  .setPayload(
    Schema.Struct({
      email: Schema.String,
      password: Schema.String,
    })
  )
  .addSuccess(Schema.UUID)
  .addError(InvalidCredentialsError)

const me = HttpApiEndpoint.get("me", "/me")
  .addSuccess(User)
  .addError(NotFoundError)
  .addError(UnauthorizedError)
  .annotate(OpenApi.Description, "Get the current user")
  .middleware(Authorization)

const logout = HttpApiEndpoint.post("logout", "/logout")
  .addSuccess(Schema.Void)
  .addError(UnauthorizedError)
  .annotate(OpenApi.Description, "Logout")
  .middleware(Authorization)

export const AuthGroup = HttpApiGroup.make("Auth")
  .add(signup)
  .add(login)
  .add(me)
  .add(logout)
  .addError(InternalServerError)
  .annotate(OpenApi.Description, "Authentication")
  .prefix("/auth")
