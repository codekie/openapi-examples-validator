const path = require('path'),
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    validate = require('../../src/index').default,
    { validateFile, validateExample } = require('../../src/index');

const PATH__SCHEMA_EXTERNAL_EXAMPLE = '$.paths./.get.responses.200.schema',
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(__dirname, '..', 'data', 'external-examples-schema.json'),
    FILE_PATH__EXTERNAL_EXAMPLE1_VALID = path.join(__dirname, '..', 'data', 'external-examples-valid-example1.json'),
    FILE_PATH__EXTERNAL_EXAMPLE2_VALID = path.join(__dirname, '..', 'data', 'external-examples-valid-example2.json'),
    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE = path.join(__dirname, '..', 'data',
        'external-examples-invalid-type.json');

describe('Main-module should', () => {
    describe('recognize', () => {
        it('valid single example', () => {
            validate(loadTestData('valid-single-example')).valid.should.equal(true);
        });
        it('valid multiple examples', () => {
            validate(loadTestData('valid-multiple-examples')).valid.should.equal(true);
        });
        it('valid array-example', () => {
            validate(loadTestData('valid-array-response')).valid.should.equal(true);
        });
    });
    describe('ignore', () => {
        it('responses without schema', () => {
            validate(loadTestData('valid-without-schema')).valid.should.equal(true);
        });
        it('responses without examples', () => {
            validate(loadTestData('valid-without-examples')).valid.should.equal(true);
        });
    });
    describe('find error:', () => {
        it('invalid type', () => {
            const result = validate(loadTestData('invalid-type'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([{
                dataPath: '.versions[0].id',
                keyword: 'type',
                message: 'should be string',
                params: {
                    type: 'string'
                },
                schemaPath: '#/properties/versions/items/properties/id/type',
                examplePath: '/paths/~1/get/responses/200/examples/application~1json'
            }]);
        });
        it('multiple errors', () => {
            const result = validate(loadTestData('multiple-errors'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                {
                    keyword: 'type',
                    dataPath: '.versions[0].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'should be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                },
                {
                    keyword: 'required',
                    dataPath: '.versions[0]',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    message: "should have required property 'links'",
                    examplePath: '/paths/~1/get/responses/300/examples/application~1json'
                },
                {
                    keyword: 'type',
                    dataPath: '.versions[1].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'should be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                }
            ]);
        });
        describe('In array-response:', () => {
            it('multiple errors', () => {
                const result = validate(loadTestData('invalid-array-response'));
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    {
                        keyword: 'required',
                        dataPath: '[0]',
                        schemaPath: '#/items/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: "should have required property 'id'",
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    },
                    {
                        keyword: 'type',
                        dataPath: '[1].links',
                        schemaPath: '#/items/properties/links/type',
                        params: {
                            type: 'array'
                        },
                        message: 'should be array',
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    }
                ]);
            });
        });
    });
    describe('be able to validate file', () => {
        it('without errors', () => {
            validateFile(getPathOfTestData('valid-single-example')).valid.should.equal(true);
        });
        it('with error', () => {
            const result = validateFile(getPathOfTestData('invalid-type'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([{
                dataPath: '.versions[0].id',
                keyword: 'type',
                message: 'should be string',
                params: {
                    type: 'string'
                },
                schemaPath: '#/properties/versions/items/properties/id/type',
                examplePath: '/paths/~1/get/responses/200/examples/application~1json'
            }]);
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
    describe('should be able to validate external examples', () => {
        it('without errors', () => {
            validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, PATH__SCHEMA_EXTERNAL_EXAMPLE,
                FILE_PATH__EXTERNAL_EXAMPLE1_VALID).valid.should.equal(true);
            validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, PATH__SCHEMA_EXTERNAL_EXAMPLE,
                FILE_PATH__EXTERNAL_EXAMPLE2_VALID).valid.should.equal(true);
        });
        describe('with errors', () => {
            it('(type error)', () => {
                const result = validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([{
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE
                }]);
            });
        });
    });
});
