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
    .description('Validate embedded examples in OpenAPI-JSONs.\n'
        + '  To validate external examples, use the `-s` and `-e` option.\n'
        + '  To pass a mapping-file, to validate multiple external examples, use the `-m` option.')
    .option('-s, --schema-jsonpath <schema-jsonpath>', 'JSON-path to schema, to validate the example file against')
    .option('-e, --example-filepath <example-filepath>', 'file path to example file, to be validated')
    .option('-m, --mapping-filepath <mapping-filepath>', 'file path to map, containing schema-paths as key and the'
        + ' file-path(s) to examples as value. If wildcards are used, the parameter has to be put in quotes.')
    .option('-c, --cwd-to-mapping-file', "changes to the directory of the mapping-file, before resolving the example's"
        + ' paths. Use this option, if your mapping-files use relative paths for the examples')
    .action(processAction);
program.on('--help', () => {
    console.log('\n\n  Example for external example-file:\n');
    console.log('    $ openapi-examples-validator -s $.paths./.get.responses.200.schema -e example.json'
        + ' openapi-spec.json\n\n');
});
program.parse(process.argv);

// IMPLEMENTATION DETAILS

function processAction(filepath, options) {
    const { schemaJsonpath, exampleFilepath, mappingFilepath, cwdToMappingFile } = options;
    let result = null;
    if (mappingFilepath) {
        console.log('Validating with mapping file');
        result = validateExamplesByMap(filepath, mappingFilepath, { cwdToMappingFile });
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
    const {
            responseSchemasWithExamples = '-',
            responseExamplesWithoutSchema = '-',
            responseExamplesTotal = '-',
            matchingFilePathsMapping
        } = statistics,
        strStatistics = [
            `Response schemas with examples found: ${ responseSchemasWithExamples }`,
            `Response examples without schema found: ${ responseExamplesWithoutSchema }`,
            `Total examples found: ${ responseExamplesTotal }`
        ];
    if (matchingFilePathsMapping != null) {
        strStatistics.push(`Matching mapping files found: ${ matchingFilePathsMapping }`);
    }
    process.stdout.write(`${ strStatistics.join('\n') }\n`);
}
