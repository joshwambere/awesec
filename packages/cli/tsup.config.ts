import { defineConfig } from "tsup";

export default defineConfig({
  entry: { awesec: "src/main.ts" },
  outDir: "dist",
  format: ["esm"],
  platform: "node",
  target: "node22",
  outExtension: () => ({ js: ".mjs" }),
  // Single self-contained file: workspace packages and npm deps are inlined,
  // so the runtime image needs no node_modules.
  noExternal: [/.*/],
  splitting: false,
  clean: true,
  dts: false,
  define: {
    __AWESEC_BUILD_SHA__: JSON.stringify(process.env.AWESEC_BUILD_SHA ?? "dev"),
    __AWESEC_CHANNEL__: JSON.stringify(process.env.AWESEC_CHANNEL ?? "dev"),
  },
  banner: {
    // commander is CommonJS; give its bundled require() calls a real require.
    js: [
      "#!/usr/bin/env node",
      'import { createRequire as __awesecCreateRequire } from "node:module";',
      "const require = __awesecCreateRequire(import.meta.url);",
    ].join("\n"),
  },
});
