// CONSTANTS

const PATH__EXAMPLES = '$..responses..content.application/json.examples..value';

// PUBLIC API

module.exports = {
    getJsonPathToExamples
};

// IMPLEMENTATION DETAILS

/**
 * Get the JSONPath to the examples
 * @returns {string}    JSONPath
 */
function getJsonPathToExamples() { return PATH__EXAMPLES; }
