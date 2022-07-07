const path = require('path'),
    { loadTestData, normalizeValidationResultPaths } = require('../../../util/setup-tests'),
    { validateExample, 'default': validateExamples, validateExamplesByMap } = require('../../../../src/index'),
    { ApplicationError, ErrorType } = require('../../../../src/application-error');
const { prepare } = require('../../../../src/impl/v2');

const PATH__SCHEMA_EXTERNAL_EXAMPLE = '$.paths./.get.responses.200.schema',
    PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID = '$.hmm.what.am.i.gonna.get.for.lunch',
    FILE_PATH__DATA = path.join(__dirname, '..', '..', '..', 'data', 'v2'),
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(FILE_PATH__DATA, 'external-examples-schema.json'),
    FILE_PATH__EXTERNAL_EXAMPLE1_VALID = path.join(FILE_PATH__DATA, 'external-examples-valid-example1.json'),
    FILE_PATH__EXTERNAL_EXAMPLE2_VALID = path.join(FILE_PATH__DATA, 'external-examples-valid-example2.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB = path.join(FILE_PATH__DATA, 'map-external-examples-glob-invalid*.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1 = path.join(FILE_PATH__DATA, 'map-external-examples-glob-invalid1.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID2 = path.join(FILE_PATH__DATA, 'map-external-examples-glob-invalid2.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP = path.join(FILE_PATH__DATA, 'map-external-examples.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_RELATIVE = path.join(FILE_PATH__DATA, 'map-external-examples-relative.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WILDCARDS = path.join(FILE_PATH__DATA,
        'map-external-examples-with-wildcards.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITHOUT_WILDCARDS = path.join(FILE_PATH__DATA,
        'map-external-examples-without-wildcards.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH = path.join(FILE_PATH__DATA,
        'map-external-examples-map-with-wrong-schema-path.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE = path.join(FILE_PATH__DATA,
        'map-external-examples-map-with-missing-examples.json'),
    FILE_PATH__NOT_EXISTS = 'there is no spoon',
    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE = path.join('test', 'data', 'v2', 'external-examples-invalid-type.json'),
    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK = path.join('test', 'data', 'v2',
        'external-examples-invalid-missing-link.json');

describe('Main-module, for v2 should', () => {
    describe('recognize', () => {
        it('valid single example', async() => {
            (await validateExamples(loadTestData('v2/valid-single-example'))).valid.should.equal(true);
        });
        it('valid multiple examples', async() => {
            (await validateExamples(loadTestData('v2/valid-multiple-examples'))).valid.should.equal(true);
        });
        it('valid array-example', async() => {
            (await validateExamples(loadTestData('v2/valid-array-response'))).valid.should.equal(true);
        });
    });
    describe('ignore', () => {
        it('responses without schema', async() => {
            (await validateExamples(loadTestData('v2/valid-without-schema'))).valid.should.equal(true);
        });
        it('responses without examples', async() => {
            (await validateExamples(loadTestData('v2/valid-without-examples'))).valid.should.equal(true);
        });
    });
    describe('find error:', () => {
        it('invalid type', async() => {
            const result = await validateExamples(loadTestData('v2/invalid-type'));
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
        it('multiple errors', async() => {
            const result = await validateExamples(loadTestData('v2/multiple-errors'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ErrorType.validation, {
                    keyword: 'type',
                    dataPath: '.versions[0].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'should be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                }),
                new ApplicationError(ErrorType.validation, {
                    keyword: 'required',
                    dataPath: '.versions[0]',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    message: "should have required property 'links'",
                    examplePath: '/paths/~1/get/responses/300/examples/application~1json'
                }),
                new ApplicationError(ErrorType.validation, {
                    keyword: 'type',
                    dataPath: '.versions[1].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'should be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                })
            ]);
        });
        describe('In array-response:', () => {
            it('multiple errors', async() => {
                const result = await validateExamples(loadTestData('v2/invalid-array-response'));
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ErrorType.validation, {
                        keyword: 'required',
                        dataPath: '[0]',
                        schemaPath: '#/items/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: "should have required property 'id'",
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    }),
                    new ApplicationError(ErrorType.validation, {
                        keyword: 'type',
                        dataPath: '[1].links',
                        schemaPath: '#/items/properties/links/type',
                        params: {
                            type: 'array'
                        },
                        message: 'should be array',
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    })
                ]);
            });
        });
    });
    describe('should be able to validate external examples', () => {
        it('without errors', async() => {
            (await validateExample(
                FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                PATH__SCHEMA_EXTERNAL_EXAMPLE,
                FILE_PATH__EXTERNAL_EXAMPLE1_VALID
            )).valid.should.equal(true);
            (await validateExample(
                FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                PATH__SCHEMA_EXTERNAL_EXAMPLE,
                FILE_PATH__EXTERNAL_EXAMPLE2_VALID
            )).valid.should.equal(true);
        });
        describe('with errors', () => {
            it('(type error)', async() => {
                const result = await validateExample(
                    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE
                );
                result.valid.should.equal(false);
                result.errors.should.deep.equal([new ApplicationError(ErrorType.validation, {
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE
                })]);
            });
        });
        it('with an example-map', async() => {
            const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP);
            normalizeValidationResultPaths(result);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ErrorType.validation, {
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP,
                    exampleFilePath: path.normalize('test/data/v2/external-examples-invalid-type.json')
                }),
                new ApplicationError(ErrorType.validation, {
                    dataPath: '.versions[0]',
                    keyword: 'required',
                    message: "should have required property 'links'",
                    params: {
                        missingProperty: 'links'
                    },
                    schemaPath: '#/properties/versions/items/required',
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP,
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK
                })
            ]);
        });
        it('should be able to expand examples wildcards', async() => {
            const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WILDCARDS);
            result.valid.should.equal(false);
            result.statistics.should.deep.equal({
                examplesTotal: 7,
                examplesWithoutSchema: 0,
                matchingFilePathsMapping: 1,
                schemasWithExamples: 2
            });
            result.errors.should.deep.equal([{
                type: 'Validation',
                message: "should have required property 'links'",
                keyword: 'required',
                dataPath: '.versions[0]',
                schemaPath: '#/properties/versions/items/required',
                exampleFilePath: path.normalize('test/data/v2/external-examples-invalid-missing-link.json'),
                mapFilePath: path.normalize(
                    path.join(__dirname, '../../../../test/data/v2/map-external-examples-with-wildcards.json')),
                params: {
                    missingProperty: 'links'
                }
            }, {
                type: 'Validation',
                message: 'should be string',
                keyword: 'type',
                dataPath: '.versions[0].id',
                schemaPath: '#/properties/versions/items/properties/id/type',
                exampleFilePath: path.normalize('test/data/v2/external-examples-invalid-type.json'),
                mapFilePath: path.normalize(
                    path.join(__dirname, '../../../../test/data/v2/map-external-examples-with-wildcards.json')),
                params: {
                    type: 'string'
                }
            }]);
        });
        it('map of examples with wildcards should be equal to without wildcards', async() => {
            const resultWithWildcards = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WILDCARDS);
            const resultWithoutWildcards = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITHOUT_WILDCARDS);
            resultWithWildcards.valid.should.equal(resultWithoutWildcards.valid);
            resultWithWildcards.statistics.should.deep.equal(resultWithoutWildcards.statistics);
            removeMapFilePath(resultWithWildcards.errors).should.deep.equal(
                removeMapFilePath(resultWithoutWildcards.errors));
        });
    });
    describe('should throw errors', () => {
        describe("when files can't be found:", () => {
            it('the mapping-file', async() => {
                const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__NOT_EXISTS);
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
            it('referenced example-file in the mapping-file', async() => {
                const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE);
                normalizeValidationResultPaths(result);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ErrorType.jsENOENT, {
                        mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE,
                        message: "No such file or directory: 'test/data/v2/blegh forgot the sugar in the"
                            + " coffee'",
                        params: {
                            path: 'test/data/v2/blegh forgot the sugar in the coffee'
                        }
                    }),
                    new ApplicationError(ErrorType.validation, {
                        dataPath: '.versions[0]',
                        keyword: 'required',
                        message: "should have required property 'links'",
                        params: {
                            missingProperty: 'links'
                        },
                        schemaPath: '#/properties/versions/items/required',
                        mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE,
                        exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK
                    })
                ]);
            });
            it('the example-file', async() => {
                const result = (await validateExample(
                    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__NOT_EXISTS
                ));
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
        describe("when the response-schema can't be found", () => {
            it('while validating a single external example', async() => {
                const result = await validateExample(
                    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID,
                    FILE_PATH__EXTERNAL_EXAMPLE1_VALID
                );
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ErrorType.jsonPathNotFound, {
                        message: "Path to schema can't be found: "
                            + `'${ PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID }'`,
                        params: {
                            path: PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID
                        },
                        type: 'JsonPathNotFound'
                    })
                ]);
            });
            it('while validating a map of external examples', async() => {
                const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH);
                normalizeValidationResultPaths(result);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ErrorType.jsonPathNotFound, {
                        mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH,
                        message: "Path to schema can't be found: "
                            + `'${ PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID }'`,
                        params: {
                            path: PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID
                        }
                    })
                ]);
            });
        });
    });
    describe('should be able to resolve globs for mapping-files', () => {
        it('and collect the errors for all mapping-files', async() => {
            const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_GLOB);
            normalizeValidationResultPaths(result);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ErrorType.validation, {
                    message: "should have required property 'links'",
                    keyword: 'required',
                    dataPath: '.versions[0]',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK,
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1
                }),
                new ApplicationError(ErrorType.validation, {
                    message: 'should be string',
                    keyword: 'type',
                    dataPath: '.versions[0].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE,
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1
                }),
                new ApplicationError(ErrorType.validation, {
                    message: "should have required property 'links'",
                    keyword: 'required',
                    dataPath: '.versions[0]',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK,
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID2
                })
            ]);
        });
        it('should collect the statistics over all mapping-files', async() => {
            (await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, FILE_PATH__EXTERNAL_EXAMPLES_GLOB))
                .statistics.should.deep.equal({
                    schemasWithExamples: 4,
                    examplesWithoutSchema: 0,
                    examplesTotal: 7,
                    matchingFilePathsMapping: 2
                });
        });
    });
    describe('with set `cwd-to-mapping-file`-flag', () => {
        it('resolve the relative paths in the mapping-files', async() => {
            const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP_RELATIVE, { cwdToMappingFile: true });
            result.valid.should.equal(true);
            result.statistics.should.deep.equal({
                schemasWithExamples: 2,
                examplesWithoutSchema: 0,
                examplesTotal: 3,
                matchingFilePathsMapping: 1
            });
        });
    });
    describe('prepare', () => {
        it('should set noAdditionalProperties in the openapiSpec, if flag provided', async() => {
            const preparedOpenapi = prepare(
                loadTestData('v2/valid-without-examples'),
                { noAdditionalProperties: true }
            );
            preparedOpenapi.should.deep.equal(loadTestData('v2/valid-with-no-additional-properties'));
        });
        it('should set allPropertiesRequired in the openapiSpec, if flag provided', async() => {
            const preparedOpenapi = prepare(
                loadTestData('v2/valid-without-examples'),
                { allPropertiesRequired: true }
            );
            preparedOpenapi.should.deep.equal(loadTestData('v2/valid-with-all-properties-required'));
        });
    });
});

function removeMapFilePath(errors) {
    return errors.map(error => {
        delete error.mapFilePath;
        return error;
    });
}
