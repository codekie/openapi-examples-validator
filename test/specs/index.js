const
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    validate = require('../../src/index').default,
    { validateFile } = require('../../src/index');

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
});
