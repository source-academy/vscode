/***/
/**
 * Entrypoint to build files required by extension
 * - extension.js: The main extension file, entrypoint for VSC
 * - webview.js: Simple web-based script to be in the VSC webview, which embeds Source Academy's frontend as iframe
 *
 * To be called by `yarn run build:extension`
 */
/***/

// @ts-check: Show errors in this js file

const esbuild = require("esbuild");
const polyfillNode = require("esbuild-plugin-polyfill-node").polyfillNode;

const outputFolder = require("./utils").getOutputDir();

const extensionConfig = esbuild.context({
  entryPoints: ["./src/extension.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: `./${outputFolder}/extension.js`,
  sourcemap: true,
  external: ["vscode"],
});

const webviewConfig = esbuild.context({
  entryPoints: ["./src/webview/index.tsx"],
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: true,
  outfile: `./${outputFolder}/webview.js`,
  plugins: [
    polyfillNode({
      polyfills: {
        fs: true,
      },
      // globals: {
      //   __filename: true,
      //   __dirname: true,
      // }
    }),
  ],
  define: {
    // Needed for the web environment
    // Inject these globals manually as esbuild-plugin-polyfill-node is not doing it so
    __filename: JSON.stringify("/index.js"),
    __dirname: JSON.stringify("/"),
  },
});

main();

async function main() {
  if (process.argv.includes("--watch")) {
    await watch();
  } else {
    await build();
  }
  process.exit(0);
}

async function resolveContexts() {
  return await Promise.all([extensionConfig, webviewConfig]);
}

async function watch() {
  const [extensionContext, webviewContext] = await resolveContexts();
  extensionContext.watch();
  webviewContext.watch();
  console.log("Watching files...");
  await new Promise(() => {});
}

async function build() {
  const [extensionContext, webviewContext] = await resolveContexts();
  await Promise.all([extensionContext.rebuild(), webviewContext.rebuild()]);
  console.log("Builds completed successfully.");
}

// module.exports = { build, watch };
