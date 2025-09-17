const path = require('path');

module.exports = {
  mode: 'production',
  entry: {
    'endurance-test': './tests/endurance-test.ts',
    'load-test': './tests/load-test.ts',
    'spike-test': './tests/spike-test.ts',
    'stress-test': './tests/stress-test.ts',
    'volume-test': './tests/volume-test.ts',
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
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'web',
  externals: [/^k6(\/.*)?/],
};