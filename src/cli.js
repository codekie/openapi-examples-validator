// Shebang will be added by webpack
//#!/usr/bin/env node --harmony

const
    VERSION = require('../package.json').version,
    program = require('commander'),
    { validateFile, validateExample, validateExamplesByMap } = require('./index');

// DEFINE CLI

program
    .version(VERSION)
    .arguments('<filepath>')
    .description('Validate embedded examples in Swagger-JSONs.\n'
        + '  To validate external examples, use the `-s` and `-e` option.\n'
        + '  To pass a mapping-file, to validate multiple external examples, use the `-m` option.')
    .option('-s, --schema-jsonpath <schema-jsonpath>', 'JSON-path to schema, to validate the example file against')
    .option('-e, --example-filepath <example-filepath>', 'file path to example file, to be validated')
    .option('-m, --map-filepath <map-filepath>', 'file path to map, containing schema-paths as key and the'
        + ' file-path(s) to examples as value')
    .action(processAction);
program.on('--help', () => {
    console.log('\n\n  Example for external example-file:\n');
    console.log('    $ swagger-examples-validator -s $.paths./.get.responses.200.schema -e example.json'
        + ' swagger.json\n\n');
});
program.parse(process.argv);

// IMPLEMENTATION DETAILS

function processAction(filepath, options) {
    const { schemaJsonpath, exampleFilepath, mapFilepath } = options;
    let result = null;
    if (mapFilepath) {
        console.log('Validating with mapping file');
        result = validateExamplesByMap(filepath, mapFilepath);
    } else if (schemaJsonpath && exampleFilepath) {
        console.log('Validating single external example');
        result = validateExample(filepath, schemaJsonpath, exampleFilepath);
    } else {
        console.log('Validating examples');
        result = validateFile(filepath);
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
