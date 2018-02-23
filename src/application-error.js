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
        const
            { ERR_TYPE__VALIDATION } = ApplicationError,
            { code, message, path, cause } = err,               // Certain properties of Javascript-errors
            type = code || err.type || ERR_TYPE__VALIDATION,    // If `code` is available then it's a Javascript-error
            options = { message };
        if (ERR_TYPE__VALIDATION === type) {
            // If it's an validation-error, copy all properties
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

module.exports = ApplicationError;

// PUBLIC STATICS

// Types of errors
ApplicationError.ERR_TYPE__VALIDATION = 'Validation';
ApplicationError.ERR_TYPE__JSON_PATH_NOT_FOUND = 'JsonPathNotFound';
ApplicationError.ERR_TYPE__JS_ENOENT = ENOENT.code;

