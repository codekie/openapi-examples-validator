const path = require('path'),
    { validateFile, validateExamplesByMap } = require('../../../../src/index');

const FILE_PATH__DATA = path.join(__dirname, '..', '..', '..', 'data', 'v2'),
    FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA = path.join(FILE_PATH__DATA,
        'external-examples-schema-referencing-sub-schema.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP = path.join(FILE_PATH__DATA, 'map-external-examples.json'),
    FILE_PATH__EXTERNAL_EXAMPLES_MAP__RELATIVE = path.join(FILE_PATH__DATA, 'map-external-examples-relative.json'),
    FILE_PATH__REFERENCED_EXAMPLE_VALID = path.join('test', 'data', 'v2',
        'external-examples-schema-referencing-valid.json'),
    FILE_PATH__REFERENCED_EXAMPLE_INVALID = path.join('test', 'data', 'v2',
        'external-examples-schema-referencing-invalid.json');

describe('Main-module, for v2 should', () => {
    describe('be able to dereference $ref pointers', () => {
        describe('with included examples', () => {
            it('with errors', async() => {
                (await validateFile(FILE_PATH__REFERENCED_EXAMPLE_INVALID))
                    .should.deep.equal({
                        valid: false,
                        statistics: {
                            schemasWithExamples: 1,
                            examplesTotal: 1,
                            examplesWithoutSchema: 0
                        },
                        errors: [
                            {
                                type: 'Validation',
                                message: 'should be string',
                                keyword: 'type',
                                dataPath: '.versions[0].id',
                                schemaPath: '#/properties/versions/items/properties/id/type',
                                params: {
                                    type: 'string'
                                },
                                examplePath: '/paths/~1/get/responses/200/examples/application~1json'
                            }
                        ]
                    });
            });
            it('without errors', async() => {
                (await validateFile(FILE_PATH__REFERENCED_EXAMPLE_VALID)).valid.should.equal(true);
            });
        });
        describe('with mapping files', () => {
            it('with changing the working directory', async() => {
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
            it('without changing the working directory', async() => {
                const result = await validateExamplesByMap(FILE_PATH__EXTERNAL_EXAMPLES_SCHEMA,
                    FILE_PATH__EXTERNAL_EXAMPLES_MAP, { cwdToMappingFile: false });
                result.should.deep.equal({
                    valid: false,
                    statistics: {
                        schemasWithExamples: 2,
                        examplesTotal: 4,
                        examplesWithoutSchema: 0,
                        matchingFilePathsMapping: 1
                    },
                    errors: [
                        {
                            type: 'Validation',
                            message: 'should be string',
                            keyword: 'type',
                            dataPath: '.versions[0].id',
                            schemaPath: '#/properties/versions/items/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            exampleFilePath: 'test/data/v2/external-examples-invalid-type.json',
                            mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP
                        },
                        {
                            type: 'Validation',
                            message: "should have required property 'links'",
                            keyword: 'required',
                            dataPath: '.versions[0]',
                            schemaPath: '#/properties/versions/items/required',
                            params: {
                                missingProperty: 'links'
                            },
                            exampleFilePath: 'test/data/v2/external-examples-invalid-missing-link.json',
                            mapFilePath: FILE_PATH__EXTERNAL_EXAMPLES_MAP
                        }
                    ]
                });
            });
        });
    });
});
