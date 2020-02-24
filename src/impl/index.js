/**
 * Entry point for logic that only applies to specific versions of the OpenAPI-spec
 */

const implV2 = require('./v2/index'),
    implV3 = require('./v3/index');

const REGEX__OPEN_API = /^3\./;

module.exports = {
    getImplementation
};

/**
 * Get the version-specific implementation for the OpenAPI-spec. Currently v2 and v3 are supported
 * @param {Object}  openapiSpec OpenAPI-spec
 * @returns {Object|null}
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
