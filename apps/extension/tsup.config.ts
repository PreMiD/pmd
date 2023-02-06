import { defineConfig } from "tsup";
import fs from "fs";

export default defineConfig({
  target: "node16",
  entry: {
    extension: "src/extension.ts",
    "ts-loader": "node_modules/ts-loader/index.js",
  },
  external: ["vscode", "pnpapi", "uglify-js", "@swc/core"],
  minify: true,
  banner: {
    js: 'process.env.FORCE_COLOR = "2";',
  },
  esbuildPlugins: [
    {
      name: "webpack-patch",
      setup(build) {
        build.onLoad(
          { filter: /webpack\/lib\/config\/defaults.js$/ },
          async (args) => {
            let contents = await fs.promises.readFile(args.path, "utf8");

            contents = contents.replace(
              /require\.resolve\("watchpack"\)/g,
              '""'
            );

            return { contents, loader: "js" };
          }
        );
      },
    },
    {
      name: "presence-compiler-patch",
      setup(build) {
        build.onLoad(
          { filter: /PresenceCompiler.js$/ },
          async (args) => {
            let contents = await fs.promises.readFile(args.path, "utf8");

            contents = contents.replace(
              `[fileURLToPath(new URL("../../node_modules", ${"import.meta.url"}))]`,
              'undefined'
            );

            return { contents, loader: "js" };
          }
        );
      },
    }
  ],
});
