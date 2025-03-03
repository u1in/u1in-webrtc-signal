const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const nodeExternals = require("webpack-node-externals");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  target: "node",
  mode: "production",
  entry: path.join(__dirname, "../server/index.js"),
  output: {
    path: path.resolve(__dirname, "../output"),
    filename: "server.js",
  },

  externalsPresets: { node: true },
  externals: [nodeExternals()],

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
          },
        },
      },
    ],
  },

  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(__dirname, "../server/config.json"),
          to: path.join(__dirname, "../output/config.json"),
        },
        {
          from: path.join(__dirname, "../demo/demo.html"),
          to: path.join(__dirname, "../output/dist/demo.html"),
        },
        {
          from: path.join(__dirname, "../package.json"),
          to: path.join(__dirname, "../output/package.json"),
        },
      ],
    }),
  ],

  optimization: {
    minimize: false,
  },
  node: {
    __dirname: false,
    __filename: false,
  },
};
