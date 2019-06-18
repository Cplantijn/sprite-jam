const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, 'client/index.jsx'),
  devServer: {
    hot: true,
    writeToDisk: (filePath) => {
      return /\/assets\/.*/.test(filePath);
    },
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
      template: path.resolve(__dirname, 'client/static/index.html'),
      inject: false
    }),
    new CopyPlugin([{
      from: path.resolve(__dirname, 'client/assets'),
      to: 'assets'
    }])
  ]
};
