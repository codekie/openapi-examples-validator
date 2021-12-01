const path = require('path'),
    fs = require('fs'),
    yaml = require('yaml'),
    { loadTestData } = require('../../../util/setup-tests'),
    { ErrorType } = require('../../../../src/application-error'),
    { 'default': validateExamples, validateFile, validateExample, validateExamplesByMap }
        = require('../../../../src/index'),
    errorsAdditionalProperties
        = require('../../../data/v3/additional-properties/errors-schema-with-examples.json'),
    errorsAdditionalPropertiesList
        = require('../../../data/v3/additional-properties/errors-list.json'),
    errorsAdditionalPropertiesMap
        = require('../../../data/v3/additional-properties/errors-map-external-examples.json'),
    errorsAdditionalPropertiesSingle
        = require('../../../data/v3/additional-properties/errors-single.json'),
    errorsExclusiveMinimum
        = require('../../../data/v3/draft-04-properties/errors-exclusive-minimum.json'),
    errorsEscapedErrorNames
        = require('../../../data/v3/errors/simple-api-with-example-names-to-be-escaped.json');

const JSON_PATH__CONTEXT_MUTUALLY_EXCLUSIVE = '/paths/~1pets/get/responses/200/content/application~1json',
    REL_PATH__EXAMPLE__SIMPLE = 'v3/simple-api-with-example',
    REL_PATH__EXAMPLE__INVALID__WITH_INTERNAL_REFS = 'v3/simple-api-with-example-with-refs-invalid',
    REL_PATH__EXAMPLE_AND_EXAMPLES__SIMPLE = 'v3/simple-api-with-example-and-examples',
    REL_PATH__EXAMPLES__SIMPLE = 'v3/simple-api-with-examples',
    REL_PATH__WITH_INTERNAL_REFS = 'v3/simple-api-with-examples-with-refs',
    REL_PATH__EXAMPLES__INVALID__WITH_INTERNAL_REFS = 'v3/simple-api-with-examples-with-refs-invalid',
    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__LIST
        = path.join(__dirname, '../../../data/v3/additional-properties/example-list-with-additional-properties.json'),
    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__SINGLE
        = path.join(__dirname, '../../../data/v3/additional-properties/example-single-with-additional-properties.json'),
    FILE_PATH__EXAMPLES_WITH_MISSING_SCHEMA
        = path.join(__dirname, '../../../data/v3/simple-api-with-examples-and-missing-schema.json'),
    FILE_PATH__MAP__WITH_ADDITIONAL_PROPERTIES = path.join(__dirname,
        '../../../data/v3/additional-properties/map-external-examples-with-additional-properties.json'
    ),
    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES
        = path.join(__dirname, '../../../data/v3/additional-properties/schema.yaml'),
    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES_WITH_EXAMPLES
        = path.join(__dirname, '../../../data/v3/additional-properties/schema-with-examples.yaml'),
    FILE_PATH__INVALID__YAML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs-invalid.yaml'),
    FILE_PATH__INVALID__INDENTATION__YAML
        = path.join(__dirname, '../../../data/v3/simple-api-with-examples-invalid-indentation.yml'),
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
    FILE_PATH__VALID__DATE_TIME_FORMATS = path.join(__dirname, '../../../data/v3/response-valid-date-time-format.json'),
    FILE_PATH__VALID__REQUEST_BODY = path.join(__dirname, '../../../data/v3/request-valid-requestbody.json'),
    FILE_PATH__VALID__REQUEST_BODY__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-valid-requestbody-examples.json'),
    FILE_PATH__INVALID__NUMBER_FORMATS = path.join(__dirname, '../../../data/v3/response-invalid-number-formats.json'),
    FILE_PATH__INVALID__DATE_TIME_FORMAT = path.join(__dirname, '../../../data/v3/response-invalid-date-time-format.json'),
    FILE_PATH__INVALID__REQUEST_BODY = path.join(__dirname, '../../../data/v3/request-invalid-requestbody.json'),
    FILE_PATH__INVALID__REQUEST_BODY__EXAMPLES
        = path.join(__dirname, '../../../data/v3/request-invalid-requestbody-examples.json'),
    FILE_PATH__VALID__VALUE_PROPERTY = path.join(__dirname, '../../../data/v3/valid-single-with-value-property.yaml'),
    FILE_PATH__VALID__YAML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs.yaml'),
    FILE_PATH__VALID__YML = path.join(__dirname, '../../../data/v3/simple-api-with-examples-with-refs.yml'),
    FILE_PATH__VALID_EXAMPLES_EXCLUSIVE_MINIMUM
        = path.join(__dirname, '../../../data/v3/simple-api-with-examples-exclusive-minimum.json'),
    FILE_PATH__INVALID_EXAMPLES_EXCLUSIVE_MINIMUM
        = path.join(__dirname, '../../../data/v3/simple-api-with-examples-exclusive-minimum-invalid.json'),
    FILE_PATH__EXAMPLE_NAMES_TO_BE_ESCAPED
        = path.join(__dirname, '../../../data/v3/simple-api-with-example-names-to-be-escaped.json'),
    FILE_PATH__UNKNOWN_FORMATS = path.join(__dirname, '../../../data/v3/unknown-formats.json');

describe('Main-module, for v3 should', function() {
    describe('recognize', function() {
        describe('`example`-property', function() {
            it('valid single example', async function() {
                (await validateExamples(loadTestData(REL_PATH__EXAMPLE__SIMPLE))).valid.should.equal(true);
            });
            it('invalid example with internal refs', async function() {
                (await validateExamples(loadTestData(REL_PATH__EXAMPLE__INVALID__WITH_INTERNAL_REFS)))
                    .valid.should.equal(false);
            });
            it('throw error, if example and examples are defined', async function() {
                const validationResult = await validateExamples(loadTestData(REL_PATH__EXAMPLE_AND_EXAMPLES__SIMPLE)),
                    error = validationResult.errors[0];
                validationResult.valid.should.equal(false);
                validationResult.errors.length.should.equal(1);
                error.type.should.equal(ErrorType.errorAndErrorsMutuallyExclusive);
                error.message.should.not.be.equal('');
                error.params.pathContext.should.equal(JSON_PATH__CONTEXT_MUTUALLY_EXCLUSIVE);
            });
        });
        describe('`examples`-property', function() {
            it('statistics for multiple examples', async function() {
                const { statistics } = await validateExamples(loadTestData(REL_PATH__EXAMPLES__SIMPLE));
                statistics.should.deep.equal({
                    examplesTotal: 3,
                    examplesWithoutSchema: 0,
                    schemasWithExamples: 1
                });
            });
            it('valid examples', async function() {
                (await validateExamples(loadTestData(REL_PATH__EXAMPLES__SIMPLE))).valid.should.equal(true);
            });
            it('example with internal refs', async function() {
                (await validateExamples(loadTestData(REL_PATH__WITH_INTERNAL_REFS))).valid.should.equal(true);
            });
            it('invalid example with internal refs', async function() {
                (await validateExamples(loadTestData(REL_PATH__EXAMPLES__INVALID__WITH_INTERNAL_REFS)))
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
        describe('containing an invalid yaml', function() {
            it('with wrong indentation', async function() {
                const errors = (await validateFile(FILE_PATH__INVALID__INDENTATION__YAML)).errors,
                    error = errors[0];
                errors.length.should.equal(1);
                error.message.should.equal('YAMLSemanticError: Nested mappings are not allowed in compact mappings');
                error.type.should.equal('ParseError');
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
    describe('be able to handle date-time formats', function() {
        it('with valid examples', async function() {
            (await validateFile(FILE_PATH__VALID__NUMBER_FORMATS)).valid.should.equal(true);
        });
        describe('invalid examples', function() {
            before(async function() {
                this.validationResults = await validateFile(FILE_PATH__INVALID__DATE_TIME_FORMAT);
            });

            it('invalid date-time', function() {
                const error = this.validationResults.errors[0];
                error.message.should.equal('should match format "date-time"');
                error.keyword.should.equal('format');
                error.params.format.should.equal('date-time');
            });
        });
    });

    describe('example with `value`s as properties', function() {
        it('should not be recognized as separate example', async function() {
            const { valid, statistics } = (await validateFile(FILE_PATH__VALID__VALUE_PROPERTY));
            valid.should.equal(true);
            statistics.should.deep.equal({
                schemasWithExamples: 1,
                examplesWithoutSchema: 0,
                examplesTotal: 1
            });
        });
    });
    describe('statistics for examples, without schema', function() {
        it('should return the right amount', async function() {
            (await validateFile(FILE_PATH__EXAMPLES_WITH_MISSING_SCHEMA))
                .statistics.schemasWithExamples.should.equal(2);
        });
    });
    describe('with additional properties', function() {
        describe('with flag not set', function() {
            it('`validateFile` should not show any error', async function() {
                (await validateFile(FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES_WITH_EXAMPLES))
                    .valid.should.equal(true);
            });
            it('`validateExamples` should not show any error', async function() {
                (await validateExamples(
                    yaml.parse(fs.readFileSync(FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES_WITH_EXAMPLES, 'utf-8'))
                )).valid.should.equal(true);
            });
            it('`validateExample` should not show any error', async function() {
                (await validateExample(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    '$.paths./pets.get.responses.200.content.application/json.schema',
                    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__LIST
                )).valid.should.equal(true);
            });
            it('`validateExample` should not show any error', async function() {
                (await validateExample(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    '$.paths./pets/{petId}.get.responses.200.content.application/json.schema',
                    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__SINGLE
                )).valid.should.equal(true);
            });
            it('`validateExamplesByMap` should not show any error', async function() {
                (await validateExamplesByMap(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    FILE_PATH__MAP__WITH_ADDITIONAL_PROPERTIES
                )).valid.should.equal(true);
            });
        });
        describe('with flag set', function() {
            it('`validateFile` should throw an error', async function() {
                (await validateFile(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES_WITH_EXAMPLES,
                    { noAdditionalProperties: true }
                )).errors.should.deep.equal(errorsAdditionalProperties);
            });
            it('`validateExamples` should throw an error', async function() {
                (await validateExamples(
                    yaml.parse(fs.readFileSync(FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES_WITH_EXAMPLES, 'utf-8')),
                    { noAdditionalProperties: true }
                )).errors.should.deep.equal(errorsAdditionalProperties);
            });
            it('`validateExample` for a list should throw an error', async function() {
                (await validateExample(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    '$.paths./pets.get.responses.200.content.application/json.schema',
                    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__LIST,
                    { noAdditionalProperties: true }
                )).errors.should.deep.equal(_expandFilePathOfErrors(errorsAdditionalPropertiesList, 'exampleFilePath'));
            });
            it('`validateExample` for a single example should throw an error', async function() {
                (await validateExample(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    '$.paths./pets/{petId}.get.responses.200.content.application/json.schema',
                    FILE_PATH__EXAMPLE__WITH_ADDITIONAL_PROPERTIES__SINGLE,
                    { noAdditionalProperties: true }
                )).errors.should.deep.equal(
                    _expandFilePathOfErrors(errorsAdditionalPropertiesSingle, 'exampleFilePath')
                );
            });
            it('`validateExamplesByMap` should throw an error', async function() {
                (await validateExamplesByMap(
                    FILE_PATH__SCHEMA__WITH_ADDITIONAL_PROPERTIES,
                    FILE_PATH__MAP__WITH_ADDITIONAL_PROPERTIES,
                    { noAdditionalProperties: true }
                )).errors.should.deep.equal(_expandFilePathOfErrors(errorsAdditionalPropertiesMap, 'mapFilePath'));
            });
        });
    });
    describe('with draft-04 properties', function() {
        it('`validateFile` should validate successfully', async function() {
            (await validateFile(FILE_PATH__VALID_EXAMPLES_EXCLUSIVE_MINIMUM)).valid.should.equal(true);
        });
        it('`validateFile` should throw an error', async function() {
            (await validateFile(FILE_PATH__INVALID_EXAMPLES_EXCLUSIVE_MINIMUM))
                .errors.should.deep.equal(errorsExclusiveMinimum);
        });
    });
    describe('escape example names, to make sure they can be selected by JSONpath', function() {
        it('`validateFile` should throw an error', async function() {
            (await validateFile(FILE_PATH__EXAMPLE_NAMES_TO_BE_ESCAPED))
                .errors.should.deep.equal(errorsEscapedErrorNames);
        });
    });
});

function _expandFilePathOfErrors(errors, propertyName) {
    errors.forEach(error => {
        error[propertyName] = path.join(__dirname, '../../../..', error[propertyName]);
    });
    return errors;
}
