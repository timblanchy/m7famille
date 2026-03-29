//  @ts-check

import { config as eslintConfig } from "@stemma/eslint-config/base"
import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  ...eslintConfig,
  {
    rules: {
      "import/consistent-type-specifier-style": "off",
    },
  },
  {
    ignores: ["eslint.config.js"],
  },
]
