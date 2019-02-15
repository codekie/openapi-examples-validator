const { loadTestData } = require('../../../util/setup-tests'),
    { 'default': validateExamples } = require('../../../../src/index');

const REL_PATH__SIMPLE = 'v3/simple-api-with-examples',
    REL_PATH__WITH_INTERNAL_REFS = 'v3/simple-api-with-examples-with-refs';

describe('Main-module, for v3 should', () => {
    describe('recognize', () => {
        it('valid single example', () => {
            validateExamples(loadTestData(REL_PATH__SIMPLE)).valid.should.equal(true);
        });
        it('example with internal refs', () => {
            validateExamples(loadTestData(REL_PATH__WITH_INTERNAL_REFS)).valid.should.equal(true);
        });
    });
});
