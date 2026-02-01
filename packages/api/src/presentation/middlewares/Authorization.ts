import { HttpApiMiddleware, HttpApiSecurity, OpenApi } from "@effect/platform"
import { UnauthorizedError } from "../../domain/Errors.js"
import { CurrentSession } from "../../domain/Session.js"

export class Authorization extends HttpApiMiddleware.Tag<Authorization>()(
  "Authorization",
  {
    failure: UnauthorizedError,
    provides: CurrentSession,
    security: {
      bearer: HttpApiSecurity.bearer.pipe(
        HttpApiSecurity.annotate(OpenApi.Description, "Bearer token")
      ),
    },
  }
) {}
