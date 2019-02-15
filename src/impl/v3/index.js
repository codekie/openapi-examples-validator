// CONSTANTS

const PATH__EXAMPLES = '$..responses..content.application/json.examples..value';

// PUBLIC API

module.exports = {
    getJsonPathToExamples
};

// IMPLEMENTATION DETAILS

function getJsonPathToExamples() { return PATH__EXAMPLES; }
