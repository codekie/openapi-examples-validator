// CONSTANTS

const PATH__EXAMPLES = '$..examples.application/json';

module.exports = {
    getJsonPathToExamples
};

// IMPLEMENTATION DETAILS

/**
 * Get the JSONPath to the examples
 * @returns {string}    JSONPath
 */
function getJsonPathToExamples() { return PATH__EXAMPLES; }
