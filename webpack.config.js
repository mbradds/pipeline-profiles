const path = require("path");
// const JsonMinimizerPlugin = require("json-minimizer-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;

module.exports = {
  mode: "production",
  target: "es5",
  entry: {
    ngtl_eng: "./src/index_files/ngtl_eng.js",
    ngtl_fra: "./src/index_files/ngtl_fra.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle_[name].js",
  },

  //plugins: [new BundleAnalyzerPlugin(),new JsonMinimizerPlugin()],

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js"],
    alias: {
      process: "process/browser",
    },
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
      vm: false,
      os: false,
      tty: false,
      constants: false,
      "crypto-browserify": false,
    },
  },
};
