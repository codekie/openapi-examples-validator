const { JSONPath: jsonPath } = require('jsonpath-plus'),
    ResultType = require('../../const/result-type');

const JSON_PATHS__OBJECTS = [
    '$..application/json.schema',
    '$..schema..[?(@.properties && (@property === "schema" || @property === "items" || @.type === "object"))]'
];

const JSON_SCHEMA_COMBINERS = [
    'oneOf',
    'allOf',
    'anyOf',
    'not'
];

module.exports = {
    setNoAdditionalProperties
};

/**
 * @typedef {{
 *     path: String,
 *     value: Object,
 *     parent: Object,
 *     parentProperty: String,
 *     hasArrExpr: Boolean
 * }} JsonPathMatchData
 */

/**
 * Callback that is applied to a JSONPath-match.
 * @callback JsonPathMatchCallback
 * @param {Object}              value       Value of the matched property
 * @param {String}              resultType  Result-type of the query
 * @param {JsonPathMatchData}   data        Object that contains additional data to the match
 */

/**
 * Sets the flag to indicate that it doesn't allow properties that are not described in the schema
 * @param {Object}                  openApiSpec         The to-be-modified schema
 * @param {Array.<String>}          [examplePaths=[]]   The paths to the examples, which's content must not be modified
 * @param {JsonPathMatchCallback}   [createCallback=_createCallbackObjectTypeForNoAdditionalProperties] Function that
 *                                                      creates a callback to be called on a match
 * @private
 */
function setNoAdditionalProperties(openApiSpec, examplePaths = [],
    createCallback = _createCallbackObjectTypeForNoAdditionalProperties
) {
    // Find all matches
    const paths = new Set();
    JSON_PATHS__OBJECTS.forEach(jsPath => {
        _find(openApiSpec, jsPath)
            .forEach(match => {
                // remove all references to paths including any of the JSON schema combiners
                if (!JSON_SCHEMA_COMBINERS.some((combiner) => match.includes(`['${combiner}']`))) {
                    paths.add(match);
                } else {
                    console.warn('"additionalProperties" flag not set '
                        + `for ${match} because it contains JSON-schema combiner keywords.`);
                }
            });
    });
    // Exclude examples
    _excludeExamples(openApiSpec, paths, examplePaths);
    // Set flag
    for (const jsPath of paths) {
        _find(openApiSpec, jsPath, ResultType.value, createCallback(jsPath));
    }
}

/**
 * Callback, to set the `additionalProperties` to `false` the object-schemas
 * @type JsonPathMatchCallback
 * @private
 */
function _createCallbackObjectTypeForNoAdditionalProperties(path) {
    return (value) => {
        const asString = JSON.stringify(value);
        // any schema's that use JSON schema combiners should also be excluded
        if (!JSON_SCHEMA_COMBINERS.some((combiner) => asString.includes(`"${combiner}"`))) {
            value.additionalProperties = false;
        } else {
            console.warn('"additionalProperties" flag not set '
                + `for ${path} because it contains JSON-schema combiner keywords.`);
        }
    };
}

/**
 * Find matching elements in JSON.
 * @param {Object}                  json                JSON to be searched
 * @param {String}                  path                JSON-path to search
 * @param {String}                  [resultType="path"] Result-type of the query
 * @param {JsonPathMatchCallback}   [callback]          Function to be called on a match
 * @returns {any} Result of the query, depending on the `resultType`
 * @private
 */
function _find(json, path, resultType = ResultType.path, callback) {
    return jsonPath({
        json,
        path,
        flatten: true,
        resultType,
        callback
    });
}

/**
 * Remove JSON-paths from `paths` that are included in `examplePaths`
 * @param {Object}          openApiSpec     Open-API spec to search in
 * @param {Set.<String>}    paths           Paths where the examples have to be removed from
 * @param {Array.<String>}  examplePaths    JSON-paths of the examples
 * @private
 */
function _excludeExamples(openApiSpec, paths, examplePaths) {
    examplePaths
        .forEach(examplePath => {
            _find(openApiSpec, examplePath)
                .forEach(exampleMatch => {
                    for (const jsPath of paths) {
                        jsPath.startsWith(exampleMatch) && paths.delete(jsPath);
                    }
                });
        });
}
