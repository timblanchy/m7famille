import argon2 from "argon2"
import { Config, Effect, Layer } from "effect"
import crypto from "node:crypto"
import { PasswordService } from "../domain/PasswordService.js"

const pepperConfig = Config.string("PASSWORD_PEPPER")

export const Argon2PasswordServiceLive = Layer.effect(
  PasswordService,
  Effect.map(pepperConfig, (pepper) => ({
    hash: (password: string) =>
      Effect.promise(() =>
        argon2.hash(applyPepper(password, pepper), {
          type: argon2.argon2id,
          memoryCost: 19456, // ~19 MB, per OWASP recommendation
          timeCost: 2,
          parallelism: 1,
        })
      ),
    verify: (password: string, hash: string) =>
      Effect.promise(() => argon2.verify(hash, applyPepper(password, pepper))),
  }))
)

function applyPepper(password: string, pepper: string): string {
  return crypto.createHmac("sha256", pepper).update(password).digest("base64")
}
