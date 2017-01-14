import * as fs from 'fs';
import webpack from 'webpack';
import {
    PROJECT_ROOT,
    JS_REGEX,
    EXCLUDE_REGEX
} from './constants.babel';


const nodeModules = {};
fs.readdirSync('node_modules')
    .filter(function(x) {
        return ['.bin'].indexOf(x) === -1;
    })
    .forEach(function(mod) {
        nodeModules[mod] = 'commonjs ' + mod;
    });

export default {
    entry: {
        index: `${PROJECT_ROOT}/src/index.js`
    },
    target: 'node',
    devtool: 'sourcemap',
    externals: nodeModules,
    module: {
        preLoaders: [
            { test: JS_REGEX, exclude: EXCLUDE_REGEX, loader: 'eslint' }
        ],
        loaders: [
            { test: /\.json$/, loader: 'json-loader' },
            { test: JS_REGEX, exclude: EXCLUDE_REGEX, loader: 'babel-loader',
                query: {
                    presets: ['es2015'],
                    plugins: [
                        'transform-object-rest-spread',
                        'transform-es2015-parameters',
                        ['transform-es2015-classes', {
                            'loose': true
                        }]
                    ]
                }
            }
        ]
    },
    output: {
        path: `${ PROJECT_ROOT }dist/`,
        filename: '[name].js',
        chunkFilename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    plugins: [
        // Only emit files when there are no errors
        new webpack.NoErrorsPlugin(),
        // Minify all javascript, switch loaders to minimizing mode
        new webpack.optimize.UglifyJsPlugin(),
        // Dedupe modules in the output
        new webpack.optimize.DedupePlugin()
    ],
    // NodeJS options
    node: {
        console: true,
        __dirname: false,
        __filename: false,
    }
};
