const path = require('path'),
    refParser = require('json-schema-ref-parser');
const { fixSchemaPathWithAllof } = require('../impl/service/merge-allof-definitions');

module.exports = {
    createValidationResponse,
    dereferenceJsonSchema
};

/**
 * Creates a unified response for the validation-result
 * @param {Array.<ApplicationError>}    errors
 * @param {ValidationStatistics}        statistics
 * @returns {ValidationResponse}
 * @private
 */
function createValidationResponse({ errors, statistics = {} }) {
    fixSchemaPathWithAllof(errors);
    return {
        valid: !errors.length,
        statistics,
        errors
    };
}

/**
 * Includes all referenced, external schemas (by the keyword `$ref`) into the schema
 *
 * CAUTION: This function is not concurrency-safe !!
 * This function changes the working dir and sets it back. This may become an concurrency issue when there are
 * other tasks running that rely on the working dir while this function waits for the asynchronous task of
 * dereferencing to complete.
 *
 * @param {String} pathToSchema     File-path to the schema
 * @param {Object} jsonSchema       Schema with potential externally referenced schemas
 * @returns {Promise<Object>}       Dereferenced schema
 */
async function dereferenceJsonSchema(pathToSchema, jsonSchema) {
    const currentWorkingDir = process.cwd();
    // Change the working dir to the schema-path, to make sure that relative paths can be resolved
    process.chdir(path.dirname(pathToSchema));
    const dereferencedSchema = await refParser.dereference(jsonSchema);
    // Restore original working dir
    process.chdir(currentWorkingDir);
    return dereferencedSchema;
}
