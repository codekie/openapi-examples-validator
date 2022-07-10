const { applyCallbackToAllObjectModels } = require('./common');

module.exports = {
    doMergeAllofDefinitions
};

const allOfSchemaCombiner = 'allOf';

/**
 * Merge all the allOf definitions into the parent schema
 * @param {Object}  openApiSpec  The to-be-modified schema
 */
function doMergeAllofDefinitions(openApiSpec) {
    applyCallbackToAllObjectModels(openApiSpec, [],
        () => {
            return (schema) => {
                if (schema.hasOwnProperty(allOfSchemaCombiner)
                    && Array.isArray(schema[allOfSchemaCombiner])
                    && schema[allOfSchemaCombiner].every((allOfSchema) =>
                        typeof allOfSchema === 'object' && allOfSchema.type === 'object'
                    )) {
                    schema.type = 'object';
                    schema.properties = Object.assign({}, ...schema[allOfSchemaCombiner]
                        .map(allOfSchema => allOfSchema.properties));
                    schema.required = schema[allOfSchemaCombiner].map(allOfSchema => allOfSchema.required || []).flat();
                    if (schema[allOfSchemaCombiner]
                        .some((allOfSchema) => allOfSchema.hasOwnProperty('minProperties'))) {
                        schema.minProperties = schema[allOfSchemaCombiner]
                            .map(allOfSchema => allOfSchema.minProperties || 0)
                            .reduce((a, b) => a + b);
                    }
                    if (schema[allOfSchemaCombiner]
                        .some((allOfSchema) => allOfSchema.hasOwnProperty('maxProperties'))) {
                        schema.maxProperties = schema[allOfSchemaCombiner]
                            .map(allOfSchema => allOfSchema.maxProperties
                                || (allOfSchema.properties ? Object.keys(allOfSchema.properties).length : 0))
                            .reduce((a, b) => a + b);
                    }
                    delete schema[allOfSchemaCombiner];
                }
            };
        });
}
