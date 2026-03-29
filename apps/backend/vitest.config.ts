import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@m7famille/backend": path.join(__dirname, "src"),
    },
  },
})
