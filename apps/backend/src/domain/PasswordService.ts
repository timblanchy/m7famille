import { Context, type Effect } from "effect"

export interface IPasswordService {
  readonly hash: (password: string) => Effect.Effect<string>
  readonly verify: (password: string, hash: string) => Effect.Effect<boolean>
}

export class PasswordService extends Context.Tag("PasswordService")<
  PasswordService,
  IPasswordService
>() {}
