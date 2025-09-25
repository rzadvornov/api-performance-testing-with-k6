const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'volume-test': './tests/volume-test.ts',
    'stress-test': './tests/stress-test.ts',
    'spike-test': './tests/spike-test.ts',
    'load-test': './tests/load-test.ts',
    'endurance-test': './tests/endurance-test.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs',
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
  externals: [/^k6(\/.*)?/,],
};