const { JSONPath: jsonPath } = require('jsonpath-plus'),
    ResultType = require('../../const/result-type');

const JSON_PATHS__OBJECTS = [
    '$..application/json.schema',
    '$..schema..[?(@.properties && (@property === "schema" || @property === "items" || @.type === "object"))]'
];

module.exports = {
    applyCallbackToAllObjectModels
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
 * Function to build a callback that is applied to a JSONPath-match.
 * @callback JsonPathMatchCallbackBuilder
 * @param {string}                 jsPath  Path to the property that matched
 * @return {JsonPathMatchCallback}         Callback that is applied to a JSONPath-match
 */

/**
 * Apply the input rule to all models of type object in the input openApiSpec
 * @param {Object}                 openApiSpec           The to-be-modified schema
 * @param {Array.<String>}         [examplePaths]        The paths to the examples, which's content must not be modified
 * @param {JsonPathMatchCallbackBuilder}  [matchCallbackBuilder]  Function to build a callback
 *                                                                that will be called on each match
 */
function applyCallbackToAllObjectModels(openApiSpec, examplePaths, matchCallbackBuilder) {
    // Find all matches
    const paths = new Set();
    JSON_PATHS__OBJECTS.forEach(jsPath => {
        _find(openApiSpec, jsPath)
            .forEach(match => {
                paths.add(match);
            });
    });
    // Exclude examples
    _excludeExamples(openApiSpec, paths, examplePaths);
    // Set flag
    for (const jsPath of paths) {
        _find(openApiSpec, jsPath, ResultType.value, matchCallbackBuilder(jsPath));
    }
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
