const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: [
    'react-hot-loader/patch',
    path.resolve(__dirname, 'client/js/index.jsx')
  ],
  devServer: {
    hot: true,
    contentBase: path.resolve(__dirname, 'dist'),
    historyApiFallback: true
  },
  resolve: {
    extensions: ['.jsx', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: { loader: 'babel-loader' }
    }, {
      test: /\.scss$/,
      use: [
        'style-loader',
        {
          loader: 'css-loader',
          options: {
            sourceMap: true
          }
        },
        'sass-loader',
        {
          loader: 'sass-resources-loader',
          options: {
            resources: [path.resolve(__dirname, 'client/styles/_variables.scss')]
          }
        }
      ]   
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'client/static/index.html')
    })
  ]
};
