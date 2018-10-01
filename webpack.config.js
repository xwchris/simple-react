const path = require('path');

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  entry: './src/index.js',
  output: {
    filename: 'ereact.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'ereact',
    libraryTarget: 'umd'
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        loader: 'babel-loader'
      }
    ]
  }
}
