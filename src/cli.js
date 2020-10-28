// Shebang will be added by webpack
//#!/usr/bin/env node --harmony

/**
 * Command Line Interface for the validator
 */

const
    VERSION = require('../package.json').version,
    program = require('commander'),
    { validateFile, validateExample, validateExamplesByMap } = require('./index');

// FOR AUTOMATED TESTS

const ENV_TEST = process.env.OPENAPI_EXAMPLES_VALIDATOR_TESTS === 'true';

// DEFINE CLI

program
    .version(VERSION)
    .arguments('<filepath>')
    .description('Validate embedded examples in OpenAPI-specs (JSON and YAML supported).\n'
        + '  To validate external examples, use the `-s` and `-e` option.\n'
        + '  To pass a mapping-file, to validate multiple external examples, use the `-m` option.')
    .option('-s, --schema-jsonpath <schema-jsonpath>', 'Path to OpenAPI-schema, to validate the example file against')
    .option('-e, --example-filepath <example-filepath>', 'file path to example file, to be validated')
    .option('-m, --mapping-filepath <mapping-filepath>', 'file path to map, containing schema-paths as key and the'
        + ' file-path(s) to examples as value. If wildcards are used, the parameter has to be put in quotes.')
    .option('-c, --cwd-to-mapping-file', "changes to the directory of the mapping-file, before resolving the example's"
        + ' paths. Use this option, if your mapping-files use relative paths for the examples')
    .option('-n, --no-additional-properties', 'don\'t allow properties that are not described in the schema')
    .action(processAction);
program.on('--help', () => {
    console.log('\n\n  Example for external example-file:\n');
    console.log('    $ openapi-examples-validator -s $.paths./.get.responses.200.schema -e example.json'
        + ' openapi-spec.json\n\n');
});
// Execute and export promise (for automated tests)
module.exports = program.parseAsync(process.argv);

// IMPLEMENTATION DETAILS

async function processAction(filepath, options) {
    const { schemaJsonpath, exampleFilepath, mappingFilepath, cwdToMappingFile } = options,
        noAdditionalProperties = !options.additionalProperties;
    let result;
    if (mappingFilepath) {
        console.log('Validating with mapping file');
        result = await validateExamplesByMap(filepath, mappingFilepath, { cwdToMappingFile, noAdditionalProperties });
    } else if (schemaJsonpath && exampleFilepath) {
        console.log('Validating single external example');
        result = await validateExample(filepath, schemaJsonpath, exampleFilepath, { noAdditionalProperties });
    } else {
        console.log('Validating examples');
        result = await validateFile(filepath, { noAdditionalProperties });
    }
    _handleResult(result);
}

function _handleResult(result) {
    const noExit = ENV_TEST;
    _printStatistics(result.statistics);
    if (result.valid) {
        process.stdout.write('\nNo errors found.\n\n');
        !noExit && process.exit(0);
        return;
    }
    process.stdout.write('\nErrors found.\n\n');
    process.stderr.write(JSON.stringify(result.errors, null, '    '));
    !noExit && process.exit(1);
}

function _printStatistics(statistics) {
    const {
            schemasWithExamples,
            examplesWithoutSchema,
            examplesTotal,
            matchingFilePathsMapping
        } = statistics,
        strStatistics = [
            `Schemas with examples found: ${ schemasWithExamples }`,
            `Examples without schema found: ${ examplesWithoutSchema }`,
            `Total examples found: ${ examplesTotal }`
        ];
    if (matchingFilePathsMapping != null) {
        strStatistics.push(`Matching mapping files found: ${ matchingFilePathsMapping }`);
    }
    process.stdout.write(`${ strStatistics.join('\n') }\n`);
}
