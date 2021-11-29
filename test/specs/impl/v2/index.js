const path = require('path'),
    { loadTestData, normalizeValidationResultPaths } = require('../../../util/setup-tests'),
    { validateExample, 'default': validateExamples, validateExamplesByMap } = require('../../../../src/index'),
    { ApplicationError, ErrorType } = require('../../../../src/application-error');

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
    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE = path.join(FILE_PATH__DATA, 'map-external-examples-relative.json'),
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
                instancePath: '/versions/0/id',
                keyword: 'type',
                message: 'must be string',
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
                    instancePath: '/versions/0/id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'must be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                }),
                new ApplicationError(ErrorType.validation, {
                    keyword: 'required',
                    instancePath: '/versions/0',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    message: "must have required property 'links'",
                    examplePath: '/paths/~1/get/responses/300/examples/application~1json'
                }),
                new ApplicationError(ErrorType.validation, {
                    keyword: 'type',
                    instancePath: '/versions/1/id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'must be string',
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
                        instancePath: '/0',
                        schemaPath: '#/items/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: "must have required property 'id'",
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    }),
                    new ApplicationError(ErrorType.validation, {
                        keyword: 'type',
                        instancePath: '/1/links',
                        schemaPath: '#/items/properties/links/type',
                        params: {
                            type: 'array'
                        },
                        message: 'must be array',
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
                    instancePath: '/versions/0/id',
                    keyword: 'type',
                    message: 'must be string',
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
                    instancePath: '/versions/0/id',
                    keyword: 'type',
                    message: 'must be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP,
                    exampleFilePath: path.normalize('test/data/v2/external-examples-invalid-type.json')
                }),
                new ApplicationError(ErrorType.validation, {
                    instancePath: '/versions/0',
                    keyword: 'required',
                    message: "must have required property 'links'",
                    params: {
                        missingProperty: 'links'
                    },
                    schemaPath: '#/properties/versions/items/required',
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP,
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK
                })
            ]);
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
                        message: "ENOENT: no such file or directory, open 'test/data/v2/blegh forgot the sugar in the"
                            + " coffee'",
                        params: {
                            path: 'test/data/v2/blegh forgot the sugar in the coffee'
                        }
                    }),
                    new ApplicationError(ErrorType.validation, {
                        instancePath: '/versions/0',
                        keyword: 'required',
                        message: "must have required property 'links'",
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
                    message: "must have required property 'links'",
                    keyword: 'required',
                    instancePath: '/versions/0',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK,
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1
                }),
                new ApplicationError(ErrorType.validation, {
                    message: 'must be string',
                    keyword: 'type',
                    instancePath: '/versions/0/id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    exampleFilePath: FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE,
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1
                }),
                new ApplicationError(ErrorType.validation, {
                    message: "must have required property 'links'",
                    keyword: 'required',
                    instancePath: '/versions/0',
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
                FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE, { cwdToMappingFile: true });
            result.valid.should.equal(true);
            result.statistics.should.deep.equal({
                schemasWithExamples: 2,
                examplesWithoutSchema: 0,
                examplesTotal: 3,
                matchingFilePathsMapping: 1
            });
        });
    });
});
