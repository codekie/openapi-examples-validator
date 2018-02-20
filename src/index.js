const
    _ = require('lodash'),
    fs = require('fs'),
    jsonPath = require('jsonpath-plus'),
    Ajv = require('ajv');

// PUBLIC API

export default validateExamples;
export {
    validateFile,
    validateExample,
    validateExamplesByMap
};

// IMPLEMENTATION DETAILS

const
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLES = 'examples',
    PATH__EXAMPLES = `$..${ PROP__EXAMPLES }.application/json`;

// Public

function validateExamples(jsonSchema) {
    const pathsExamples = _extractExamplePaths(jsonSchema);
    return _validateExamplesPaths(pathsExamples, jsonSchema);
}

function validateFile(filePath) {
    const jsonSchema = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return validateExamples(jsonSchema);
}

function validateExamplesByMap(filePathSchema, filePathMapExternalExamples) {
    const mapExternalExamples = JSON.parse(fs.readFileSync(filePathMapExternalExamples, 'utf-8')),
        statistics = _initStatistics({ schemaPaths: Object.keys(mapExternalExamples) }),
        errors = _(mapExternalExamples)
            .entries()
            .flatMap(([pathResponseSchema, filePathsExample]) => _([filePathsExample])
                .flatten()
                .flatMap(filePathExample => _validateExample({
                    validator: _createValidator(),
                    jsonSchema: JSON.parse(fs.readFileSync(filePathSchema, 'utf-8')),
                    pathResponseSchema,
                    filePathExample,
                    statistics
                }))
                .value()
            )
            .value();
    return {
        valid: !errors.length,
        statistics,
        errors
    };
}

function validateExample(filePathSchema, pathResponseSchema, filePathExample) {
    const statistics = _initStatistics({ schemaPaths: [pathResponseSchema] }),
        errors = _validateExample({
            validator: _createValidator(),
            jsonSchema: JSON.parse(fs.readFileSync(filePathSchema, 'utf-8')),
            pathResponseSchema,
            filePathExample,
            statistics
        });
    return {
        valid: !errors.length,
        statistics,
        errors
    };
}

// Private

function _extractExamplePaths(jsonSchema) {
    return jsonPath({
        json: jsonSchema,
        path: PATH__EXAMPLES,
        resultType: 'path'
    });
}

function _validateExamplesPaths(pathsExamples, jsonSchema) {
    const
        validator = _createValidator(),
        validationMap = _buildValidationMap(pathsExamples),
        schemaPaths = Object.keys(validationMap),
        statistics = _initStatistics({ schemaPaths }),
        validationResult = {
            valid: true,
            statistics
        };
    schemaPaths.forEach(pathResponseSchema => {
        const curErrors = _validateExample({ validator, jsonSchema, pathResponseSchema,
            pathExample: validationMap[pathResponseSchema], statistics });
        if (!curErrors.length) { return; }
        validationResult.valid = false;
        let errors = validationResult.errors;
        if (!errors) {
            errors = [];
            validationResult.errors = errors;
        }
        validationResult.errors.splice(errors.length - 1, 0, ...curErrors);
    });
    return validationResult;
}

function _initStatistics({ schemaPaths }) {
    return {
        responseSchemasWithExamples: schemaPaths.length,
        responseExamplesTotal: 0,
        responseExamplesWithoutSchema: 0
    };
}

function _getObjectByPath(path, schema) {
    return jsonPath({
        json: schema,
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
 * @returns {Object.<String, String>}       Map with schema-path as key and example-paths as value
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
 * @param {Object}          validator           JSON-schema validator
 * @param {Object}          jsonSchema          Swagger-JSON
 * @param {String}          pathResponseSchema  Path to the schema of the response
 * @param {String}          [pathExample]       JsonPath to the example to validate
 * @param {Object}          [filePathExample]   The file path to the example-file to be validated
 * @param {Object}          statistics          Object to contain statistics metrics
 * @returns {Array.<Object>}    Array with errors. Empty array, if examples are valid
 * @private
 */
function _validateExample({ validator, jsonSchema, pathResponseSchema, pathExample, filePathExample, statistics }) {
    const
        errors = [],
        schema = _getObjectByPath(pathResponseSchema, jsonSchema),
        resolvedExample = filePathExample
            ? JSON.parse(fs.readFileSync(filePathExample, 'utf-8'))
            : _getObjectByPath(pathExample, jsonSchema);
    statistics.responseExamplesTotal++;
    // No schema, no validation (Examples without schema are considered valid)
    if (!schema) {
        statistics.responseSchemasWithExamples--;
        statistics.responseExamplesWithoutSchema++;
        return errors;
    }
    if (validator.validate(schema, resolvedExample)) { return errors; }
    return errors.concat(...validator.errors.map((error) => {
        // Convert path-array to JSON-pointer
        if (pathExample) {
            error.examplePath = jsonPath.toPointer(jsonPath.toPathArray(pathExample));
        } else {
            error.exampleFilePath = filePathExample;
        }
        return error;
    }));
}

function _getSchemaPathOfExample(pathExample) {
    const
        pathSegs = jsonPath.toPathArray(pathExample).slice(),
        idxExamples = pathSegs.lastIndexOf(PROP__EXAMPLES);
    pathSegs.splice(idxExamples, pathSegs.length - idxExamples, PROP__SCHEMA);
    return jsonPath.toPathString(pathSegs);
}

function _createValidator() {
    return new Ajv({
        allErrors: true
    });
}
