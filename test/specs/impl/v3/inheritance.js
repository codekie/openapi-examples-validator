const { validateFile } = require('../../../../src');
const path = require('path');
const { ApplicationError, ErrorType } = require('../../../../src/application-error');

const FILE_PATH__INVALID__REQUEST_BODY__INHERITANCE_EXAMPLES
        = path.join(__dirname, '../../../data/v3/response-invalid-requestbody-inheritance-examples.json'),
    FILE_PATH__VALID__REQUEST_BODY__INHERITANCE_EXAMPLES
        = path.join(__dirname, '../../../data/v3/response-valid-requestbody-inheritance-examples.json');

describe('Inheritance', function() {
    describe('with invalid inheritance examples', function() {
        beforeEach(async function() {
            this.validationResult = await validateFile(FILE_PATH__INVALID__REQUEST_BODY__INHERITANCE_EXAMPLES);
        });
        it('should recognize it as invalid', function() {
            this.validationResult.valid.should.equal(false);
        });
        it('should recognize all errors', function() {
            this.validationResult.errors.length.should.equal(3);
            this.validationResult.errors[0].should.deep.equal(new ApplicationError(ErrorType.validation, {
                message: "must have required property 'dogName'",
                instancePath: '',
                schemaPath: '#/oneOf/0/required',
                keyword: 'required',
                params: {
                    missingProperty: 'dogName'
                },
                examplePath: '/paths/~1pet/post/requestBody/content/application~1json/examples/dog/value'
            }));
            this.validationResult.errors[1].should.deep.equal(new ApplicationError(ErrorType.validation, {
                message: 'value of tag "type" must be in oneOf',
                instancePath: '',
                schemaPath: '#/discriminator',
                keyword: 'discriminator',
                params: {
                    error: 'mapping',
                    tag: 'type',
                    tagValue: 'FISH'
                },
                examplePath: '/paths/~1pet/post/requestBody/content/application~1json/examples/fish/value'
            }));
            this.validationResult.errors[2].should.deep.equal(new ApplicationError(ErrorType.validation, {
                message: 'must be string',
                instancePath: '/catName',
                schemaPath: '#/oneOf/0/properties/catName/type',
                keyword: 'type',
                params: {
                    type: 'string'
                },
                examplePath: '/paths/~1pet/post/requestBody/content/application~1json/examples/dog/value'
            }));
        });
    });
    describe('with valid inheritance examples', function() {
        beforeEach(async function() {
            this.validationResult = await validateFile(FILE_PATH__VALID__REQUEST_BODY__INHERITANCE_EXAMPLES);
        });
        it('should recognize it as valid', function() {
            this.validationResult.valid.should.equal(true);
        });
    });
});
