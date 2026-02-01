import * as S from "effect/Schema"

export class Member extends S.Class<Member>("Member")({
  id: S.String,
  name: S.String,
  birthDate: S.Option(S.Date),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
