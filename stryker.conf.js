module.exports = function(config) {
    config.set({
        mutate: [
            'src/**/*.js'
        ],
        mutator: 'javascript',
        packageManager: 'npm',
        reporters: ['html', 'clear-text', 'progress', 'dashboard'],
        testRunner: 'mocha',
        transpilers: ['babel'],
        testFramework: 'mocha',
        coverageAnalysis: 'off',
        babel: {
            optionsFile: '.babelrc'
        },
        mochaOptions: {
            // Optional mocha options
            spec: ['./test/specs/**/*.js'],
            config: '.mocharc.json',
            package: 'package.json',
            ui: 'bdd',
            timeout: 3000,
            require: [
                '@babel/register',
                './test/util/setup-tests'
            ]
        }
    });
};
