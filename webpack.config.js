const path = require("path");

module.exports = {
  mode: "production",
  devtool: "source-map",
  entry: {
    background: './src/background.ts',
    blocker: './src/blocker.ts',
    options: './src/options.tsx',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, "js")
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
