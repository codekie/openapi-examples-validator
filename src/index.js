/**
 * Entry-point for the validator-API
 */

const
    merge = require('lodash.merge'),
    flatten = require('lodash.flatten'),
    flatMap = require('lodash.flatmap'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    yaml = require('yaml'),
    { JSONPath: jsonPath } = require('jsonpath-plus'),
    refParser = require('json-schema-ref-parser'),
    { createError } = require('errno').custom,
    ResultType = require('./const/result-type'),
    { getValidatorFactory, compileValidate } = require('./validator'),
    Determiner = require('./impl'),
    { ApplicationError, ErrorType } = require('./application-error'),
    { createValidationResponse, dereferenceJsonSchema } = require('./utils');

// CONSTANTS

const SYM__INTERNAL = Symbol('internal'),
    PROP__SCHEMAS_WITH_EXAMPLES = 'schemasWithExamples',
    FILE_EXTENSIONS__YAML = [
        'yaml',
        'yml'
    ];

// STATICS

/**
 * ErrorJsonPathNotFound
 * @typedef {{
 *      cause: {
 *          [params]: {
 *              [path]: string
 *          }
 *      }
 * }} ErrorJsonPathNotFound
 * @augments CustomError
 */

/**
 * @constructor
 * @augments CustomError
 * @returns {ErrorJsonPathNotFound}
 */
const ErrorJsonPathNotFound = createError(ErrorType.jsonPathNotFound);

// PUBLIC API

module.exports = {
    'default': validateExamples,
    validateFile,
    validateExample,
    validateExamplesByMap,
    prepareOpenapiSpec,
    validateExampleInline
};

// IMPLEMENTATION DETAILS

// Type definitions

/**
 * ValidationStatistics
 * @typedef {{
 *      schemasWithExamples: number,
 *      examplesTotal: number,
 *      examplesWithoutSchema: number,
 *      [matchingFilePathsMapping]: number
 * }} ValidationStatistics
 */

/**
 * ValidationResponse
 * @typedef {{
 *      valid: boolean,
 *      statistics: ValidationStatistics,
 *      errors: Array.<ApplicationError>
 * }} ValidationResponse
 */

/**
 * @callback ValidationHandler
 * @param {ValidationStatistics}    statistics
 * @returns {Array.<ApplicationError>}
 */

// Public

/**
 * Validates OpenAPI-spec with embedded examples.
 * @param {Object}  openapiSpec OpenAPI-spec
 * @param {boolean} [noAdditionalProperties=false]  Don't allow properties that are not defined in the schema
 * @param {boolean} [allPropertiesRequired=false]   Make all properties required
 * @param {Array.<string>} [ignoreFormats]          List of datatype formats that shall be ignored (to prevent
 *                                                  "unsupported format" errors). If an Array with only one string is
 *                                                  provided where the formats are separated with `\n`, the entries
 *                                                  will be expanded to a new array containing all entries.
 * @returns {ValidationResponse}
 */
async function validateExamples(openapiSpec, { noAdditionalProperties, ignoreFormats, allPropertiesRequired } = {}) {
    const impl = Determiner.getImplementation(openapiSpec);
    openapiSpec = await refParser.dereference(openapiSpec);
    openapiSpec = impl.prepare(openapiSpec, { noAdditionalProperties, allPropertiesRequired });
    let pathsExamples = impl.getJsonPathsToExamples()
        .reduce((res, pathToExamples) => {
            return res.concat(_extractExamplePaths(openapiSpec, pathToExamples));
        }, [])
        .map(impl.escapeExampleName);
    return _validateExamplesPaths({ impl }, pathsExamples, openapiSpec, { ignoreFormats });
}

/**
 * Validates OpenAPI-spec with embedded examples.
 * @param {string}  filePath                        File-path to the OpenAPI-spec
 * @param {boolean} [noAdditionalProperties=false]  Don't allow properties that are not defined in the schema
 * @param {boolean} [allPropertiesRequired=false]   Make all properties required
 * @param {Array.<string>} [ignoreFormats]          List of datatype formats that shall be ignored (to prevent
 *                                                  "unsupported format" errors). If an Array with only one string is
 *                                                  provided where the formats are separated with `\n`, the entries
 *                                                  will be expanded to a new array containing all entries.
 * @returns {ValidationResponse}
 */
async function validateFile(filePath, { noAdditionalProperties, ignoreFormats, allPropertiesRequired } = {}) {
    let openapiSpec = null;
    try {
        openapiSpec = await _parseSpec(filePath);
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return validateExamples(openapiSpec, { noAdditionalProperties, ignoreFormats, allPropertiesRequired });
}

/**
 * Validates examples by mapping-files.
 * @param {string}  filePathSchema              File-path to the OpenAPI-spec
 * @param {string}  globMapExternalExamples     File-path (globs are supported) to the mapping-file containing JSON-
 *                                              paths to schemas as key and a single file-path or Array of file-paths
 *                                              to external examples
 * @param {boolean} [cwdToMappingFile=false]    Change working directory for resolving the example-paths (relative to
 *                                              the mapping-file)
 * @param {boolean} [noAdditionalProperties=false] Don't allow properties that are not defined in the schema
 * @param {boolean} [allPropertiesRequired=false]  Make all properties required
 * @param {Array.<string>} [ignoreFormats]      List of datatype formats that shall be ignored (to prevent
 *                                              "unsupported format" errors). If an Array with only one string is
 *                                              provided where the formats are separated with `\n`, the entries
 *                                              will be expanded to a new array containing all entries.
 * @returns {ValidationResponse}
 */
async function validateExamplesByMap(filePathSchema, globMapExternalExamples,
    { cwdToMappingFile, noAdditionalProperties, ignoreFormats, allPropertiesRequired } = {}
) {
    let matchingFilePathsMapping = 0;
    const filePathsMaps = glob.sync(
        globMapExternalExamples,
        // Using `nonull`-option to explicitly create an app-error if there's no match for `globMapExternalExamples`
        { nonull: true }
    );
    let responses = [];
    // for..of here, to support sequential execution of async calls. This is required, since dereferencing the
    // `openapiSpec` is not concurrency-safe
    for (const filePathMapExternalExamples of filePathsMaps) {
        let mapExternalExamples = null,
            openapiSpec = null;
        try {
            mapExternalExamples = JSON.parse(fs.readFileSync(filePathMapExternalExamples, 'utf-8'));
            openapiSpec = await _parseSpec(filePathSchema);
            openapiSpec = Determiner.getImplementation(openapiSpec)
                .prepare(openapiSpec, { noAdditionalProperties, allPropertiesRequired });
        } catch (err) {
            responses.push(createValidationResponse({ errors: [ApplicationError.create(err)] }));
            continue;
        }
        // Not using `glob`'s response-length, because it is `1` if there's no match for `globMapExternalExamples`.
        // Instead, increment on every match
        matchingFilePathsMapping++;
        responses.push(
            _validate(
                statistics => {
                    return _handleExamplesByMapValidation(
                        openapiSpec, mapExternalExamples, statistics, {
                            cwdToMappingFile,
                            dirPathMapExternalExamples: path.dirname(filePathMapExternalExamples),
                            ignoreFormats
                        }
                    ).map(
                        (/** @type ApplicationError */ error) => Object.assign(error, {
                            mapFilePath: path.normalize(filePathMapExternalExamples)
                        })
                    );
                }
            )
        );
    }
    return merge(
        responses.reduce((res, response) => {
            if (!res) {
                return response;
            }
            return _mergeValidationResponses(res, response);
        }, null),
        { statistics: { matchingFilePathsMapping } }
    );
}

/**
 * Validates a single external example.
 * @param {String}  filePathSchema                  File-path to the OpenAPI-spec
 * @param {String}  pathSchema                      JSON-path to the schema
 * @param {String}  filePathExample                 File-path to the external example-file
 * @param {boolean} [noAdditionalProperties=false]  Don't allow properties that are not described in the schema
 * @param {boolean} [allPropertiesRequired=false]   Make all properties required
 * @param {Array.<string>} [ignoreFormats]          List of datatype formats that shall be ignored (to prevent
 *                                                  "unsupported format" errors). If an Array with only one string is
 *                                                  provided where the formats are separated with `\n`, the entries
 *                                                  will be expanded to a new array containing all entries.
 * @returns {ValidationResponse}
 */
async function validateExample(filePathSchema, pathSchema, filePathExample, {
    noAdditionalProperties,
    ignoreFormats,
    allPropertiesRequired
} = {}) {
    let example = null,
        schema = null,
        openapiSpec = null;
    try {
        example = JSON.parse(fs.readFileSync(filePathExample, 'utf-8'));
        openapiSpec = await _parseSpec(filePathSchema);
        openapiSpec = Determiner.getImplementation(openapiSpec)
            .prepare(openapiSpec, { noAdditionalProperties, allPropertiesRequired });
        schema = _extractSchema(pathSchema, openapiSpec);
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return _validate(
        statistics => _validateExample({
            createValidator: _initValidatorFactory(openapiSpec, { ignoreFormats }),
            schema,
            example,
            statistics,
            filePathExample
        })
    );
}

/**
 * Validates a single example given as argument
 * @param {object}  openapiSpec                     OpenAPI-spec as prepared object
 * @param {String}  pathSchema                      JSON-path to the schema
 * @param {object}  example                         External example as JSON-object
 * @returns {ValidationResponse}
 */
async function validateExampleInline(openapiSpec, pathSchema, example) {
    let schema = null;
    const filePathExample = 'inline';
    try {
        schema = _extractSchema(pathSchema, openapiSpec);
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return _validate(
        statistics => _validateExample({
            createValidator: _initValidatorFactory(openapiSpec),
            schema,
            example,
            statistics,
            filePathExample
        })
    );
}

/**
 * Prepares and returns an OpenAPI specs file as reusable object
 * @param {String}  filePathSchema                  File-path to the OpenAPI-spec
 * @param {boolean} [noAdditionalProperties=false]  Don't allow properties that are not described in the schema
 * @returns {object}
 */
async function prepareOpenapiSpec(filePathSchema, { noAdditionalProperties } = {}) {
    let openapiSpec = null;
    try {
        openapiSpec = await _parseSpec(filePathSchema);
        openapiSpec = Determiner.getImplementation(openapiSpec)
            .prepare(openapiSpec, { noAdditionalProperties });
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return openapiSpec;
}

// Private

/**
 * Parses the OpenAPI-spec (supports JSON and YAML)
 * @param {String}  filePath    File-path to the OpenAPI-spec
 * @returns {object}    Parsed OpenAPI-spec
 * @private
 */
async function _parseSpec(filePath) {
    const isYaml = _isFileTypeYaml(filePath);
    let jsonSchema;

    if (isYaml) {
        try {
            jsonSchema = yaml.parse(fs.readFileSync(filePath, 'utf-8'));
        } catch (e) {
            const { name, message } = e;
            throw new ApplicationError(ErrorType.parseError, { message: `${name}: ${message}` });
        }
    } else {
        jsonSchema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }

    return await dereferenceJsonSchema(filePath, jsonSchema);
}

/**
 * Determines whether the filePath is pointing to a YAML-file
 * @param {String}  filePath    File-path to the OpenAPI-spec
 * @returns {boolean}   `true`, if the file is a YAML-file
 * @private
 */
function _isFileTypeYaml(filePath) {
    const extension = filePath.split('.').pop();
    return FILE_EXTENSIONS__YAML.includes(extension);
}

/**
 * Top-level validator. Prepares common values, required for the validation, then calles the validator and prepares
 * the result for the output.
 * @param {ValidationHandler}   validationHandler       The handler which performs the validation. It will receive the
 *                                                      statistics-object as argument and has to return an Array of
 *                                                      errors (or an empty Array, when all examples are valid)
 * @returns {ValidationResponse}
 * @private
 */
function _validate(validationHandler) {
    const statistics = _initStatistics(),
        errors = validationHandler(statistics);
    return createValidationResponse({ errors, statistics });
}

/**
 * Validates examples by a mapping-file.
 * @param {Object}                  openapiSpec                     OpenAPI-spec
 * @param {Object}                  mapExternalExamples             Mapping-file containing JSON-paths to schemas as
 *                                                                  key and a single file-path or Array of file-paths
 *                                                                  to external examples
 * @param {ValidationStatistics}    statistics                      Validation-statistics
 * @param {boolean}                 [cwdToMappingFile=false]        Change working directory for resolving the example-
 *                                                                  paths (relative to the mapping-file)
 * @param {string}                  [dirPathMapExternalExamples]    The directory-path of the mapping-file
 * @param {Array.<string>} [ignoreFormats]          List of datatype formats that shall be ignored (to prevent
 *                                                  "unsupported format" errors). If an Array with only one string is
 *                                                  provided where the formats are separated with `\n`, the entries
 *                                                  will be expanded to a new array containing all entries.
 * @returns {Array.<ApplicationError>}
 * @private
 */
function _handleExamplesByMapValidation(openapiSpec, mapExternalExamples, statistics,
    { cwdToMappingFile = false, dirPathMapExternalExamples, ignoreFormats }
) {
    return flatMap(Object.entries(mapExternalExamples), ([pathSchema, filePathsExample]) => {
        let schema = null;
        try {
            schema = _extractSchema(pathSchema, openapiSpec);
        } catch (/** @type ErrorJsonPathNotFound */ err) {
            // If the schema can't be found, don't even attempt to process the examples
            return ApplicationError.create(err);
        }
        return flatMap(
            flatten([filePathsExample]),
            filePathExample => {
                let examples = [];
                try {
                    const resolvedFilePathExample = cwdToMappingFile
                        ? path.join(dirPathMapExternalExamples, filePathExample)
                        : filePathExample;
                    const globResolvedFilePathExample = glob.sync(resolvedFilePathExample);
                    if (globResolvedFilePathExample.length === 0) {
                        return [ApplicationError.create({
                            type: ErrorType.jsENOENT,
                            message: `No such file or directory: '${resolvedFilePathExample}'`,
                            path: resolvedFilePathExample
                        })];
                    }
                    for (const filePathExample of globResolvedFilePathExample) {
                        examples.push({
                            path: path.normalize(filePathExample),
                            content: JSON.parse(fs.readFileSync(filePathExample, 'utf-8'))
                        });
                    }
                } catch (err) {
                    return [ApplicationError.create(err)];
                }
                return flatMap(examples, example => _validateExample({
                    createValidator: _initValidatorFactory(openapiSpec, { ignoreFormats }),
                    schema,
                    example: example.content,
                    statistics,
                    filePathExample: example.path
                }));
            }
        );
    });
}

/**
 * Merges two `ValidationResponses` together and returns the merged result. The passed `ValidationResponse`s won't be
 * modified.
 * @param {ValidationResponse} response1
 * @param {ValidationResponse} response2
 * @returns {ValidationResponse}
 * @private
 */
function _mergeValidationResponses(response1, response2) {
    return createValidationResponse({
        errors: response1.errors.concat(response2.errors),
        statistics: Object.entries(response1.statistics)
            .reduce((res, [key, val]) => {
                if (PROP__SCHEMAS_WITH_EXAMPLES === key) {
                    [
                        response1,
                        response2
                    ].forEach(response => {
                        const schemasWithExample = response.statistics[SYM__INTERNAL][PROP__SCHEMAS_WITH_EXAMPLES]
                            .values();
                        for (let schema of schemasWithExample) {
                            res[SYM__INTERNAL][PROP__SCHEMAS_WITH_EXAMPLES].add(schema);
                        }
                    });
                    return res;
                }
                res[key] = val + response2.statistics[key];
                return res;
            }, _initStatistics())
    });
}

/**
 * Extracts all JSON-paths to examples from a OpenAPI-spec
 * @param {Object}  openapiSpec         OpenAPI-spec
 * @param {String}  jsonPathToExamples  JSON-path to the examples, in the OpenAPI-Spec
 * @returns {Array.<String>} JSON-paths to examples
 * @private
 */
function _extractExamplePaths(openapiSpec, jsonPathToExamples) {
    return jsonPath({
        json: openapiSpec,
        path: jsonPathToExamples,
        resultType: ResultType.path
    });
}

/**
 * Validates examples at the given paths in the OpenAPI-spec.
 * @param {Object}          impl            Spec-dependant validator
 * @param {Array.<String>}  pathsExamples   JSON-paths to examples
 * @param {Object}          openapiSpec     OpenAPI-spec
 * @param {Array.<string>} [ignoreFormats]  List of datatype formats that shall be ignored (to prevent
 *                                          "unsupported format" errors). If an Array with only one string is
 *                                          provided where the formats are separated with `\n`, the entries
 *                                          will be expanded to a new array containing all entries.
 * @returns {ValidationResponse}
 * @private
 */
function _validateExamplesPaths({ impl }, pathsExamples, openapiSpec, { ignoreFormats }) {
    const statistics = _initStatistics(),
        validationResult = {
            valid: true,
            statistics,
            errors: []
        },
        createValidator = _initValidatorFactory(openapiSpec, { ignoreFormats });
    let validationMap;
    try {
        // Create mapping between JSON-schemas and examples
        validationMap = impl.buildValidationMap(pathsExamples);
    } catch (error) {
        // Throw unexpected errors
        if (!(error instanceof ApplicationError)) {
            throw error;
        }
        // Add known errors and stop
        validationResult.valid = false;
        validationResult.errors.push(error);
        return validationResult;
    }
    // Start validation
    const schemaPaths = Object.keys(validationMap);
    schemaPaths.forEach(pathSchema => {
        _validateSchema({
            openapiSpec, createValidator, pathSchema, validationMap, statistics,
            validationResult
        });
    });
    // Revert escaped example names from the results
    validationResult.errors.forEach((example) => {
        example.examplePath = impl.unescapeExampleNames(example.examplePath);
    });
    return validationResult;
}

/**
 * Validates a single schema.
 * @param {Object}                  openapiSpec         OpenAPI-spec
 * @param {ajv}                     createValidator     Factory, to create JSON-schema validator
 * @param {string}                  pathSchema          JSON-path to schema (for request- or response-property)
 * @param {Object.<String, String>} validationMap Map with schema-path as key and example-paths as value
 * @param {Object}                  statistics          Object to contain statistics metrics
 * @param {Object}                  validationResult    Container, for the validation-results
 * @private
 */
function _validateSchema({
    openapiSpec, createValidator, pathSchema, validationMap, statistics,
    validationResult
}) {
    const errors = validationResult.errors;
    validationMap[pathSchema].forEach(pathExample => {
        const example = _getObjectByPath(pathExample, openapiSpec),
            // Examples with missing schemas may occur and those are considered valid
            schema = _extractSchema(pathSchema, openapiSpec, true),
            curErrors = _validateExample({
                createValidator,
                schema,
                example,
                statistics
            }).map(error => {
                error.examplePath = jsonPath.toPointer(jsonPath.toPathArray(pathExample));
                return error;
            });
        if (!curErrors.length) {
            return;
        }
        validationResult.valid = false;
        errors.splice(errors.length - 1, 0, ...curErrors);
    });
}

/**
 * Creates a container-object for the validation statistics.
 * @returns {ValidationStatistics}
 * @private
 */
function _initStatistics() {
    const statistics = {
        [SYM__INTERNAL]: {
            [PROP__SCHEMAS_WITH_EXAMPLES]: new Set()
        },
        examplesTotal: 0,
        examplesWithoutSchema: 0
    };
    Object.defineProperty(statistics, PROP__SCHEMAS_WITH_EXAMPLES, {
        enumerable: true,
        get: () => statistics[SYM__INTERNAL][PROP__SCHEMAS_WITH_EXAMPLES].size
    });
    return statistics;
}

/**
 * Extract object(s) by the given JSON-path
 * @param {String}  path    JSON-path
 * @param {Object}  json    JSON to extract the object(s) from
 * @returns {Object|Array.<Object>|undefined} All matching objects. Single object if there is only one match
 * @private
 */
function _getObjectByPath(path, json) {
    return jsonPath({
        json,
        path,
        flatten: true,
        wrap: false,
        resultType: ResultType.value
    });
}

/**
 * Validates example against the schema. The precondition for this function to work is that the example exists at the
 * given path.
 * `pathExample` and `filePathExample` are exclusively mandatory.
 * itself
 * @param {Function}    createValidator     Factory, to create JSON-schema validator
 * @param {Object}      schema              JSON-schema
 * @param {Object}      example             Example to validate
 * @param {Object}      statistics          Object to contain statistics metrics
 * @param {String}      [filePathExample]   File-path to the example file
 * @returns {Array.<Object>} Array with errors. Empty array, if examples are valid
 * @private
 */
function _validateExample({ createValidator, schema, example, statistics, filePathExample }) {
    const
        errors = [];
    statistics.examplesTotal++;
    // No schema, no validation (Examples without schema are considered valid)
    if (!schema) {
        statistics.examplesWithoutSchema++;
        return errors;
    }
    statistics[SYM__INTERNAL][PROP__SCHEMAS_WITH_EXAMPLES].add(schema);
    const validate = compileValidate(createValidator(), schema);
    if (validate(example)) {
        return errors;
    }
    return errors.concat(...validate.errors.map(ApplicationError.create))
        .map(error => {
            if (!filePathExample) {
                return error;
            }
            error.exampleFilePath = filePathExample;
            return error;
        });
}

/**
 * Create a new instance of a JSON schema validator
 * @returns {ajv}
 * @private
 */
function _initValidatorFactory(specSchema, { ignoreFormats }) {
    return getValidatorFactory(specSchema, {
        schemaId: 'auto',
        allErrors: true,
        nullable: true,
        formats: ignoreFormats && ignoreFormats.reduce((result, entry) => {
            result[entry] = () => true;
            return result;
        }, {})
    });
}

/**
 * Extracts the schema in the OpenAPI-spec at the given JSON-path.
 * @param   {string}    pathSchema                          JSON-path to the schema
 * @param   {Object}    openapiSpec                         OpenAPI-spec
 * @param   {boolean}   [suppressErrorIfNotFound=false]     Don't throw `ErrorJsonPathNotFound` if the response does not
 *                                                          exist at the given JSON-path
 * @returns {Object|Array.<Object>|undefined} Matching schema(s)
 * @throws  {ErrorJsonPathNotFound} Thrown, when there is no schema at the given path and
 *                                  `suppressErrorIfNotFound` is false
 * @private
 */
function _extractSchema(pathSchema, openapiSpec, suppressErrorIfNotFound = false) {
    const schema = _getObjectByPath(pathSchema, openapiSpec);
    if (!suppressErrorIfNotFound && !schema) {
        throw new ErrorJsonPathNotFound(`Path to schema can't be found: '${pathSchema}'`, {
            params: {
                path: pathSchema
            }
        });
    }
    return schema;
}
