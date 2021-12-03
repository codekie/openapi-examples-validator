const { validateDateTime } = require('../../../src/validators/date-time');

const VAL__VALID = [
    '-1001-08-30T01:45:36.123Z',
    '2008-08-30T01:45:36.123Z',
    '1985-04-12T23:20:50.52Z',
    '1996-12-19T16:39:57-08:00',
    '1937-01-01T12:00:27.87+00:20',
    '2017-07-21T17:32:28Z',
    '2007-08-31T16:47:00+00:00',
    '2007-12-24T18:21:00Z',
    '2009-01-01T12:00:00+01:00',
    '2009-06-30T18:30:00+02:00',
    '2021-12-01T13:54:15+00:00',
    '2021-12-01T13:54:15Z',
    '2021-12-01t13:54:15z',
    '2024-03-30T12:34:56Z'
];

const VAL__LEAP_SECONDS = [
    '1990-12-31T23:59:60Z',
    '1990-12-31T15:59:60-08:00'
];

const VAL__LEAP_YEARS = [
    '1996-02-29T08:47:23Z',
    '2024-02-29T12:34:56Z'
];

const VAL__INVALID = [
    '2008-08-30T01:45:36',
    '108-08-30T01:45:36',
    '2008-08-32T01:45:36',
    '2008-08-02T27:45:36',
    '2009-01-01T12:00:00+01:00:15',
    '2024-02-30T12:34:56Z',
    '2021-13-02T08:27:49Z',
    '2022-07-32T09:36:24Z',
    '2023-02-29T12:34:56Z',
    '2021-12-01TZ',
    '2021-12-01Z',
    '2009-01-01T+01:00',
    '1996-12-19-08:00',
    '2009-06-30+02:00'
];

describe('date-time validator', function() {
    it('should detect valid inputs', function() {
        VAL__VALID.forEach(value => {
            validateDateTime(value).should.equal(true, `expected ${ value } to be valid`);
        });
    });
    it('should detect leap seconds', function() {
        VAL__LEAP_SECONDS.forEach(value => {
            validateDateTime(value).should.equal(true, `expected ${ value } to be valid`);
        });
    });
    it('should detect leap years', function() {
        VAL__LEAP_YEARS.forEach(value => {
            validateDateTime(value).should.equal(true, `expected ${ value } to be valid`);
        });
    });
    it('should detect invalid input', function() {
        VAL__INVALID.forEach(value => {
            validateDateTime(value).should.equal(false, `expected ${ value } to be valid`);
        });
    });
});
