'use-strict';

const path = require('path');
const ManifestPlugin = require('webpack-manifest-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');
const cssnano = require('cssnano');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const { StatsWriterPlugin } = require('webpack-stats-plugin');
const { paletteAsSass } = require('./scripts/pasteup-sass');
const { getClassName } = require('./scripts/css');
const entryPoints = require('./webpack.entryPoints');

const cssLoaders = [{
  loader: 'postcss-loader',
  options: {
    plugins: [
      pxtorem({ propList: ['*'] }),
      autoprefixer(),
    ],
  },
},
{
  loader: 'fast-sass-loader',
  options: {
    transformers: [
      {
        extensions: ['.pasteupimport'],
        transform: (rawFile) => {
          if (rawFile.includes('use palette')) {
            return paletteAsSass();
          }
          throw new Error(`Invalid .pasteupimport – ${rawFile}`);
        },
      },
    ],
    includePaths: [
      path.resolve(__dirname, 'assets'),
      path.resolve(__dirname),
    ],
  },
}];

// Hide mini-css-extract-plugin spam logs
class CleanUpStatsPlugin {
  // eslint-disable-next-line class-methods-use-this
  shouldPickStatChild(child) {
    return child.name.indexOf('mini-css-extract-plugin') !== 0;
  }

  apply(compiler) {
    compiler.hooks.done.tap('CleanUpStatsPlugin', (stats) => {
      const { children } = stats.compilation;
      if (Array.isArray(children)) {
        // eslint-disable-next-line no-param-reassign
        stats.compilation.children = children
          .filter(child => this.shouldPickStatChild(child));
      }
    });
  }
}

module.exports = (cssFilename, outputFilename, minimizeCss) => ({
  plugins: [
    new ManifestPlugin({
      fileName: '../../conf/assets.map',
      writeToFileEmit: true,
    }),
    new StatsWriterPlugin({
      filename: 'stats.json',
      fields: null,
    }),
    new MiniCssExtractPlugin({
      filename: path.join('stylesheets', cssFilename),
    }),
    ...(minimizeCss ? [new OptimizeCssAssetsPlugin({
      cssProcessor: cssnano,
      cssProcessorPluginOptions: {
        preset: 'default',
      },
      canPrint: true,
    })] : []),
    new CleanUpStatsPlugin(),
  ],

  context: path.resolve(__dirname, 'assets'),

  entry: entryPoints.common,

  output: {
    path: path.resolve(__dirname, 'public/compiled-assets'),
    chunkFilename: 'webpack/[chunkhash].js',
    filename: `javascripts/${outputFilename}`,
    publicPath: '/assets/',
  },

  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      ophan: 'ophan-tracker-js/build/ophan.support',
    },
    modules: [
      path.resolve(__dirname, 'assets'),
      path.resolve(__dirname, 'node_modules'),
    ],
    extensions: ['.js', '.jsx'],
  },

  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: [
          {
            test: /node_modules/,
            exclude: [
              /@guardian\/(?!(automat-modules))/,
            ],
          },
        ],
        loader: 'babel-loader',
      },
      {
        test: /\.(png|jpg|gif|ico)$/,
        loader: 'file-loader?name=[path][name].[hash].[ext]',
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'react-svg-loader',
            options: {
              svgo: {
                plugins: [
                  { removeTitle: true },
                ],
                floatPrecision: 2,
              },
              jsx: true,
            },
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2)$/,
        loader: 'file-loader?name=[path][name].[ext]',
      },
      {
        test: /\.scss$/,
        exclude: /\.module.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          ...cssLoaders,
        ],
      },
      {
        test: /\.module.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: true,
              getLocalIdent: (context, localIdentName, localName) => getClassName(
                path.relative(__dirname, context.resourcePath),
                localName,
              ),
            },
          },
          ...cssLoaders,
        ],
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
          },
          ...cssLoaders,
        ],
      },
    ],
  },
});
