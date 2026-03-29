import bcrypt from "bcryptjs"
import { Effect, Layer } from "effect"
import { PasswordService } from "../domain/PasswordService.js"

const SALT_ROUNDS = 10

export const BcryptPasswordServiceLive = Layer.succeed(PasswordService, {
  hash: (password) => Effect.promise(() => bcrypt.hash(password, SALT_ROUNDS)),
  verify: (password, hash) =>
    Effect.promise(() => bcrypt.compare(password, hash)),
})
