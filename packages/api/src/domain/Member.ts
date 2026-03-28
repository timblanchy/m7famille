import * as S from "effect/Schema"

export class Member extends S.Class<Member>("Member")({
  id: S.UUID,
  data: S.Struct({
    gender: S.Literal("M", "F"),
    name: S.String,
    birthDate: S.Option(S.Date),
  }),
  rels: S.Struct({
    parents: S.Array(S.UUID),
    spouses: S.Array(S.UUID),
    children: S.Array(S.UUID),
  }),
  createdAt: S.Date,
  updatedAt: S.Date,
}) {}
