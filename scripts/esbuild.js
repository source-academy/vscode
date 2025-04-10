// @ts-check: Show errors in this js file
const esbuild = require("esbuild");
const polyfillNode = require("esbuild-plugin-polyfill-node").polyfillNode;

const extensionConfig = esbuild.context({
  entryPoints: ["./src/extension.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: "./out/extension.js",
  sourcemap: true,
  external: ["vscode"],
});

const webviewConfig = esbuild.context({
  entryPoints: ["./src/webview/index.tsx"],
  bundle: true,
  format: "esm",
  platform: "browser",
  sourcemap: true,
  outfile: "./out/webview.js",
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

async function resolveContexts() {
  return await Promise.all([extensionConfig, webviewConfig]);
}

async function watch() {
  const [extensionContext, webviewContext] = await resolveContexts();
  extensionContext.watch();
  webviewContext.watch();
  console.log("Watching files...");
}

async function build() {
  const [extensionContext, webviewContext] = await resolveContexts();
  await Promise.all([extensionContext.rebuild(), webviewContext.rebuild()]);
  console.log("Builds completed successfully.");
}

module.exports = { build };

if (require.main === module) {
  if (process.argv.includes("--watch")) {
    watch();
  } else {
    build();
  }
}
