import { HttpApiMiddleware } from "@effect/platform"

export class Logger extends HttpApiMiddleware.Tag<Logger>()(
  "Http/Logger",
  {}
) {}
