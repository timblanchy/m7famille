import type { User } from "@stemma/api/domain/User"
import type { DatabaseError } from "@stemma/db"
import { Context, type Effect } from "effect"

export interface IUserRepository {
  readonly findById: (id: string) => Effect.Effect<User | null, DatabaseError>
  readonly findByEmail: (
    email: string
  ) => Effect.Effect<User | null, DatabaseError>
  readonly create: (params: {
    email: string
    password: string
    name: string
  }) => Effect.Effect<User, DatabaseError>
}

export class UserRepository extends Context.Tag("UserRepository")<
  UserRepository,
  IUserRepository
>() {}
