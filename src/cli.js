// Shebang will be added by webpack
//#!/usr/bin/env node --harmony

const
    VERSION = require('../package.json').version,
    program = require('commander'),
    { validateFile, validateExample } = require('./index');

// DEFINE CLI

program
    .version(VERSION)
    .arguments('<filePath>')
    .description('Validate embedded examples in Swagger-JSONs.\nTo validate external examples, use the `-s` and'
        + ' `-e` option.')
    .option('-s, --schema-path <json-path>', 'JSON-path to schema, to validate the example file against')
    .option('-e, --example-filepath <file-path>', 'file path to example file, to be validated')
    .action(processAction);
program.on('--help', () => {
    console.log('\n\n  Example for external example-file:\n');
    console.log('    $ swagger-examples-validator -s $.paths./.get.responses.200.schema -e example.json'
        + ' swagger.json\n\n');
});
program.parse(process.argv);

// IMPLEMENTATION DETAILS

function processAction(filePath, options) {
    const { schemaPath, exampleFilepath } = options;
    let result = null;
    if (schemaPath && exampleFilepath) {
        result = validateExample(filePath, schemaPath, exampleFilepath);
    } else {
        result = validateFile(filePath);
    }
    _handleResult(result);
}

function _handleResult(result) {
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
