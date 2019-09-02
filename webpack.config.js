var data = require('./package.json');
var Build = require('@jupyterlab/buildutils').Build;

var names = Object.keys(data.dependencies).filter(function(name) {
  var packageData = require(name + '/package.json');
  return packageData.jupyterlab !== undefined;
});

var extras = Build.ensureAssets({
  packageNames: names,
  output: './build'
});

module.exports = [
  {
    entry: ['whatwg-fetch', './lib/index.js'],
    output: {
      path:require('path').join(__dirname, 'clarity','static'),
      filename: 'bundle.js'
    },
    node: {
      fs: 'empty'
    },
    bail: true,
    devtool: 'source-map',
    mode: 'development',
    module: {
      rules: [
        { test: /\.css$/, use: ['style-loader', 'css-loader'] },
        { test: /\.html$/, use: 'file-loader' },
        { test: /\.md$/, use: 'raw-loader' },
        { test: /\.(jpg|png|gif)$/, use: 'file-loader' },
        { test: /\.js.map$/, use: 'file-loader' },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          use: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          use: 'url-loader?limit=10000&mimetype=application/font-woff'
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          use: 'url-loader?limit=10000&mimetype=application/octet-stream'
        },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, use: 'file-loader' },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          use: 'url-loader?limit=10000&mimetype=image/svg+xml'
        }
      ]
    }
  }
].concat(extras);


// module.exports = {
//   entry: ['./lib/index.js'],
//   output: {
//     path:require('path').join(__dirname, 'clarity','static'),
//     filename: 'bundle.js'
//   },
//   mode: 'development',
//   module: {
//     rules: [
//       { test: /\.css$/, use: ['style-loader', 'css-loader'] },
//       { test: /\.html$/, use: 'file-loader' },
//       { test: /\.md$/, use: 'raw-loader' },
//       { test: /\.js.map$/, use: 'file-loader' },
//       {
//         test: /\.svg/,
//         use: [
//           { loader: 'svg-url-loader', options: {} },
//           { loader: 'svgo-loader', options: { plugins: [] } }
//         ]
//       },
//       {
//         test: /\.(png|jpg|gif|ttf|woff|woff2|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
//         use: [{ loader: 'url-loader', options: { limit: 10000 } }]
//       }
//     ]
//   }
// }