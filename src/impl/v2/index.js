/**
 * Contains validation-logic that is specific to V2 of the OpenAPI-spec
 */

const cloneDeep = require('lodash.clonedeep'),
    { setAllPropertiesRequired } = require('../service/all-properties-required'),
    { setNoAdditionalProperties } = require('../service/no-additional-properties');

// CONSTANTS

const PATH__EXAMPLES = '$..examples[?(@property.match(/[\/+]json/))]',
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
 * Builds a map with the json-pointers to the response-schema as key and the json-pointers to the examples, as value.
 * The pointer of the schema is derived from the pointer to the example and doesn't necessarily mean
 * that the schema actually exists.
 * @param {Array.<String>}  pathsExamples   Paths to the examples
 * @returns {Object.<String, String>} Map with schema-pointers as key and example-pointers as value
 * @private
 */
function buildValidationMap(pathsExamples) {
    return pathsExamples.reduce((validationMap, pathExample) => {
        const pathSchema = _getSchemaPointerOfExample(pathExample);
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
 * Gets a JSON-pointer to the corresponding response-schema, based on a JSON-pointer to an example.
 * @param {String}  examplePointer JSON-pointer to example
 * @returns {String} JSON-pointer to the corresponding response-schema
 * @private
 */
function _getSchemaPointerOfExample(examplePointer) {
    const pathSegs = examplePointer.split('/'),
        idxExamples = pathSegs.lastIndexOf(PROP__EXAMPLES);
    pathSegs.splice(idxExamples, pathSegs.length - idxExamples, PROP__SCHEMA);
    return pathSegs.join('/');
}
