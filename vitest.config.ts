import { defineConfig } from "vitest/config";

export default defineConfig({
  // Mirrors the tsup `define` defaults so source that reads build info runs under test.
  define: {
    __AWESEC_BUILD_SHA__: JSON.stringify("dev"),
    __AWESEC_CHANNEL__: JSON.stringify("dev"),
  },
  test: {
    include: ["packages/*/test/**/*.test.ts"],
  },
});
