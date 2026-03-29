import { HttpApi } from "@effect/platform"
import { AuthGroup } from "./presentation/groups/AuthGroup.js"
import { FamilyGroup } from "./presentation/groups/FamilyGroup.js"
import { HealthGroup } from "./presentation/groups/HealthGroup.js"
import { MemberGroup } from "./presentation/groups/MemberGroup.js"
import { Logger } from "./presentation/middlewares/Logger.js"

export const Api = HttpApi.make("Api")
  .add(HealthGroup)
  .add(AuthGroup)
  .add(FamilyGroup)
  .add(MemberGroup)
  .prefix("/v1")
  .middleware(Logger)
