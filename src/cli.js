// Shebang will be added by webpack
//#!/usr/bin/env node --harmony

const
    VERSION = require('../package.json').version,
    program = require('commander'),
    { validateFile } = require('./index');

// DEFINE CLI

program
    .version(VERSION)
    .arguments('<filePath>')
    .description('Validate embedded examples in Swagger-JSONs')
    .action(filePath => _validateFileAndExit(filePath));
program.parse(process.argv);

// IMPLEMENTATION DETAILS

function _validateFileAndExit(filePath) {
    const result = validateFile(filePath);
    if (result.valid) { process.exit(0); }
    process.stderr.write(JSON.stringify(result.errors, null, '    '));
    process.exit(1);
}
