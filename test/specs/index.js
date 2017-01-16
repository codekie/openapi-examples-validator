const
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    validate = require('../../src/index').default,
    { validateFile } = require('../../src/index');

describe('Should', () => {
    describe('recognize', () => {
        it('valid single example', () => {
            validate(loadTestData('valid-single-example')).should.deep.equal({ valid: true });
        });
        it('valid multiple exmpales', () => {
            validate(loadTestData('valid-multiple-examples')).should.deep.equal({ valid: true });
        });
    });
    describe('ignore', () => {
        it('responses without schema', () => {
            validate(loadTestData('valid-without-schema')).should.deep.equal({ valid: true });
        });
        it('responses without examples', () => {
            validate(loadTestData('valid-without-examples')).should.deep.equal({ valid: true });
        });
    });
    describe('find error:', () => {
        it('invalid type', () => {
            validate(loadTestData('invalid-type')).should.deep.equal({
                valid: false,
                errors: [{
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type'
                }]
            });
        });
        it('multiple errors', () => {
            validate(loadTestData('multiple-errors')).should.deep.equal({
                valid: false,
                errors: [
                    {
                        keyword: 'type',
                        dataPath: '.versions[0].id',
                        schemaPath: '#/properties/versions/items/properties/id/type',
                        params: {
                            type: 'string'
                        },
                        message: 'should be string'
                    },
                    {
                        keyword: 'required',
                        dataPath: '.versions[0]',
                        schemaPath: '#/properties/versions/items/required',
                        params: {
                            missingProperty: 'links'
                        },
                        message: "should have required property 'links'"
                    },
                    {
                        keyword: 'type',
                        dataPath: '.versions[1].id',
                        schemaPath: '#/properties/versions/items/properties/id/type',
                        params: {
                            type: 'string'
                        },
                        message: 'should be string'
                    }
                ]
            });
        });
    });
    describe('be able to validate file', () => {
        it('without errors', () => {
            validateFile(getPathOfTestData('valid-single-example')).should.deep.equal({ valid: true });
        });
        it('with error', () => {
            validateFile(getPathOfTestData('invalid-type')).should.deep.equal({
                valid: false,
                errors: [{
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type'
                }]
            });
        });
    });
});
