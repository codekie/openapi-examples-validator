/**
 * Validates a date-time string, according to RFC3339
 *
 * The origins of the supplied RegEx are:
 *
 * - https://stackoverflow.com/questions/28020805/regex-validate-correct-iso8601-date-string-with-time
 * - https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s07.html
 *
 * The foundation is the Stackoverflow-version, with following modifications:
 *
 * - Added milliseconds and replaced timezones
 * - Supporting lower case t and z, as stated in https://datatracker.ietf.org/doc/html/rfc3339#section-5.6
 * - Supports negative years (for BC)
 * - Supports leap seconds
 * - Added named groups for date, time and timezone
 * - Made [Tt] and [Zz] non-capturing groups
 *
 * @type {string}
 */

const REGEX_DATE_TIME = new RegExp(
    '^(?<date>-?(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])'
    + '|(?:0[13-9]|1[0-2])-(?:29|30)'
    + '|(?:0[13578]|1[02])-31)'
    + '|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])'
    + '|(?:[2468][048]|[13579][26])00)-02-29))(?:[Tt])'
    + '(?<time>(?:[01]\\d|2[0-3]):[0-5]\\d:(?:[0-5]\\d|60)(?:\\.[0-9]+)?)'
    + '(?<timezone>[Zz]|[+-](?:2[0-3]|[01][0-9]):[0-5][0-9])$'
);

module.exports = {
    validateDateTime
};

function validateDateTime(dateTimeString) {
    return REGEX_DATE_TIME.test(dateTimeString);
}
