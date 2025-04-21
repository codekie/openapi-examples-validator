/**
 * Contains validation-logic that is specific to V3 of the OpenAPI-spec
 */

const cloneDeep = require('lodash.clonedeep'),
    { ApplicationError, ErrorType } = require('../../application-error'),
    { setAllPropertiesRequired } = require('../service/all-properties-required'),
    { setNoAdditionalProperties } = require('../service/no-additional-properties');

// CONSTANTS

// eslint-disable-next-line max-len
const RESPONSES = '$..responses..content[?(@property && typeof @property === "string" && @property.match(/[\/+]json/))]';
const REQUEST = '$..requestBody.content[?(@property && typeof @property === "string" && @property.match(/[\/+]json/))]';
const SINGLE_EXAMPLE = '.example';
const MANY_EXAMPLES = '.examples.*.value';

const PATH__EXAMPLE = `${RESPONSES}${SINGLE_EXAMPLE}`,
    PATH__EXAMPLES = `${RESPONSES}${MANY_EXAMPLES}`,
    PATH__EXAMPLE__PARAMETER = '$..parameters..example',
    PATH__EXAMPLES__PARAMETER = '$..parameters..examples.*.value',
    PATH__EXAMPLE__REQUEST_BODY = `${REQUEST}${SINGLE_EXAMPLE}`,
    PATH__EXAMPLES__REQUEST_BODY = `${REQUEST}${MANY_EXAMPLES}`,
    PROP__SCHEMA = 'schema',
    PROP__EXAMPLE = 'example',
    PROP__EXAMPLES = 'examples';

const ExampleType = {
    single: 'single',
    multi: 'multi'
};

// PUBLIC API

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
function getJsonPathsToExamples() {
    return [
        PATH__EXAMPLE,
        PATH__EXAMPLES,
        PATH__EXAMPLE__PARAMETER,
        PATH__EXAMPLES__PARAMETER,
        PATH__EXAMPLE__REQUEST_BODY,
        PATH__EXAMPLES__REQUEST_BODY
    ];
}

/**
 * Builds a map with the json-pointers to the response-schema as key and the json-pointers to the examples, as value.
 * The pointer of the schema is derived from the pointer to the example and doesn't necessarily mean
 * that the schema actually exists.
 * @param {Array.<String>}  pathsExamples   Paths to the examples
 * @returns {Object.<String, String>} Map with schema-pointers as key and example-pointers as value
 * @private
 */
function buildValidationMap(pathsExamples) {
    const exampleTypesOfSchemas = new Map();
    return pathsExamples.reduce((validationMap, pathExample) => {
        const { pathSchemaAsArray, exampleType } = _getSchemaPointerOfExample(pathExample),
            pathSchema = pathSchemaAsArray.join('/'),
            exampleTypeOfSchema = exampleTypesOfSchemas.get(pathSchema);
        if (exampleTypeOfSchema) {
            exampleTypeOfSchema !== exampleType && _throwMutuallyExclusiveError(pathSchemaAsArray);
        }
        exampleTypesOfSchemas.set(pathSchema, exampleType);
        validationMap[pathSchema] = (validationMap[pathSchema] || new Set())
            .add(pathExample);
        return validationMap;
    }, {});
}

/**
 * Pre-processes the OpenAPI-spec, for further use.
 * The passed spec won't be modified. If a modification happens, a modified copy will be returned.
 * @param {Object}  openapiSpec     The OpenAPI-spec as JSON-schema
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
 *
 * It is assumed that the JSON-pointer to the example is valid and existing.
 * @param {String}  examplePointer JSON-pointer to example
 * @returns {{
 *     exampleType: ExampleType,
 *     pathSchema: String
 * }} JSON-path to the corresponding response-schema
 * @private
 */
function _getSchemaPointerOfExample(examplePointer) {
    const pathSegs = examplePointer.split('/'),
        idxExample = pathSegs.lastIndexOf(PROP__EXAMPLE),
        /** @type ExampleType */
        exampleType = idxExample > -1
            ? ExampleType.single
            : ExampleType.multi,
        idxExamples = exampleType === ExampleType.single
            ? idxExample
            : pathSegs.lastIndexOf(PROP__EXAMPLES);
    pathSegs.splice(idxExamples, pathSegs.length - idxExamples, PROP__SCHEMA);
    return {
        exampleType,
        pathSchemaAsArray: pathSegs
    };
}


/**
 * Checks if only `example` or `examples` is set for the schema, as they are mutually exclusive by OpenAPI-spec.
 * @param {Array.<String>}  pathSchemaAsArray   JSON-path to the Schema, as JSON-path-array
 * @throws ApplicationError if both are set
 * @private
 */
function _throwMutuallyExclusiveError(pathSchemaAsArray) {
    const pathContextAsArray = pathSchemaAsArray.slice(0, pathSchemaAsArray.length - 1);    // Strip `schema` away
    throw ApplicationError.create({
        type: ErrorType.errorAndErrorsMutuallyExclusive,
        message: 'Properties "error" and "errors" are mutually exclusive',
        params: {
            pathContext: pathContextAsArray.join('/')
        }
    });
}
