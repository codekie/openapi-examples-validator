const path = require('path'),
    { loadTestData } = require('../../../util/setup-tests'),
    { ErrorType } = require('../../../../src/application-error'),
    { 'default': validateExamples, validateFile } = require('../../../../src/index');

const JSON_PATH__CONTEXT_MUTUALLY_EXCLUSIVE = '/paths/~1pets/get/responses/200/content/application~1json',
    REL_PATH__EXAMPLE__SIMPLE = 'v3/simple-api-with-example',
    REL_PATH__EXAMPLE_AND_EXAMPLES__SIMPLE = 'v3/simple-api-with-example-and-examples',
    REL_PATH__EXAMPLES__SIMPLE = 'v3/simple-api-with-examples',
    REL_PATH__WITH_INTERNAL_REFS = 'v3/simple-api-with-examples-with-refs',
    REL_PATH__EXAMPLE__INVALID__WITH_INTERNAL_REFS = 'v3/simple-api-with-example-with-refs-invalid',
    REL_PATH__EXAMPLES__INVALID__WITH_INTERNAL_REFS = 'v3/simple-api-with-examples-with-refs-invalid',
    FILE_PATH__INVALID__YAML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs-invalid.yaml'),
    FILE_PATH__INVALID__YML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs-invalid.yml'),
    FILE_PATH__VALID__REQUEST_PARAMETER = path.join(__dirname, '../../../data/v3/request-valid-parameter.json'),
    FILE_PATH__VALID__REQUEST_PARAMETER__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-valid-parameter-examples.json'),
    FILE_PATH__NULLABLE_INVALID_DEFINITION
        = path.join(__dirname, '../../../data/v3/response-nullable-invalid-definition.json'),
    FILE_PATH__INVALID__NON_NULLABLE = path.join(__dirname, '../../../data/v3/response-invalid-non-nullable.json'),
    FILE_PATH__INVALID__REQUEST_PARAMETER = path.join(__dirname, '../../../data/v3/request-invalid-parameter.json'),
    FILE_PATH__INVALID__REQUEST_PARAMETER__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-invalid-parameter-examples.json'),
    FILE_PATH__VALID__NULLABLE = path.join(__dirname, '../../../data/v3/response-valid-nullable.json'),
    FILE_PATH__VALID__NUMBER_FORMATS = path.join(__dirname, '../../../data/v3/response-valid-number-formats.json'),
    FILE_PATH__VALID__REQUEST_BODY = path.join(__dirname, '../../../data/v3/request-valid-requestbody.json'),
    FILE_PATH__VALID__REQUEST_BODY__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-valid-requestbody-examples.json'),
    FILE_PATH__INVALID__NUMBER_FORMATS = path.join(__dirname, '../../../data/v3/response-invalid-number-formats.json'),
    FILE_PATH__INVALID__REQUEST_BODY = path.join(__dirname, '../../../data/v3/request-invalid-requestbody.json'),
    FILE_PATH__INVALID__REQUEST_BODY__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-invalid-requestbody-examples.json'),
    FILE_PATH__VALID__YAML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs.yaml'),
    FILE_PATH__VALID__YML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs.yml');

describe('Main-module, for v3 should', function() {
    describe('recognize', function() {
        describe('`example`-property', function() {
            it('valid single example', function() {
                validateExamples(loadTestData(REL_PATH__EXAMPLE__SIMPLE)).valid.should.equal(true);
            });
            it('invalid example with internal refs', function() {
                validateExamples(loadTestData(REL_PATH__EXAMPLE__INVALID__WITH_INTERNAL_REFS))
                    .valid.should.equal(false);
            });
            it('throw error, if example and examples are defined', function() {
                const validationResult = validateExamples(loadTestData(REL_PATH__EXAMPLE_AND_EXAMPLES__SIMPLE)),
                    error = validationResult.errors[0];
                validationResult.valid.should.equal(false);
                validationResult.errors.length.should.equal(1);
                error.type.should.equal(ErrorType.errorAndErrorsMutuallyExclusive);
                error.message.should.not.be.equal('');
                error.params.pathContext.should.equal(JSON_PATH__CONTEXT_MUTUALLY_EXCLUSIVE);
            });
        });
        describe('`examples`-property', function() {
            it('statistics for multiple examples', function() {
                const { statistics } = validateExamples(loadTestData(REL_PATH__EXAMPLES__SIMPLE));
                statistics.should.deep.equal({
                    examplesTotal: 3,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 1
                });
            });
            it('valid examples', function() {
                validateExamples(loadTestData(REL_PATH__EXAMPLES__SIMPLE)).valid.should.equal(true);
            });
            it('example with internal refs', function() {
                validateExamples(loadTestData(REL_PATH__WITH_INTERNAL_REFS)).valid.should.equal(true);
            });
            it('invalid example with internal refs', function() {
                validateExamples(loadTestData(REL_PATH__EXAMPLES__INVALID__WITH_INTERNAL_REFS))
                    .valid.should.equal(false);
            });
        });
    });
    describe('be able to load and validate YAML-specs', function() {
        describe('containing valid examples', function() {
            it('`with .yaml` extension', async function() {
                (await validateFile(FILE_PATH__VALID__YAML)).valid.should.equal(true);
            });
            it('`with .yml` extension', async function() {
                (await validateFile(FILE_PATH__VALID__YML)).valid.should.equal(true);
            });
        });
        describe('containing invalid examples', function() {
            it('`with .yaml` extension', async function() {
                (await validateFile(FILE_PATH__INVALID__YAML)).valid.should.equal(false);
            });
            it('`with .yml` extension', async function() {
                (await validateFile(FILE_PATH__INVALID__YML)).valid.should.equal(false);
            });
        });
    });
    describe('be able to validate request parameters', function() {
        describe('in example-property', function() {
            it('with statistics', async function() {
                const { statistics } = await validateFile(FILE_PATH__VALID__REQUEST_PARAMETER);
                statistics.should.deep.equal({
                    examplesTotal: 1,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 1
                });
            });
            it('with a valid example', async function() {
                (await validateFile(FILE_PATH__VALID__REQUEST_PARAMETER))
                    .valid.should.equal(true);
            });
            it('with an invalid example', async function() {
                (await validateFile(FILE_PATH__INVALID__REQUEST_PARAMETER))
                    .valid.should.equal(false);
            });
        });
        describe('in examples-property', function() {
            it('with statistics', async function() {
                const { statistics } = await validateFile(FILE_PATH__VALID__REQUEST_PARAMETER__EXAMPLES);
                statistics.should.deep.equal({
                    examplesTotal: 2,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 1
                });
            });
            it('with a valid example', async function() {
                (await validateFile(FILE_PATH__VALID__REQUEST_PARAMETER__EXAMPLES)).valid.should.equal(true);
            });
            it('with an invalid example', async function() {
                (await validateFile(FILE_PATH__INVALID__REQUEST_PARAMETER__EXAMPLES)).valid.should.equal(false);
            });
        });
    });
    describe('be able to validate request-bodies', function() {
        describe('in example-property', function() {
            it('with statistics', async function() {
                const { statistics } = await validateFile(FILE_PATH__VALID__REQUEST_BODY);
                statistics.should.deep.equal({
                    examplesTotal: 2,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 2
                });
            });
            it('with a valid example', async function() {
                (await validateFile(FILE_PATH__VALID__REQUEST_BODY)).valid.should.equal(true);
            });
            it('with an invalid example', async function() {
                (await validateFile(FILE_PATH__INVALID__REQUEST_BODY)).valid.should.equal(false);
            });
        });
        describe('in examples-property', function() {
            it('with statistics', async function() {
                const { statistics } = await validateFile(FILE_PATH__VALID__REQUEST_BODY__EXAMPLES);
                statistics.should.deep.equal({
                    examplesTotal: 2,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 2
                });
            });
            it('with a valid example', async function() {
                (await validateFile(FILE_PATH__VALID__REQUEST_BODY__EXAMPLES)).valid.should.equal(true);
            });
            describe('with invalid examples', function() {
                before(async function() {
                    this.validationResult = await validateFile(FILE_PATH__INVALID__REQUEST_BODY__EXAMPLES);
                });
                it('should recognize it as invalid', function() {
                    this.validationResult.valid.should.equal(false);
                });
                it('should recognize all errors', function() {
                    this.validationResult.errors.length.should.equal(3);
                });
            });
        });
    });
    describe('be able to handle `nullable`-types', function() {
        it('with `null` for non-nullable-type', async function() {
            (await validateFile(FILE_PATH__INVALID__NON_NULLABLE)).valid.should.equal(false);
        });
        it('with nullable property', async function() {
            (await validateFile(FILE_PATH__VALID__NULLABLE)).valid.should.equal(true);
        });
        it('with nullable property, but no type set', async function() {
            // Nullable will be ignored, if no `type` is set
            (await validateFile(FILE_PATH__NULLABLE_INVALID_DEFINITION)).valid.should.equal(true);
        });
    });
    describe('be able to handle number formats', function() {
        it('with valid examples', async function() {
            (await validateFile(FILE_PATH__VALID__NUMBER_FORMATS)).valid.should.equal(true);
        });
        describe('invalid examples', function() {
            before(async function() {
                this.validationResults = await validateFile(FILE_PATH__INVALID__NUMBER_FORMATS);
            });

            it('should be marked as invalid', function() {
                this.validationResults.valid.should.equal(false);
            });
            it('number represented as string', function() {
                const error = this.validationResults.errors[0];
                error.message.should.equal('should be number');
                error.keyword.should.equal('type');
                error.params.type.should.equal('number');
            });
            it('invalid int32', function() {
                const error = this.validationResults.errors[1];
                error.message.should.equal('should match format "int32"');
                error.keyword.should.equal('format');
                error.params.format.should.equal('int32');
            });
            it('invalid int64', function() {
                const error = this.validationResults.errors[2];
                error.message.should.equal('should match format "int64"');
                error.keyword.should.equal('format');
                error.params.format.should.equal('int64');
            });
            it('invalid float', function() {
                const error = this.validationResults.errors[3];
                error.message.should.equal('should match format "float"');
                error.keyword.should.equal('format');
                error.params.format.should.equal('float');
            });
            it('invalid double', function() {
                const error = this.validationResults.errors[4];
                error.message.should.equal('should match format "double"');
                error.keyword.should.equal('format');
                error.params.format.should.equal('double');
            });
        });
    });
});
