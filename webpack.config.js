const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
//   .BundleAnalyzerPlugin;
// const TerserPlugin = require("terser-webpack-plugin");

// deal with multiple html files
function generateHtmlPlugins() {
  const htmlFileNames = ["enbridge_mainline.html", "ngtl.html", "tcpl.html"];
  return htmlFileNames.map((name) => {
    return new HtmlWebpackPlugin({
      filename: `html/en/${name}`,
      chunks: [`js/en/${name.split(".")[0]}`],
      template: "src/profile_en.html",
      publicPath: "../..",
      minify: false,
    });
  });
}

module.exports = {
  // mode: "development",
  mode: "production",
  target: "es5",
  entry: {
    "js/en/ngtl": "./src/index_files/en/ngtl.js",
    "js/en/tcpl": "./src/index_files/en/tcpl.js",
    "js/en/enbridge_mainline": "./src/index_files/en/enbridge_mainline.js",
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    //filename: '[name].[contenthash].js', // adds a unique hash for caching
    publicPath: "/",
  },

  devServer: {
    compress: true,
  },

  // plugins: [
  //   new BundleAnalyzerPlugin()
  // ],

  plugins: generateHtmlPlugins(),

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
  },

  // optimization: {
  //   minimize: true,
  //   minimizer: [new TerserPlugin()],
  // },
};
