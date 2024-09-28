/* eslint-disable @typescript-eslint/no-require-imports */
const webpack = require('webpack');

const config = {
  // // avoid the entire process.env being inserted into the service worker
  // // if SW_EXCLUDE_REGEXES is unset
  // const definePlugin = webpackConfig.plugins.find(
  //   plugin => plugin.constructor.name === 'DefinePlugin'
  // );
  // const inlineProcessEnv = definePlugin.definitions['process.env'];
  // if (!inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES) {
  //   inlineProcessEnv.REACT_APP_SW_EXCLUDE_REGEXES = undefined;
  // }
  //
  // const injectManifestPlugin = webpackConfig.plugins.find(
  //   plugin => plugin.constructor.name === 'InjectManifest'
  // );
  // if (injectManifestPlugin) {
  //   injectManifestPlugin.config.maximumFileSizeToCacheInBytes = 20 * 1024 * 1024;
  // }
  //
  // // add rules to pack WASM (for Sourceror)
  // const wasmExtensionRegExp = /\.wasm$/;
  // webpackConfig.resolve.extensions.push('.wasm');
  // webpackConfig.module.rules.forEach(rule => {
  //   (rule.oneOf || []).forEach(oneOf => {
  //     if (oneOf.type === 'asset/resource') {
  //       oneOf.exclude.push(wasmExtensionRegExp);
  //     }
  //   });
  // });
  entry: './src/index.tsx',

  // See https://webpack.js.org/configuration/experiments/#experiments.
  experiments: {
    syncWebAssembly: true
  },
  output: {
    webassemblyModuleFilename: 'static/[hash].module.wasm'
  },

  // Polyfill Node.js core modules.
  // An empty implementation (false) is provided when there is no browser equivalent.
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    fallback: {
      'child_process': false,
      'constants': require.resolve('constants-browserify'),
      'fs': false,
      'http': require.resolve('stream-http'),
      'https': require.resolve('https-browserify'),
      'os': require.resolve('os-browserify/browser'),
      'path/posix': require.resolve('path-browserify'),
      'process/browser': require.resolve('process/browser'),
      'stream': require.resolve('stream-browserify'),
      'timers': require.resolve('timers-browserify'),
      'url': require.resolve('url/'),
    },
  },

  // workaround .mjs files by Acorn
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,   // Match .js and .jsx files
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.(ts|tsx)$/,   // Match .ts and .tsx files (if using TypeScript)
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.css$/,        // Optional: CSS handling
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto',
        resolve: {
          fullySpecified: false
        },
      },
    ],

    // Workaround to suppress warnings caused by ts-morph in js-slang
    noParse: /node_modules\/@ts-morph\/common\/dist\/typescript\.js$/,
  },

  ignoreWarnings: [{ 
    // Ignore warnings for dependencies that do not ship with a source map.
    // This is because we cannot do anything about our dependencies.
    module: /node_modules/,
    message: /Failed to parse source map/
  }, {
    // Ignore the warnings that occur because js-slang uses dynamic imports
    // to load Source modules
    module: /js-slang\/dist\/modules\/loader\/loaders.js/,
    message: /Critical dependency: the request of a dependency is an expression/
  }],

  plugins: [
    // ...webpackConfig.plugins,
    // Make environment variables available in the browser by polyfilling the 'process' Node.js module.
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
    // Make the 'buffer' Node.js module available in the browser.
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
}

const ignoreModulePaths = (...paths) => {
  const moduleRoot = replaceSlashes('/node_modules/');
  const modulePaths = paths
    .map(replaceSlashes)
    .map(path => `(${path}[/\\\\.*])`)
    .join('|');
  return moduleRoot + '(?!' + modulePaths + ').*.(js|jsx|ts|tsx)$';
};
const replaceSlashes = target => {
  return target.replaceAll('/', '[/\\\\]');
};

module.exports = config;

