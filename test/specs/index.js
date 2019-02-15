// IMPORTS

const path = require('path'),
    { validateFile, validateExample, 'default': validateExamples, validateExamplesByMap } = require('../../src'),
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    ApplicationError = require('../../src/application-error');


// CONSTANTS

// Constants, derived from imports
const { ERR_TYPE__JS_ENOENT, ERR_TYPE__VALIDATION } = ApplicationError;
// General constants
const PATH__SCHEMA_EXTERNAL_EXAMPLE = '$.paths./.get.responses.200.schema',
    FILE_PATH__NOT_EXISTS = 'Mhhh, dinner',
    FILE_PATH__DATA = path.join(__dirname, '..', 'data'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE = path.join(FILE_PATH__DATA, 'map-external-examples-relative.json'),
    FILE_PATH__EXTERNAL_EXAMPLE1_VALID = path.join(FILE_PATH__DATA, 'external-examples-valid-example1.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(FILE_PATH__DATA, 'external-examples-schema.json');


// TEST SUITES

describe('Main API', function() {
    describe('validateExamples', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', function() {
                validateExamples(loadTestData('valid-single-example')).valid.should.equal(true);
            });
        });
    });
    describe('validateExample', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', function() {
                validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__EXTERNAL_EXAMPLE1_VALID).valid.should.equal(true);
            });
        });
    });
    describe('validateExamplesByMap', function() {
        describe('API version 2', function() {
            it('should successfully validate the file', function() {
                const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE, { cwdToMappingFile: true });
                result.valid.should.equal(true);
            });
            describe('without changing the working directory', function() {
                it('should fail', function() {
                    const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                        FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE);
                    result.valid.should.equal(false);
                });
            });
        });
    });
    describe('validateFile', function() {
        describe('be able to validate file', () => {
            it('without errors', () => {
                validateFile(getPathOfTestData('valid-single-example')).valid.should.equal(true);
            });
            it('with error', () => {
                const result = validateFile(getPathOfTestData('invalid-type'));
                result.valid.should.equal(false);
                result.errors.should.deep.equal([new ApplicationError(ERR_TYPE__VALIDATION, {
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                })]);
            });
        });
        describe('collect statistics', () => {
            it('with examples with missing schemas', () => {
                validateFile(getPathOfTestData('simple-example')).statistics.should.deep
                    .equal({
                        responseSchemasWithExamples: 1,
                        responseExamplesWithoutSchema: 3,
                        responseExamplesTotal: 4
                    });
            });
            it('without examples', () => {
                validateFile(getPathOfTestData('valid-without-examples')).statistics.should.deep
                    .equal({
                        responseSchemasWithExamples: 1,
                        responseExamplesWithoutSchema: 0,
                        responseExamplesTotal: 1
                    });
            });
            it('without schema', () => {
                validateFile(getPathOfTestData('valid-without-schema')).statistics.should.deep
                    .equal({
                        responseSchemasWithExamples: 1,
                        responseExamplesWithoutSchema: 1,
                        responseExamplesTotal: 2
                    });
            });
        });
        describe('should throw errors, when the files can\'t be found:', function() {
            it('The schema-file', () => {
                const result = validateFile(FILE_PATH__NOT_EXISTS);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JS_ENOENT, {
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
