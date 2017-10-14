const Babili = require('babili-webpack-plugin')
const path   = require('path')

module.exports = {
  entry: {
    app: './src/app.js',
    // gui: './src/gui.js',
    lib: './src/lib.js'
  },
  output: {
    filename: '[name].min.js',
    path: path.resolve(__dirname, 'dist', 'src')
  },
  plugins: [
    new Babili()
  ]
}
