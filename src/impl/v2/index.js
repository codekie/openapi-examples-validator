/**
 * Contains validation-logic that is specific to V2 of the OpenAPI-spec
 */

const { JSONPath: jsonPath } = require('jsonpath-plus'),
    { setNoAdditionalProperties, setAllPropertiesRequired } = require('../service'),
    cloneDeep = require('lodash.clonedeep');

// CONSTANTS

const PATH__EXAMPLES = '$..examples.application/json',
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLES = 'examples';

module.exports = {
    buildValidationMap,
    escapeExampleName,
    getJsonPathsToExamples,
    prepare,
    unescapeExampleNames
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
        validationMap[pathSchema] = (validationMap[pathSchema] || new Set())
            .add(pathExample);
        return validationMap;
    }, {});
}

/**
 * Pre-processes the OpenAPI-spec, for further use.
 * The passed spec won't be modified. If a modification happens, a modified copy will be returned.
 * @param {Object}  openapiSpec                     The OpenAPI-spec as JSON-schema
 * @param {boolean} [noAdditionalProperties=false]  Don't allow properties that are not defined in the schema
 * @param {boolean} [allPropertiesRequired=false]   Make all properties required
 * @return {Object} The prepared OpenAPI-spec
 */
function prepare(openapiSpec, { noAdditionalProperties, allPropertiesRequired } = {}) {
    const openapiSpecCopy = cloneDeep(openapiSpec);
    noAdditionalProperties && setNoAdditionalProperties(openapiSpecCopy, getJsonPathsToExamples());
    allPropertiesRequired && setAllPropertiesRequired(openapiSpecCopy, getJsonPathsToExamples());
    return openapiSpecCopy;
}

/**
 * Escapes the name of the example.
 * @param {string} rawPath  Unescaped path
 * @returns {string} Escaped path
 * @private
 */
function escapeExampleName(rawPath) {
    // No escaping necessary in v2, as there are no named-examples
    return rawPath;
}

/**
 * Escaped example-names reflect in the result (where they shouldn't). This function reverts it.
 * @param {string} rawPath  Escaped path
 * @returns {string} Unescaped path
 */
function unescapeExampleNames(rawPath) {
    // No unescaping necessary in v2, as there are no named-examples
    return rawPath;
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
