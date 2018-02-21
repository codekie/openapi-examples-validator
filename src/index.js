const
    _ = require('lodash'),
    fs = require('fs'),
    jsonPath = require('jsonpath-plus'),
    Ajv = require('ajv'),
    { createError } = require('errno').custom;

// CONSTANTS

const
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLES = 'examples',
    PATH__EXAMPLES = `$..${ PROP__EXAMPLES }.application/json`,
    ERR_TYPE__JSON_PATH_NOT_FOUND = 'JsonPathNotFound',
    ERR_TYPE__VALIDATION = 'Validation';

// STATICS

/**
 * @typedef {{}} CustomError
 */

/**
 * @constructor
 * @augments CustomError
 * @returns {{
 *      cause: {
 *          [params]: {
 *              [path]: string
 *          }
 *      }
 * }}
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
 * ApplicationError
 * @typedef {{
 *      type: string,
 *      message: string,
 *      [dataPath]: string,
 *      [examplePath]: string,
 *      [exampleFilePath]: string,
 *      [keyword]: string,
 *      [mapFilePath]: string,
 *      [params]: {
 *          [path]: string,
 *          [missingProperty]: string,
 *          [type]: string
 *      },
 *      [schemaPath]: string
 * }} ApplicationError
 */

/**
 * ValidationStatistics
 * @typedef {{
 *      responseSchemasWithExamples: (number|'-'),
 *      responseExamplesTotal: (number|'-'),
 *      responseExamplesWithoutSchema: (number|'-')
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

// Public

/**
 * Validates Swagger-spec with embedded examples.
 * @param {Object}  swaggerSpec Swagger-spec
 * @returns {ValidationResponse}
 */
function validateExamples(swaggerSpec) {
    const pathsExamples = _extractExamplePaths(swaggerSpec);
    return _validateExamplesPaths(pathsExamples, swaggerSpec);
}

/**
 * Validates Swagger-spec with embedded examples.
 * @param {String}  filePath    File-path to the swagger-spec
 * @returns {ValidationResponse}
 */
function validateFile(filePath) {
    let swaggerSpec = null;
    try {
        swaggerSpec = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch (err) {
        return _createValidationResponse({ errors: [_createAppError(err)] });
    }
    return validateExamples(swaggerSpec);
}

/**
 * Validates examples by a mapping-file.
 * @param {String}  filePathSchema              File-path to the Swagger-spec
 * @param {String}  filePathMapExternalExamples File-path the mapping-file containing JSON-paths to response-schemas as
 *                                              key and a single file-path or Array of file-paths to external examples
 * @returns {ValidationResponse}
 */
function validateExamplesByMap(filePathSchema, filePathMapExternalExamples) {
    let mapExternalExamples = null,
        swaggerSpec = null;
    try {
        mapExternalExamples = JSON.parse(fs.readFileSync(filePathMapExternalExamples, 'utf-8'));
        swaggerSpec = JSON.parse(fs.readFileSync(filePathSchema, 'utf-8'));
    } catch (err) {
        return _createValidationResponse({ errors: [_createAppError(err)] });
    }
    return _validate(
        Object.keys(mapExternalExamples),
        statistics => _(mapExternalExamples)
            .entries()
            .flatMap(([pathResponseSchema, filePathsExample]) => {
                let responseSchema = null;
                try {
                    responseSchema = _extractResponseSchema(pathResponseSchema, swaggerSpec);
                } catch (/** @type ErrorJsonPathNotFound */ err) {
                    // If the response-schema can't be found, don't even attempt to process the examples
                    err.cause.mapFilePath = filePathMapExternalExamples;
                    return _createAppError(err);
                }
                return _([filePathsExample])
                    .flatten()
                    .flatMap(filePathExample => {
                        let example = null;
                        try {
                            example = JSON.parse(fs.readFileSync(filePathExample, 'utf-8'));
                        } catch (err) {
                            return _createAppError(err);
                        }
                        return _validateExample({
                            validator: _createValidator(),
                            responseSchema,
                            example,
                            statistics
                        }).map(error => {
                            error.exampleFilePath = filePathExample;
                            return error;
                        });
                    })
                    .toArray()
                    .forEach(error => Object.assign(error, { mapFilePath: filePathMapExternalExamples }));
            })
            .value()
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
        return _createValidationResponse({ errors: [_createAppError(err)] });
    }
    return _validate(
        [pathResponseSchema],
        statistics => _validateExample({
            validator: _createValidator(),
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
 * @param {Array.<String>}  pathsResponseSchema     JSON-paths to the schemas of the responses
 * @param {Function}        validationHandler       The handler which performs the validation. It will receive the
 *                                                  statistics-object as argument and has to return an Array of errors
 *                                                  (or an empty Array, when all examples are valid)
 * @returns {ValidationResponse}
 * @private
 */
function _validate(pathsResponseSchema, validationHandler) {
    const statistics = _initStatistics({ schemaPaths: pathsResponseSchema }),
        errors = validationHandler(statistics);
    return _createValidationResponse({ errors, statistics });
}

/**
 * Creates a unified application error, which is able to consume validation-errors and JS-errors.
 * If a validation error is passed, all properties will be adopted.
 * @param {Error|CustomError}   err     Javascript-, validation- or custom-error
 * @returns {ApplicationError} Unified application-error
 * @private
 */
function _createAppError(err) {
    const
        { code, message, path, cause } = err,               // Certain properties of Javascript-errors
        type = code || err.type || ERR_TYPE__VALIDATION,    // If `code` is available then it's a Javascript-error
        errorApp = { type, message };
    if (ERR_TYPE__VALIDATION === type) {
        // If it's an validation-error, copy all properties
        _.merge(errorApp, err);
    } else {
        // Copy certain properties of Javascript-error (but only if available)
        path && _.merge(errorApp, { params: { path } });
        cause && _.merge(errorApp, cause);
    }
    return errorApp;
}

/**
 * Creates a unified response for the validation-result
 * @param {Array.<ApplicationError>}    errors
 * @param {ValidationStatistics}        statistics
 * @returns {ValidationResponse}
 * @private
 */
function _createValidationResponse({ errors, statistics = {} }) {
    return {
        valid: !errors.length,
        statistics,
        errors
    };
}

/**
 * Extracts all JSON-paths to examples from a Swagger-spec
 * @param {Object}  swaggerSpec Swagger-spec
 * @returns {Array.<String>} JSON-paths to examples
 * @private
 */
function _extractExamplePaths(swaggerSpec) {
    return jsonPath({
        json: swaggerSpec,
        path: PATH__EXAMPLES,
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
        validator = _createValidator(),
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
                validator,
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
 * @param {ajv}             validator           JSON-schema validator
 * @param {Object}          responseSchema      JSON-schema for the response
 * @param {String}          example             Example to validate
 * @param {Object}          statistics          Object to contain statistics metrics
 * @returns {Array.<Object>} Array with errors. Empty array, if examples are valid
 * @private
 */
function _validateExample({ validator, responseSchema, example, statistics }) {
    const
        errors = [];
    statistics.responseExamplesTotal++;
    // No schema, no validation (Examples without schema are considered valid)
    if (!responseSchema) {
        statistics.responseSchemasWithExamples--;
        statistics.responseExamplesWithoutSchema++;
        return errors;
    }
    if (validator.validate(responseSchema, example)) { return errors; }
    return errors.concat(...validator.errors.map(_createAppError));
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
function _createValidator() {
    return new Ajv({
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
        throw new ErrorJsonPathNotFound(`Path to response-schema can't be found: '${ pathResponseSchema }'`, {
            params: {
                path: pathResponseSchema
            }
        });
    }
    return schema;
}
