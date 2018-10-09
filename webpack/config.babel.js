import * as fs from 'fs';
import * as path from 'path';
import webpack from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
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
        rules: [
            // Preloaders
            {
                enforce: 'pre',
                test: JS_REGEX,
                exclude: EXCLUDE_REGEX,
                loader: 'eslint-loader'
            },
            // Regular loaders
            { test: /\.json$/, loader: 'json-loader', type: 'javascript/auto' },
            { test: JS_REGEX, exclude: EXCLUDE_REGEX, loader: 'babel-loader',
                query: {
                    presets: ['@babel/preset-env']
                }
            }
        ]
    },
    output: {
        path: path.resolve(PROJECT_ROOT, 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    plugins: [
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
                new webpack.BannerPlugin({ banner: '#!/usr/bin/env node', raw: true })
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

