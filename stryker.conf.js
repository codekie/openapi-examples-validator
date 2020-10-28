module.exports = {
    mutate: [
        'src/**/*.js'
    ],
    packageManager: 'npm',
    reporters: ['html', 'clear-text', 'progress', 'dashboard'],
    testRunner: 'mocha',
    coverageAnalysis: 'perTest'
};
