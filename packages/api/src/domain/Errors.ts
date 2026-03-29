import { HttpApiSchema } from "@effect/platform"
import { Schema } from "effect"
import { ParseError } from "effect/ParseResult"

const getUnknownErrorMessage = (e: unknown): string => {
  if (e instanceof Error) {
    return e.message
  }
  return `Unknown error: ${e}`
}

export class InternalServerError extends Schema.TaggedError<InternalServerError>()(
  "InternalServerError",
  {},
  HttpApiSchema.annotations({ status: 500 })
) {}

export class NotFoundError extends Schema.TaggedError<NotFoundError>()(
  "NotFoundError",
  {},
  HttpApiSchema.annotations({ status: 404 })
) {}

export class BadRequestError extends Schema.TaggedError<BadRequestError>()(
  "BadRequestError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 400 })
) {}

export class UnauthorizedError extends Schema.TaggedError<UnauthorizedError>()(
  "UnauthorizedError",
  {},
  HttpApiSchema.annotations({ status: 401 })
) {}

export class ExternalServiceError extends Schema.TaggedError<ExternalServiceError>()(
  "ExternalServiceError",
  { message: Schema.String },
  HttpApiSchema.annotations({ status: 503 })
) {
  static fromUnknownError = (
    e: unknown,
    context?: string
  ): ExternalServiceError =>
    new ExternalServiceError({
      message: context
        ? `${context}: ${getUnknownErrorMessage(e)}`
        : getUnknownErrorMessage(e),
    })
  static fromParseError = (e: ParseError): ExternalServiceError =>
    new ExternalServiceError({ message: e.toString() })
}
