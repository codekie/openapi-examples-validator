const
    _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    glob = require('glob'),
    { JSONPath: jsonPath } = require('jsonpath-plus'),
    { createError } = require('errno').custom,
    { getValidatorFactory, compileValidate } = require('./validator'),
    Determiner = require('./impl'),
    ApplicationError = require('./application-error'),
    { ERR_TYPE__JSON_PATH_NOT_FOUND } = ApplicationError,
    { createValidationResponse } = require('./utils');

// CONSTANTS

const
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLES = 'examples';

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
const ErrorJsonPathNotFound = createError(ERR_TYPE__JSON_PATH_NOT_FOUND);

// PUBLIC API

module.exports = {
    'default': validateExamples,
    validateFile,
    validateExample,
    validateExamplesByMap
};

// IMPLEMENTATION DETAILS

// Type definitions

/**
 * ValidationStatistics
 * @typedef {{
 *      responseSchemasWithExamples: number,
 *      responseExamplesTotal: number,
 *      responseExamplesWithoutSchema: number,
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
 * Validates Swagger-spec with embedded examples.
 * @param {Object}  swaggerSpec         Swagger-spec
 * @returns {ValidationResponse}
 */
function validateExamples(swaggerSpec) {
    const jsonPathToExamples = Determiner.getImplementation(swaggerSpec).getJsonPathToExamples(),
        pathsExamples = _extractExamplePaths(swaggerSpec, jsonPathToExamples);
    return _validateExamplesPaths(pathsExamples, swaggerSpec);
}

/**
 * Validates Swagger-spec with embedded examples.
 * @param {string}  filePath    File-path to the swagger-spec
 * @returns {ValidationResponse}
 */
function validateFile(filePath) {
    let swaggerSpec = null;
    try {
        swaggerSpec = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return validateExamples(swaggerSpec);
}

/**
 * Validates examples by mapping-files.
 * @param {string}  filePathSchema              File-path to the Swagger-spec
 * @param {string}  globMapExternalExamples     File-path (globs are supported) to the mapping-file containing JSON-
 *                                              paths to response-schemas as key and a single file-path or Array of
 *                                              file-paths to external examples
 * @param {boolean} [cwdToMappingFile=false]    Change working directory for resolving the example-paths (relative to
 *                                              the mapping-file)
 * @returns {ValidationResponse}
 */
function validateExamplesByMap(filePathSchema, globMapExternalExamples, { cwdToMappingFile } = {}) {
    let matchingFilePathsMapping = 0;
    const responses = glob.sync(
        globMapExternalExamples,
        // Using `nonull`-option to explicitly create an app-error if there's no match for `globMapExternalExamples`
        { nonull: true }
    ).map(filePathMapExternalExamples => {
        let mapExternalExamples = null,
            swaggerSpec = null;
        try {
            mapExternalExamples = JSON.parse(fs.readFileSync(filePathMapExternalExamples, 'utf-8'));
            swaggerSpec = JSON.parse(fs.readFileSync(filePathSchema, 'utf-8'));
        } catch (err) {
            return createValidationResponse({ errors: [ApplicationError.create(err)] });
        }
        // Not using `glob`'s response-length, becuse it is `1` if there's no match for `globMapExternalExamples`.
        // Instead, increment on every match
        matchingFilePathsMapping++;
        return _validate(
            Object.keys(mapExternalExamples),
            statistics => _handleExamplesByMapValidation(swaggerSpec, mapExternalExamples, statistics, {
                cwdToMappingFile,
                dirPathMapExternalExamples: path.dirname(filePathMapExternalExamples)
            }).map((/** @type ApplicationError */ error) => Object.assign(error, {
                mapFilePath: filePathMapExternalExamples
            }))
        );
    });
    return _.merge(
        responses.reduce((res, response) => {
            if (!res) { return response; }
            return _mergeValidationResponses(res, response);
        }, null),
        { statistics: { matchingFilePathsMapping } }
    );
}

/**
 * Validates a single external example.
 * @param {String}  filePathSchema      File-path to the Swagger-spec
 * @param {String}  pathResponseSchema  JSON-path to the response-schema
 * @param {String}  filePathExample     File-path to the external example-file
 * @returns {ValidationResponse}
 */
function validateExample(filePathSchema, pathResponseSchema, filePathExample) {
    let example = null,
        responseSchema = null,
        swaggerSpec = null;
    try {
        example = JSON.parse(fs.readFileSync(filePathExample, 'utf-8'));
        swaggerSpec = JSON.parse(fs.readFileSync(filePathSchema, 'utf-8'));
        responseSchema = _extractResponseSchema(pathResponseSchema, swaggerSpec);
    } catch (err) {
        return createValidationResponse({ errors: [ApplicationError.create(err)] });
    }
    return _validate(
        [pathResponseSchema],
        statistics => _validateExample({
            createValidator: _initValidatorFactory(swaggerSpec),
            responseSchema,
            example,
            statistics
        }).map(error => {
            error.exampleFilePath = filePathExample;
            return error;
        })
    );
}

// Private

/**
 * Top-level validator. Prepares common values, required for the validation, then calles the validator and prepares
 * the result for the output.
 * @param {Array.<String>}      pathsResponseSchema     JSON-paths to the schemas of the responses
 * @param {ValidationHandler}   validationHandler       The handler which performs the validation. It will receive the
 *                                                      statistics-object as argument and has to return an Array of
 *                                                      errors (or an empty Array, when all examples are valid)
 * @returns {ValidationResponse}
 * @private
 */
function _validate(pathsResponseSchema, validationHandler) {
    const statistics = _initStatistics({ schemaPaths: pathsResponseSchema }),
        errors = validationHandler(statistics);
    return createValidationResponse({ errors, statistics });
}

/**
 * Validates examples by a mapping-file.
 * @param {Object}                  swaggerSpec                     Swagger-spec
 * @param {Object}                  mapExternalExamples             Mapping-file containing JSON-paths to response-
 *                                                                  schemas as key and a single file-path or Array of
 *                                                                  file-paths to
 * @param {ValidationStatistics}    statistics                      Validation-statistics
 * @param {boolean}                 [cwdToMappingFile=false]        Change working directory for resolving the example-
 *                                                                  paths (relative to the mapping-file)
 * @param {string}                  [dirPathMapExternalExamples]    The directory-path of the mapping-file
 * @returns {Array.<ApplicationError>}
 * @private
 */
function _handleExamplesByMapValidation(swaggerSpec, mapExternalExamples, statistics,
    { cwdToMappingFile = false, dirPathMapExternalExamples }
) {
    return _(mapExternalExamples)
        .entries()
        .flatMap(([pathResponseSchema, filePathsExample]) => {
            let responseSchema = null;
            try {
                responseSchema = _extractResponseSchema(pathResponseSchema, swaggerSpec);
            } catch (/** @type ErrorJsonPathNotFound */ err) {
                // If the response-schema can't be found, don't even attempt to process the examples
                return ApplicationError.create(err);
            }
            return _([filePathsExample])
                .flatten()
                .flatMap(filePathExample => {
                    let example = null;
                    try {
                        const resolvedFilePathExample = cwdToMappingFile
                            ? path.join(dirPathMapExternalExamples, filePathExample)
                            : filePathExample;
                        example = JSON.parse(fs.readFileSync(resolvedFilePathExample, 'utf-8'));
                    } catch (err) {
                        return ApplicationError.create(err);
                    }
                    return _validateExample({
                        createValidator: _initValidatorFactory(swaggerSpec),
                        responseSchema,
                        example,
                        statistics
                    }).map(error => {
                        error.exampleFilePath = filePathExample;
                        return error;
                    });
                })
                .value();
        })
        .value();
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
        statistics: _.entries(response1.statistics)
            .reduce((res, [key, val]) => {
                res[key] = val + response2.statistics[key];
                return res;
            }, _initStatistics({ schemaPaths: [] }))
    });
}

/**
 * Extracts all JSON-paths to examples from a Swagger-spec
 * @param {Object}  swaggerSpec         Swagger-spec
 * @param {String}  jsonPathToExamples  JSON-path to the examples, in the Swagger-Spec
 * @returns {Array.<String>} JSON-paths to examples
 * @private
 */
function _extractExamplePaths(swaggerSpec, jsonPathToExamples) {
    return jsonPath({
        json: swaggerSpec,
        path: jsonPathToExamples,
        resultType: 'path'
    });
}

/**
 * Validates examples at the given paths in the Swagger-spec.
 * @param {Array.<String>}  pathsExamples   JSON-paths to examples
 * @param {Object}          swaggerSpec     Swagger-spec
 * @returns {ValidationResponse}
 * @private
 */
function _validateExamplesPaths(pathsExamples, swaggerSpec) {
    const
        createValidator = _initValidatorFactory(swaggerSpec),
        validationMap = _buildValidationMap(pathsExamples),
        schemaPaths = Object.keys(validationMap),
        statistics = _initStatistics({ schemaPaths }),
        validationResult = {
            valid: true,
            statistics,
            errors: []
        };
    schemaPaths.forEach(pathResponseSchema => {
        const
            errors = validationResult.errors,
            pathExample = validationMap[pathResponseSchema],
            example = _getObjectByPath(pathExample, swaggerSpec),
            // Missing response-schemas may occur and are considered valid
            responseSchema = _extractResponseSchema(pathResponseSchema, swaggerSpec, true),
            curErrors = _validateExample({
                createValidator,
                responseSchema,
                example,
                statistics
            }).map(error => {
                error.examplePath = jsonPath.toPointer(jsonPath.toPathArray(pathExample));
                return error;
            });
        if (!curErrors.length) { return; }
        validationResult.valid = false;
        errors.splice(errors.length - 1, 0, ...curErrors);
    });
    return validationResult;
}

/**
 * Creates a container-object for the validation statistics.
 * @param {Array.<String>}  schemaPaths     JSON-paths to the response-schemas
 * @returns {ValidationStatistics}
 * @private
 */
function _initStatistics({ schemaPaths }) {
    return {
        responseSchemasWithExamples: schemaPaths.length,
        responseExamplesTotal: 0,
        responseExamplesWithoutSchema: 0
    };
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
        resultType: 'value'
    });
}

/**
 * Builds a map with the path to the repsonse-schema as key and the paths to the examples, as value. The path of the
 * schema is derived from the path to the example and doesn't necessarily mean that the schema actually exists.
 * @param {Array.<String>}  pathsExamples   Paths to the examples
 * @returns {Object.<String, String>} Map with schema-path as key and example-paths as value
 * @private
 */
function _buildValidationMap(pathsExamples) {
    return pathsExamples.reduce((validationMap, pathExample) => {
        const pathSchema = _getSchemaPathOfExample(pathExample);
        validationMap[pathSchema] = pathExample;
        return validationMap;
    }, {});
}

/**
 * Validates example against the schema. The precondition for this function to work is that the example exists at the
 * given path.
 * `pathExample` and `filePathExample` are exclusively mandatory.
 * itself
 * @param {Function}    createValidator Factory, to create JSON-schema validator
 * @param {Object}      responseSchema  JSON-schema for the response
 * @param {Object}      example         Example to validate
 * @param {Object}      statistics      Object to contain statistics metrics
 * @returns {Array.<Object>} Array with errors. Empty array, if examples are valid
 * @private
 */
function _validateExample({ createValidator, responseSchema, example, statistics }) {
    const
        errors = [];
    statistics.responseExamplesTotal++;
    // No schema, no validation (Examples without schema are considered valid)
    if (!responseSchema) {
        statistics.responseSchemasWithExamples--;
        statistics.responseExamplesWithoutSchema++;
        return errors;
    }
    const validate = compileValidate(createValidator(), responseSchema);
    if (validate(example)) { return errors; }
    return errors.concat(...validate.errors.map(ApplicationError.create));
}

/**
 * Gets a JSON-path to the corresponding response-schema, based on a JSON-path to an example.
 * @param {String}  pathExample JSON-path to example
 * @returns {String} JSON-path to the corresponding response-schema
 * @private
 */
function _getSchemaPathOfExample(pathExample) {
    const
        pathSegs = jsonPath.toPathArray(pathExample).slice(),
        idxExamples = pathSegs.lastIndexOf(PROP__EXAMPLES);
    pathSegs.splice(idxExamples, pathSegs.length - idxExamples, PROP__SCHEMA);
    return jsonPath.toPathString(pathSegs);
}

/**
 * Create a new instance of a JSON schema validator
 * @returns {ajv}
 * @private
 */
function _initValidatorFactory(specSchema) {
    return getValidatorFactory(specSchema, {
        allErrors: true
    });
}

/**
 * Extracts the response-schema in the Swagger-spec at the given JSON-path.
 * @param   {string}    pathResponseSchema                  JSON-path to response-schema
 * @param   {Object}    swaggerSpec                         Swagger-spec
 * @param   {boolean}   [suppressErrorIfNotFound=false]     Don't throw `ErrorJsonPathNotFound` if the repsonse does not
 *                                                          exist at the given JSON-path
 * @returns {Object|Array.<Object>|undefined} Matching schema(s)
 * @throws  {ErrorJsonPathNotFound} Thrown, when there is no response-schema at the given path and
 *                                  `suppressErrorIfNotFound` is false
 * @private
 */
function _extractResponseSchema(pathResponseSchema, swaggerSpec, suppressErrorIfNotFound = false) {
    const schema = _getObjectByPath(pathResponseSchema, swaggerSpec);
    if (!suppressErrorIfNotFound && !schema) {
        throw new ErrorJsonPathNotFound(`Path to response-schema can't be found: '${pathResponseSchema}'`, {
            params: {
                path: pathResponseSchema
            }
        });
    }
    return schema;
}
