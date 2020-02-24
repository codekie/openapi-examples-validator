/**
 * Contains validation-logic that is specific to V2 of the OpenAPI-spec
 */

const { JSONPath: jsonPath } = require('jsonpath-plus');

// CONSTANTS

const PATH__EXAMPLES = '$..examples.application/json',
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLES = 'examples';

module.exports = {
    buildValidationMap,
    getJsonPathsToExamples,
    prepare
};

// IMPLEMENTATION DETAILS

/**
 * Get the JSONPaths to the examples
 * @returns {Array.<String>}    JSONPaths to the examples
 */
function getJsonPathsToExamples() { return [PATH__EXAMPLES]; }


/**
 * Builds a map with the path to the repsonse-schema as key and the paths to the examples, as value. The path of the
 * schema is derived from the path to the example and doesn't necessarily mean that the schema actually exists.
 * @param {Array.<String>}  pathsExamples   Paths to the examples
 * @returns {Object.<String, String>} Map with schema-path as key and example-paths as value
 * @private
 */
function buildValidationMap(pathsExamples) {
    return pathsExamples.reduce((validationMap, pathExample) => {
        const pathSchema = _getSchemaPathOfExample(pathExample);
        validationMap[pathSchema] = pathExample;
        return validationMap;
    }, {});
}

/**
 * Pre-processes the OpenAPI-spec, for further use.
 * The passed spec won't be modified. If a modification happens, a modified copy will be returned.
 * @param {Object}  openapiSpec     The OpenAPI-spec as JSON-schema
 * @return {Object} The prepared OpenAPI-spec
 */
function prepare(openapiSpec) {
    // No pre-processing yet, so we return the original
    return openapiSpec;
}

/**
 * Gets a JSON-path to the corresponding response-schema, based on a JSON-path to an example.
 * @param {String}  pathExample JSON-path to example
 * @returns {String} JSON-path to the corresponding response-schema
 * @private
 */
function _getSchemaPathOfExample(pathExample) {
    const pathSegs = jsonPath.toPathArray(pathExample).slice(),
        idxExamples = pathSegs.lastIndexOf(PROP__EXAMPLES);
    pathSegs.splice(idxExamples, pathSegs.length - idxExamples, PROP__SCHEMA);
    return jsonPath.toPathString(pathSegs);
}
