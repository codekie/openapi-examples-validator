const
    chai = require('chai'),
    { ApplicationError, ErrorType } = require('../../src/application-error');

const TYPE__VALIDATION = 'Validation';

const should = chai.should();

describe('ApplicationError', function() {
    describe('instantiation', function() {
        it('should not fail when no options are passed', () => {
            should.exist(new ApplicationError(ErrorType.jsonPathNotFound));
        });
        it('should merge the passed options to the instance', function() {
            const err = new ApplicationError(ErrorType.validation, {
                path: 'foo',
                line: 'bar'
            });
            err.path.should.equal('foo');
            err.line.should.equal('bar');
        });
        it('should have the right type for the validation-type', function() {
            (new ApplicationError(ErrorType.validation)).type.should.equal(TYPE__VALIDATION);
        });
    });
});
