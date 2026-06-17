import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/elements.ts"],
  format: ["esm", "cjs"],
  dts: true,          // generate .d.ts type definitions
  splitting: true,    // share the core chunk between both entries (no duplication)
  treeshake: true,
  sourcemap: true,
  clean: true,        // wipe dist/ before each build
  target: "es2021",
});
