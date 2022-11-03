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

            contents = contents.replaceAll(
              'require.resolve("watchpack")',
              '""'
            );

            return { contents, loader: "js" };
          }
        );
      },
    }
  ],
});
