const fs = require('fs'),
    path = require('path'),
    webpack = require('webpack'),
    ESLintPlugin = require('eslint-webpack-plugin'),
    {
        PROJECT_ROOT,
        JS_REGEX,
        EXCLUDE_REGEX
    } = require('./constants.babel');

// CONSTANTS

const BASE_CONFIG = {
    target: 'node',
    devtool: 'source-map',
    module: {
        rules: [
            // Regular loaders
            { test: /\.json$/, loader: 'json-loader', type: 'javascript/auto' },
            { test: JS_REGEX, exclude: EXCLUDE_REGEX, loader: 'babel-loader' }
        ]
    },
    output: {
        path: path.resolve(PROJECT_ROOT, 'dist'),
        filename: '[name].js',
        chunkFilename: '[name].js',
        libraryTarget: 'commonjs2'
    },
    plugins: [
        new ESLintPlugin({
//            files: [
//                '*.js',
//                '*.es6',
//                '*.babel'
//            ],
            exclude: 'node_modules/'
        })
    ],
    // NodeJS options
    node: {
        __dirname: false,
        __filename: false
    }
};

// PUBLIC API

module.exports = _createConfig();

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

