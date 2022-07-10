const { applyCallbackToAllObjectModels } = require('./common');

module.exports = {
    setAllPropertiesRequired
};

/**
 * Sets all properties of each object to required
 * @param {Object}                  openApiSpec         The to-be-modified schema
 * @param {Array.<String>}          [examplePaths=[]]   The paths to the examples, which's content must not be modified
 */
function setAllPropertiesRequired(openApiSpec, examplePaths = []) {
    applyCallbackToAllObjectModels(openApiSpec, examplePaths,
        () => {
            return (schema) => {
                if (schema.hasOwnProperty('properties')) {
                    schema.required = Object.keys(schema.properties);
                }
            };
        });
}
