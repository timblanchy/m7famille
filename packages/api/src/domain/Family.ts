import * as S from "effect/Schema"

export class Family extends S.Class<Family>("Family")({
  id: S.UUID,
  name: S.String,
  members: S.Array(S.UUID),
  createdAt: S.Date,
}) {}
