const path = require('path'),
    {
        loadTestData,
        getPathOfTestData
    } = require('../util/setup-tests'),
    validate = require('../../src/index').default,
    { validateFile, validateExample, validateExamplesByMap } = require('../../src/index'),
    ApplicationError = require('../../src/application-error'),
    { ERR_TYPE__JS_ENOENT, ERR_TYPE__JSON_PATH_NOT_FOUND, ERR_TYPE__VALIDATION } = ApplicationError;

const PATH__SCHEMA_EXTERNAL_EXAMPLE = '$.paths./.get.responses.200.schema',
    PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID = '$.hmm.what.am.i.gonna.get.for.lunch',
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(__dirname, '..', 'data', 'external-examples-schema.json'),
    FILE_PATH__EXTERNAL_EXAMPLE1_VALID = path.join(__dirname, '..', 'data', 'external-examples-valid-example1.json'),
    FILE_PATH__EXTERNAL_EXAMPLE2_VALID = path.join(__dirname, '..', 'data', 'external-examples-valid-example2.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB = path.join(__dirname, '..', 'data', 'map-external-examples-glob-invalid*.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID1 = path.join(__dirname, '..',
        'data', 'map-external-examples-glob-invalid1.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_GLOB_INVALID2 = path.join(__dirname, '..',
        'data', 'map-external-examples-glob-invalid2.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP = path.join(__dirname, '..', 'data', 'map-external-examples.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE = path.join(__dirname, '..', 'data',
        'map-external-examples-relative.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH = path.join(__dirname, '..', 'data',
        'map-external-examples-map-with-wrong-schema-path.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE = path.join(__dirname, '..', 'data',
        'map-external-examples-map-with-missing-examples.json'),
    FILE_PATH__NOT_EXISTS = 'there is no spoon',
    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_TYPE = path.join('test', 'data', 'external-examples-invalid-type.json'),
    FILE_PATH__EXTERNAL_EXAMPLE_INVALID_MISSING_LINK = path.join('test', 'data',
        'external-examples-invalid-missing-link.json');

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
            result.errors.should.deep.equal([new ApplicationError(ERR_TYPE__VALIDATION, {
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
        it('multiple errors', () => {
            const result = validate(loadTestData('multiple-errors'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ERR_TYPE__VALIDATION, {
                    keyword: 'type',
                    dataPath: '.versions[0].id',
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    params: {
                        type: 'string'
                    },
                    message: 'should be string',
                    examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                }),
                new ApplicationError(ERR_TYPE__VALIDATION, {
                    keyword: 'required',
                    dataPath: '.versions[0]',
                    schemaPath: '#/properties/versions/items/required',
                    params: {
                        missingProperty: 'links'
                    },
                    message: "should have required property 'links'",
                    examplePath: '/paths/~1/get/responses/300/examples/application~1json'
                }),
                new ApplicationError(ERR_TYPE__VALIDATION, {
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
            it('multiple errors', () => {
                const result = validate(loadTestData('invalid-array-response'));
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__VALIDATION, {
                        keyword: 'required',
                        dataPath: '[0]',
                        schemaPath: '#/items/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: "should have required property 'id'",
                        examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                    }),
                    new ApplicationError(ERR_TYPE__VALIDATION, {
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
    describe('be able to validate file', () => {
        it('without errors', () => {
            validateFile(getPathOfTestData('valid-single-example')).valid.should.equal(true);
        });
        it('with error', () => {
            const result = validateFile(getPathOfTestData('invalid-type'));
            result.valid.should.equal(false);
            result.errors.should.deep.equal([new ApplicationError(ERR_TYPE__VALIDATION, {
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
                result.errors.should.deep.equal([new ApplicationError(ERR_TYPE__VALIDATION, {
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
        it('with an example-map', () => {
            const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, FILE_PATH__EXTERNAL_EXAMPLES_MAP);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ERR_TYPE__VALIDATION, {
                    dataPath: '.versions[0].id',
                    keyword: 'type',
                    message: 'should be string',
                    params: {
                        type: 'string'
                    },
                    schemaPath: '#/properties/versions/items/properties/id/type',
                    mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP,
                    exampleFilePath: 'test/data/external-examples-invalid-type.json'
                }),
                new ApplicationError(ERR_TYPE__VALIDATION, {
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
    });
    describe('should throw errors', () => {
        describe("when files can't be found:", () => {
            it('the mapping-file', () => {
                const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__NOT_EXISTS);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JS_ENOENT, {
                        message: `ENOENT: no such file or directory, open '${ FILE_PATH__NOT_EXISTS }'`,
                        params: {
                            path: FILE_PATH__NOT_EXISTS
                        }
                    })
                ]);
            });
            it('referenced example-file in the mapping-file', () => {
                const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JS_ENOENT, {
                        mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_MISSING_EXAMPLE,
                        message: "ENOENT: no such file or directory, open 'test/data/blegh forgot the sugar in the"
                            + " coffee'",
                        params: {
                            path: 'test/data/blegh forgot the sugar in the coffee'
                        }
                    }),
                    new ApplicationError(ERR_TYPE__VALIDATION, {
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
            it('the example-file', () => {
                const result = validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, PATH__SCHEMA_EXTERNAL_EXAMPLE,
                    FILE_PATH__NOT_EXISTS);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JS_ENOENT, {
                        message: `ENOENT: no such file or directory, open '${ FILE_PATH__NOT_EXISTS }'`,
                        params: {
                            path: FILE_PATH__NOT_EXISTS
                        }
                    })
                ]);
            });
            it('the schema-file', () => {
                const result = validateFile(FILE_PATH__NOT_EXISTS);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JS_ENOENT, {
                        message: `ENOENT: no such file or directory, open '${ FILE_PATH__NOT_EXISTS }'`,
                        params: {
                            path: FILE_PATH__NOT_EXISTS
                        }
                    })
                ]);
            });
        });
        describe("when the response-schema can't be found", () => {
            it('while validating a single external example', () => {
                const result = validateExample(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID, FILE_PATH__EXTERNAL_EXAMPLE1_VALID);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JSON_PATH_NOT_FOUND, {
                        message: "Path to response-schema can't be found: "
                            + `'${ PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID }'`,
                        params: {
                            path: PATH__SCHEMA_EXTERNAL_EXAMPLE_INVALID
                        },
                        type: 'JsonPathNotFound'
                    })
                ]);
            });
            it('while validating a map of external examples', () => {
                const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH);
                result.valid.should.equal(false);
                result.errors.should.deep.equal([
                    new ApplicationError(ERR_TYPE__JSON_PATH_NOT_FOUND, {
                        mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP_WITH_WRONG_SCHEMA_PATH,
                        message: "Path to response-schema can't be found: "
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
        it('and collect the errors for all mapping-files', () => {
            const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_GLOB);
            result.valid.should.equal(false);
            result.errors.should.deep.equal([
                new ApplicationError(ERR_TYPE__VALIDATION, {
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
                new ApplicationError(ERR_TYPE__VALIDATION, {
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
                new ApplicationError(ERR_TYPE__VALIDATION, {
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
        it('should collect the statistics over all mapping-files', () => {
            validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA, FILE_PATH__EXTERNAL_EXAMPLES_GLOB)
                .statistics.should.deep.equal({
                    responseSchemasWithExamples: 4,
                    responseExamplesWithoutSchema: 0,
                    responseExamplesTotal: 7,
                    matchingFilePathsMapping: 2
                });
        });
    });
    describe('with set `cwd-to-mapping-file`-flag', () => {
        it('resolve the relative paths in the mapping-files', () => {
            const result = validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE, { cwdToMappingFile: true });
            result.valid.should.equal(true);
            result.statistics.should.deep.equal({
                responseSchemasWithExamples: 2,
                responseExamplesWithoutSchema: 0,
                responseExamplesTotal: 3,
                matchingFilePathsMapping: 1
            });
        });
    });
});
