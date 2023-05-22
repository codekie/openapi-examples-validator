// IMPORTS

const path = require('path'),
    structuredClone = require('core-js-pure/actual/structured-clone'),
    { validateFile, validateExample, 'default': validateExamples, validateExamplesByMap } = require('../../src'),
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    { ApplicationError, ErrorType } = require('../../src/application-error');


// CONSTANTS

// General constants
const PATH__SCHEMA_EXTERNAL_EXAMPLE = '$.paths./.get.responses.200.schema',
    FILE_PATH__NOT_EXISTS = 'Mhhh, dinner',
    FILE_PATH__DATA = path.join(__dirname, '..', 'data', 'v2'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE = path.join(FILE_PATH__DATA, 'map-external-examples-relative.json'),
    FILE_PATH__EXTERNAL_EXAMPLE1_VALID = path.join(FILE_PATH__DATA, 'external-examples-valid-example1.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(FILE_PATH__DATA, 'external-examples-schema.json');


// TEST SUITES

describe('Main API', function() {
    describe('validateExamples', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', async function() {
                (await validateExamples(loadTestData('v2/valid-single-example'))).valid.should.equal(true);
            });
        });
    });
    describe('validateExample', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', async function() {
                (await validateExample(
                    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__EXTERNAL_EXAMPLE1_VALID
                )).valid.should.equal(true);
            });
        });
    });
    describe('validateExamplesByMap', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', async function() {
                const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE, { cwdToMappingFile: true });
                result.valid.should.equal(true);
            });
            describe('without changing the working directory', function() {
                it('should fail', async function() {
                    const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                        FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE);
                    result.valid.should.equal(false);
                });
            });
        });
    });
    describe('validateFile', function() {
        describe('be able to validate file', () => {
            it('without errors', async() => {
                (await validateFile(getPathOfTestData('v2/valid-single-example'))).valid
                    .should.equal(true);
            });
            it('with error', async() => {
                const result = await validateFile(getPathOfTestData('v2/invalid-type'));
                result.valid.should.equal(false);
                result.errors.should.deep.equal([new ApplicationError(ErrorType.validation, {
                    instancePath: '/versions/0/id',
                    keyword: 'type',
                    message: 'must be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                })]);
            });
        });
        describe('collect statistics', () => {
            it('with examples with missing schemas', async() => {
                structuredClone(await validateFile(getPathOfTestData('v2/simple-example'))).statistics.should.deep
                    .equal({
                        schemasWithExamples: 1,
                        examplesWithoutSchema: 3,
                        examplesTotal: 4
                    });
            });
            it('without examples', async() => {
                structuredClone(await validateFile(getPathOfTestData('v2/valid-without-examples'))).statistics
                    .should.deep.equal({
                        schemasWithExamples: 1,
                        examplesWithoutSchema: 0,
                        examplesTotal: 1
                    });
            });
            it('without schema', async() => {
                structuredClone(await validateFile(getPathOfTestData('v2/valid-without-schema'))).statistics
                    .should.deep.equal({
                        schemasWithExamples: 1,
                        examplesWithoutSchema: 1,
                        examplesTotal: 2
                    });
            });
        });
        describe('should throw errors, when the files can\'t be found:', function() {
            it('The schema-file', async() => {
                const result = await validateFile(FILE_PATH__NOT_EXISTS);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ErrorType.jsENOENT, {
                        message: `ENOENT: no such file or directory, open '${ FILE_PATH__NOT_EXISTS }'`,
                        params: {
                            path: FILE_PATH__NOT_EXISTS
                        }
                    })
                ]);
            });
        });
    });
});
