/**
 * Wrapper for the JSONSchema-validator
 */

const { JSONPath: jsonPath } = require('jsonpath-plus'),
    JsonPointer = require('json-pointer'),
    Ajv = require('ajv'),
    FormatValidator = require('ajv-oai/lib/format-validator'),
    draft4MetaSchema = require('ajv/lib/refs/json-schema-draft-04.json');

const PROP__ID = '$id',
    JSON_PATH__REFS = '$..\$ref',
    ID__SPEC_SCHEMA = 'https://www.npmjs.com/package/openapi-examples-validator/defs.json',
    ID__RESPONSE_SCHEMA = 'https://www.npmjs.com/package/openapi-examples-validator/schema.json';

module.exports = {
    getValidatorFactory,
    compileValidate
};

/**
 * Get a factory-function to create a prepared validator-instance
 * @param {Object}  specSchema  OpenAPI-spec of which potential local references will be extracted
 * @param {Object}  [options]   Options for the validator
 * @returns {function(): (ajv | ajv.Ajv)}
 */
function getValidatorFactory(specSchema, options) {
    const preparedSpecSchema = _createReferenceSchema(specSchema);
    return () => {
        const validator = new Ajv(options);
        _applyDraft04Schema(validator);
        _addFormatValidators(validator);

        validator.addSchema(preparedSpecSchema);

        return validator;
    };
}

/**
 * Compiles the validator-function.
 * @param {ajv | ajv.Ajv}   validator       Validator-instance
 * @param {Object}          responseSchema  The response-schema, against the examples will be validated
 * @returns {ajv.ValidateFunction}
 */
function compileValidate(validator, responseSchema) {
    const preparedResponseSchema = _prepareResponseSchema(responseSchema, ID__RESPONSE_SCHEMA);
    _replaceRefsToPreparedSpecSchema(preparedResponseSchema);
    return validator.compile(preparedResponseSchema);
}

/**
 * Prepares the schema, to be used with internal-references
 * @param {Object}  specSchema  The schema to be prebared
 * @param {String}  idSchema    The unique ID for the schema
 * @returns {Object}
 * @private
 */
function _prepareResponseSchema(specSchema, idSchema) {
    const preparedSchema = Object.assign({}, specSchema);
    preparedSchema[PROP__ID] = idSchema;
    return preparedSchema;
}

/**
 * Replaces all internal references to the schema, with the extracted references, based on the origin OpenAPI-spec
 * @param {Object}  schema  The schema, containing references have to be replaced
 * @private
 */
function _replaceRefsToPreparedSpecSchema(schema) {
    jsonPath({
        path: JSON_PATH__REFS,
        json: schema,
        callback(value, type, payload) {
            if (!value.startsWith('#')) {
                return;
            }
            payload.parent[payload.parentProperty] = `${ID__SPEC_SCHEMA}${value}`;
        }
    });
}

/**
 * Extracts all references and returns a new schema, containing only those.
 * @param {Object} specSchema   Schema, which references shall be extracted
 * @returns {Object}
 * @private
 */
function _createReferenceSchema(specSchema) {
    const refSchema = {
        [PROP__ID]: ID__SPEC_SCHEMA
    };
    jsonPath({
        path: JSON_PATH__REFS,
        json: specSchema,
        callback(value) {
            if (!value.startsWith('#')) {
                return;
            }
            const pointer = value.substring(1),
                definition = JsonPointer.get(specSchema, pointer);
            JsonPointer.set(refSchema, pointer, definition);
        }
    });
    return refSchema;
}

/**
 * Adds format-validators that are not included in the reference-implementation
 * @param {ajv.Ajv} validator
 * @private
 */
function _addFormatValidators(validator) {
    validator.addFormat('int32', { type: 'number', validate: FormatValidator.int32 });
    validator.addFormat('int64', { type: 'string', validate: FormatValidator.int64 });
    validator.addFormat('float', { type: 'number', validate: FormatValidator.float });
    validator.addFormat('double', { type: 'number', validate: FormatValidator.double });
    validator.addFormat('byte', { type: 'string', validate: FormatValidator.byte });
}

/**
 * Adds the JSON schema draft-04 schema as default to the validator.
 * The OpenAPI specifications rely on draft-04 and draft-05.
 * Draft-04 is used here because of recommendations made here: https://json-schema.org/draft-05/README.html
 * @param {ajv.Ajv} validator
 * @private
 */
function _applyDraft04Schema(validator) {
    validator.removeSchema('');
    validator.addMetaSchema(draft4MetaSchema, draft4MetaSchema.id);
    validator._opts.defaultMeta = draft4MetaSchema.id;
}
