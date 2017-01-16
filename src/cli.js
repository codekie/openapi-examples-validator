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
    _printStatistics(result.statistics);
    if (result.valid) {
        process.stdout.write('\nNo errors found.\n\n');
        process.exit(0);
    }
    process.stdout.write('\nErrors found.\n\n');
    process.stderr.write(JSON.stringify(result.errors, null, '    '));
    process.exit(1);
}

function _printStatistics(statistics) {
    const strStatistics = [
        `Response schemas with examples found: ${ statistics.responseSchemasWithExamples }`,
        `Response examples without schema found: ${ statistics.responseExamplesWithoutSchema }`,
        `Total examples found: ${ statistics.responseExamplesTotal }`
    ].join('\n');
    process.stdout.write(`${ strStatistics }\n`);
}
