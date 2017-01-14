import webpack from 'webpack';
import {
    PROJECT_ROOT,
    JS_REGEX,
    EXCLUDE_REGEX
} from './constants.babel';


export default {
    entry: {
        index: `${PROJECT_ROOT}/src/index.js`
    },
    devtool: 'source-map',
    module: {
        preLoaders: [
            { test: JS_REGEX, exclude: EXCLUDE_REGEX, loader: 'eslint' }
        ],
        loaders: [
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
        chunkFilename: '[name].js'
    },
    plugins: [
        // Only emit files when there are no errors
        new webpack.NoErrorsPlugin(),
        // Dedupe modules in the output
        new webpack.optimize.DedupePlugin(),
        // Minify all javascript, switch loaders to minimizing mode
        new webpack.optimize.UglifyJsPlugin()
    ]
};
