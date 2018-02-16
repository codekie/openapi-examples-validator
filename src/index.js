const
    fs = require('fs'),
    jsonPath = require('jsonpath-plus'),
    Ajv = require('ajv');

// PUBLIC API

export default validateExamples;
export {
    validateFile
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
 * Builds a map with the path to the repsonse-schema as key and the paths to the examples, as value
 * @param {Array.<String>}  pathsExamples   Paths to the examples
 * @returns {Object.<String, Array.<String>>}   Map with schema-path as key and example-paths as value
 * @private
 */
function _buildValidationMap(pathsExamples) {
    return pathsExamples.reduce((validationMap, pathExample) => {
        const
            pathSchema = _getSchemaPathOfExample(pathExample);
        validationMap[pathSchema] = pathExample;
        return validationMap;
    }, {});
}

/**
 * Validates example against the schema.
 * @param {Object}          validator           JSON-schema validator
 * @param {Object}          jsonSchema          Swagger-JSON
 * @param {String}          pathResponseSchema  Path to the schema of the response
 * @param {Array.<String>}  pathExample         Example to validate
 * @param {Object}          statistics          Object to contain statistics metrics
 * @returns {Array.<Object>}    Array with errors. Empty array, if examples are valid
 * @private
 */
function _validateExample({ validator, jsonSchema, pathResponseSchema, pathExample, statistics }) {
    const
        errors = [],
        schema = _getObjectByPath(pathResponseSchema, jsonSchema),
        example = _getObjectByPath(pathExample, jsonSchema);
    if (example) { statistics.responseExamplesTotal++; }
    // No schema, no validation
    if (!schema) {
        // Examples without schema are considered valid
        statistics.responseSchemasWithExamples--;
        statistics.responseExamplesWithoutSchema++;
        return errors;
    }
    if (!example || validator.validate(schema, example)) { return errors; }
    return errors.concat(...validator.errors.map((error) => {
        // Convert path-array to JSON-pointer
        error.examplePath = jsonPath.toPointer(jsonPath.toPathArray(pathExample));
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
