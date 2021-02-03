// IMPORTS

const path = require('path'),
    {
        validateFile,
        validateExample,
        'default': validateExamples,
        validateExamplesByMap,
        prepareOpenapiSpec,
        validateExampleInline
    } = require('../../src'),
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
            it('with examples with missing schemas', async() => {
                (await validateFile(getPathOfTestData('v2/simple-example'))).statistics.should.deep
                    .equal({
                        schemasWithExamples: 1,
                        examplesWithoutSchema: 3,
                        examplesTotal: 4
                    });
            });
            it('without examples', async() => {
                (await validateFile(getPathOfTestData('v2/valid-without-examples'))).statistics
                    .should.deep.equal({
                        schemasWithExamples: 1,
                        examplesWithoutSchema: 0,
                        examplesTotal: 1
                    });
            });
            it('without schema', async() => {
                (await validateFile(getPathOfTestData('v2/valid-without-schema'))).statistics
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
    describe('prepareOpenapiSpec', function() {
        describe('be able to load v2.0 file', () => {
            it('without errors', async() => {
                (await prepareOpenapiSpec(getPathOfTestData('v2/valid-single-example'))).swagger
                    .should.deep.equal("2.0");
            });
        });
        describe('be able to load v3.0 file', () => {
            it('without errors', async() => {
                (await prepareOpenapiSpec(getPathOfTestData('v3/simple-api-with-example'))).openapi
                    .should.deep.equal("3.0.0");
            });
        });
        describe('should throw errors, when the files can\'t be found:', function() {
            it('The schema-file', async() => {
                const result = await prepareOpenapiSpec(FILE_PATH__NOT_EXISTS);
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
    describe('validateExampleInline', function() {
        const example1 = {
            "versions": [{
                "status": "CURRENT",
                "updated": "2016-01-21T11:33:21Z",
                "id": "v1.0",
                "links": [{
                    "href": "http://127.0.0.1:8774/v1/",
                    "rel": "self"
                }]
            }]
        };
        const example2 = {
            "versions": [{
                "status": "CURRENT",
                "updated": "2016-01-21T11:33:21Z",
                "id": 1.0,
                "links": [{
                    "href": "http://127.0.0.1:8774/v1/",
                    "rel": "self"
                }]
            }]
        };
        it('be able to validate example without errors', async() => {
            const openApiSpec = await prepareOpenapiSpec(getPathOfTestData('v2/valid-single-example'));
            const pathSchema = "$.paths./.get.responses.200.schema";
            const result = await validateExampleInline(
                    openApiSpec,
                    pathSchema,
                    example1);
            result.valid.should.equal(true);
        });
        it('when the response-schema cannot be found', async() => {
            const openApiSpec = await prepareOpenapiSpec(getPathOfTestData('v2/valid-single-example'));
            const pathSchema = "$.paths./.get.responses.401.schema";
            const result = await validateExampleInline(
                    openApiSpec,
                    pathSchema,
                    example1);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ErrorType.jsonPathNotFound, {
                    message: `Path to schema can't be found: '${pathSchema}'`,
                    params: {
                        path: pathSchema
                    },
                    type: 'JsonPathNotFound'
                })
            ]);
        });
        it('throw error on example missing required property', async() => {
            const openApiSpec = await prepareOpenapiSpec(getPathOfTestData('v2/valid-single-example'));
            const pathSchema = "$.paths./.get.responses.200.schema";
            const result = await validateExampleInline(
                    openApiSpec,
                    pathSchema,
                    example2);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([new ApplicationError(ErrorType.validation, {
                dataPath: '.versions[0].id',
                keyword: 'type',
                message: 'should be string',
                params: {
                    type: 'string'
                },
                schemaPath: '#/properties/versions/items/properties/id/type',
                exampleFilePath: 'inline'
            })]);
        });
        it('handle multipe examples on the same openApiSpec object', async() => {
            const openApiSpec = await prepareOpenapiSpec(getPathOfTestData('v2/valid-single-example'));
            const pathSchema = "$.paths./.get.responses.200.schema";
            const result1 = await validateExampleInline(
                    openApiSpec,
                    pathSchema,
                    example1);
            result1.valid.should.equal(true);
            const result2 = await validateExampleInline(
                    openApiSpec,
                    pathSchema,
                    example2);
            result2.valid.should.equal(false);
            result2.errors.should.deep.equal([new ApplicationError(ErrorType.validation, {
                dataPath: '.versions[0].id',
                keyword: 'type',
                message: 'should be string',
                params: {
                    type: 'string'
                },
                schemaPath: '#/properties/versions/items/properties/id/type',
                exampleFilePath: 'inline'
            })]);
        });
    });
});
