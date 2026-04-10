/**
 * Entry point for logic that only applies to specific versions of the OpenAPI-spec
 */

const implV2 = require('./v2/index'),
    implV3 = require('./v3/index');

const REGEX__OPEN_API = /^3\./;

/**
 * @typedef {{
 *     buildValidationMap: (pathsExamples: Array<string>) => Record<string, Set<string>>,
 *     getJsonPathsToExamples: () => Array<string>,
 *     prepare: (
 *         openapiSpec: Object,
 *         options?: {
 *             noAdditionalProperties?: boolean,
 *             allPropertiesRequired?: boolean
 *         }
 *     ) => object,
 * }} Implementation
 */

module.exports = {
    getImplementation
};

/**
 * Get the version-specific implementation for the OpenAPI-spec. Currently v2 and v3 are supported
 * @param {Object}  openapiSpec OpenAPI-spec
 * @returns {Implementation | null}
 */
function getImplementation(openapiSpec) {
    if (typeof openapiSpec.swagger === 'string') {
        return implV2;
    }
    if (openapiSpec.openapi && openapiSpec.openapi.match(REGEX__OPEN_API)) {
        return implV3;
    }
    return null;
}
