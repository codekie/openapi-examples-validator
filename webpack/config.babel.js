import * as fs from 'fs';
import webpack from 'webpack';
import {
    PROJECT_ROOT,
    JS_REGEX,
    EXCLUDE_REGEX
} from './constants.babel';

// CONSTANTS

const BASE_CONFIG = {
    target: 'node',
    devtool: 'sourcemap',
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
        path: 'dist/',
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
        __filename: false
    }
};

// PUBLIC API

export default _createConfig();

// IMPLEMENTATION DETAILS


// Private

function _createConfig() {
    return [
        // Module
        _createSingleConfig({
            entry: {
                index: `${PROJECT_ROOT}/src/index.js`
            }
        }),
        // CLI
        _createSingleConfig({
            entry: {
                cli: `${PROJECT_ROOT}/src/cli.js`
            },
            plugins: [
                new webpack.BannerPlugin('#!/usr/bin/env node', { raw: true })
            ]
        })
    ];
}

function _createSingleConfig(params) {
    const config = Object.assign({}, BASE_CONFIG, {
        entry: params.entry,
        externals: _getExternals()
    });
    if (params.plugins) { config.plugins = config.plugins.concat(...params.plugins); }
    return config;
}

function _getExternals() {
    const nodeModules = {};
    fs.readdirSync('node_modules')
        // Exclude the `.bin`-directory
        .filter(function(dirName) {
            return ['.bin'].indexOf(dirName) === -1;
        })
        // Include all other `node_modules`
        .forEach(function(mod) {
            nodeModules[mod] = 'commonjs ' + mod;
        });
    return nodeModules;
}

