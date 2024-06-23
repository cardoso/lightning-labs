import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import fs from "fs/promises";
export default defineConfig([{
  input: {"index": "src/index.ts", "node/plugins/index": "src/node/plugins/index.ts", "node/plugins/index-html": "src/node/plugins/index-html.ts"},
  output: [
    {
      sourcemap: true,
      dir: "dist",
      format: "es",
    },
  ],
  external: ["@lwc/engine-dom", '@lwc/engine-server', "@web/test-runner-commands", "node:fs/promises", "node:path", "node:url", "@lwc/metadata", "@web/dev-server", "chrome-launcher", "minimist", "puppeteer-core", "@lwc/wds-core/node", "resolve"],
  plugins: [
    // @ts-expect-error
    typescript({
      tsconfig: "./tsconfig.json"
    }),
    // copy src/browser to dist/browser
    {
      name: "copy-browser",
      async generateBundle() {
        await fs.mkdir("dist/browser", { recursive: true });
        await fs.cp("src/browser", "dist/browser", { recursive: true });
      }
    }

  ]
}]);
