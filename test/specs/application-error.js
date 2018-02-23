const
    chai = require('chai'),
    ApplicationError = require('../../src/application-error'),
    { ERR_TYPE__VALIDATION, ERR_TYPE__JSON_PATH_NOT_FOUND } = ApplicationError;

const should = chai.should();

describe('ApplicationError', function() {
    describe('instantiation', function() {
        it('should not fail when no options are passed', () => {
            should.exist(new ApplicationError(ERR_TYPE__JSON_PATH_NOT_FOUND));
        });
        it('should merge the passed options to the instance', function() {
            const err = new ApplicationError(ERR_TYPE__VALIDATION, {
                path: 'foo',
                line: 'bar'
            });
            err.path.should.equal('foo');
            err.line.should.equal('bar');
        });
    });
});
