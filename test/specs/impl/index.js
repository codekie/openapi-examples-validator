const chai = require('chai'),
    { loadTestData } = require('../../util/setup-tests'),
    { getImplementation } = require('../../../src/impl/index'),
    implV2 = require('../../../src/impl/v2/index'),
    implV3 = require('../../../src/impl/v3/index');

const FILE_PATH__V2__VALID__SINGLE_EXAMPLE = 'valid-single-example',
    FILE_PATH__V3__VALID__EXAMPLES = 'v3/simple-api-with-examples';

const should = chai.should();

describe('Implementation detector', function() {
    it('should correctly detect v2', function() {
        getImplementation(loadTestData(FILE_PATH__V2__VALID__SINGLE_EXAMPLE)).should.equal(implV2);
    });
    it('should correctly detect v3', function() {
        getImplementation(loadTestData(FILE_PATH__V3__VALID__EXAMPLES)).should.equal(implV3);
    });
    it('should return `null`, if version could not be determined', function() {
        should.not.exist(getImplementation({}));
    });
});
