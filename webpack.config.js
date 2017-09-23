const Babili  = require('babili-webpack-plugin')
const webpack = require('webpack')
const path    = require('path')

module.exports = {
  entry: {
    app: './src/app.js',
    // gui: './src/gui.js',
    lib: './src/lib.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist')
  },
  plugins: [
    new Babili()
  ]
}
