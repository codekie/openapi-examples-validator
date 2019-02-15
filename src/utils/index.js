module.exports = {
    createValidationResponse
};

/**
 * Creates a unified response for the validation-result
 * @param {Array.<ApplicationError>}    errors
 * @param {ValidationStatistics}        statistics
 * @returns {ValidationResponse}
 * @private
 */
function createValidationResponse({ errors, statistics = {} }) {
    return {
        valid: !errors.length,
        statistics,
        errors
    };
}
