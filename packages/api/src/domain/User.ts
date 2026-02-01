import * as S from "effect/Schema"

export class User extends S.Class<User>("User")({
  id: S.String,
  email: S.String,
  name: S.String,
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
