const path = require("path");

module.exports = {
  target: "web",
  mode: "development",
  entry: {
    signal: path.join(__dirname, "../client/index.js"),
  },
  output: {
    path: path.resolve(__dirname, "../output/dist"),
    filename: "[name].min.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3.33,
                },
              ],
            ],
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  optimization: {
    minimize: true,
    splitChunks: false,
  },
};
