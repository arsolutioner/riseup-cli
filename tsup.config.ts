import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    cli: "src/cli.ts",
    index: "src/index.ts",
  },
  format: ["esm"],
  target: "node22",
  clean: true,
  dts: true,
  splitting: true,
  banner: { js: "#!/usr/bin/env node" },
});
