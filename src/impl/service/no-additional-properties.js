const { applyCallbackToAllObjectModels } = require('./common');

module.exports = {
    setNoAdditionalProperties
};

const JSON_SCHEMA_COMBINERS = [
    'oneOf',
    'allOf',
    'anyOf',
    'not'
];

/**
 * Sets the flag to indicate that it doesn't allow properties that are not described in the schema
 * @param {Object}                  openApiSpec         The to-be-modified schema
 * @param {Array.<String>}          [examplePaths=[]]   The paths to the examples, which's content must not be modified
 */
function setNoAdditionalProperties(openApiSpec, examplePaths = []) {
    // Match all combiner keywords that are not preceded by a 'properties' keyword.
    // This allow to have objects that have as property name one of the combiner keywords.
    const hasJsonCombinerParentRegex
        = new RegExp('(?<!\\[\'properties\'\\])\\[\'(?:' + JSON_SCHEMA_COMBINERS.join('|') + ')\'\\]');

    applyCallbackToAllObjectModels(openApiSpec, examplePaths,
        (path) => {
            return (schema) => {
                // Exclude schema that have a JSON combiner as parent
                if (hasJsonCombinerParentRegex.test(path)) {
                    console.warn('"additionalProperties" flag not set '
                        + `for ${path} because it has a parent with a JSON-schema combiner keyword.`);
                    return;
                }
                // Exclude schema that contains a JSON combiner
                if (JSON_SCHEMA_COMBINERS.some((combiner) => schema.hasOwnProperty(combiner))) {
                    console.warn('"additionalProperties" flag not set '
                        + `for ${path} because it contains JSON-schema combiner keyword.`);
                    return;
                }
                // Exclude schema that already contains additionalProperties
                if (schema.hasOwnProperty('additionalProperties')) {
                    return;
                }
                // Exclude schema that are not objects
                if (!isAnObjectSchema(schema)) {
                    return;
                }
                schema.additionalProperties = false;
            };
        });
}

function isAnObjectSchema(schema) {
    return schema.hasOwnProperty('properties')
        || schema.hasOwnProperty('additionalProperties')
        || (schema.hasOwnProperty('type') && schema.type === 'object');
}
