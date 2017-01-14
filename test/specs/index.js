const
    { loadTestData } = require('../util/setup-tests'),
    validate = require('../../src/index').default;

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
                        dataPath: '.versions[0]',
                        keyword: 'required',
                        message: "should have required property 'links'",
                        params: {
                            missingProperty: 'links'
                        },
                        schemaPath: '#/properties/versions/items/required'
                    },
                    {
                        dataPath: '.versions[0].id',
                        keyword: 'type',
                        message: 'should be string',
                        params: {
                            type: 'string'
                        },
                        schemaPath: '#/properties/versions/items/properties/id/type'
                    }
                ]
            });
        });
    });
});
