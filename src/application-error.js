const
    _ = require('lodash'),
    { ENOENT } = require('errno').code;

// TYPEDEFINITIONS

/**
 * @typedef {{}} CustomError
 * @augments Error
 */

/**
 * ApplicationErrorOptions
 * @typedef {{
 *      [dataPath]: string,
 *      [examplePath]: string,
 *      [exampleFilePath]: string,
 *      [keyword]: string,
 *      [message]: string,
 *      [mapFilePath]: string,
 *      [params]: {
 *          [path]: string,
 *          [missingProperty]: string,
 *          [type]: string
 *      },
 *      [schemaPath]: string
 * }} ApplicationErrorOptions
 */

// CONSTANTS

const ErrorType = {
    jsENOENT: ENOENT.code,
    jsonPathNotFound: 'JsonPathNotFound',
    errorAndErrorsMutuallyExclusive: 'ErrorErrorsMutuallyExclusive',
    parseError: 'ParseError',
    validation: 'Validation'
};

// CLASSES

/**
 * Unified application-error
 */
class ApplicationError {
    /**
     * Factory-function, which is able to consume validation-errors and JS-errors. If a validation error is passed, all
     * properties will be adopted.
     * @param {Error|CustomError}   err     Javascript-, validation- or custom-error, to create the application-error
     *                                      from
     * @returns {ApplicationError} Unified application-error instance
     */
    static create(err) {
        const { code, message, path, cause } = err,               // Certain properties of Javascript-errors
            type = code || err.type || ErrorType.validation,    // If `code` is available then it's a Javascript-error
            options = { message };
        if (ErrorType.validation === type || ErrorType.errorAndErrorsMutuallyExclusive === type) {
            // For certain, created error-types, copy all properties
            _.merge(options, err);
        } else {
            // Copy certain properties of Javascript-error (but only if available)
            path && _.merge(options, { params: { path } });
            cause && _.merge(options, cause);
        }
        return new ApplicationError(type, options);
    }

    /**
     * Constructor
     * @param {string}                  type        Type of error (see statics)
     * @param {ApplicationErrorOptions} [options]   Optional properties
     */
    constructor(type, options = {}) {
        Object.assign(this, {
            type,
            ...options
        });
    }
}

// PUBLIC API

module.exports = {
    ApplicationError,
    ErrorType
};
