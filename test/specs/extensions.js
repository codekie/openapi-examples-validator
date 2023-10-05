const
    { 'default': validateExamples } = require('../../src'),
    { loadTestData } = require('../util/setup-tests');
const { JSONPath: jp } = require('jsonpath-plus');

function removeReadOnlyFromPostModels(oasSpec) {
    // please note that $RefParser.dereference used internally is reusing objectss
    oasSpec = JSON.parse(JSON.stringify(oasSpec));
    const path = '$..requestBody..schema..*[?(@.readOnly)]';
    jp({ path, json: oasSpec, resultType: 'parentProperty', callback: (val, _, obj) => {
        const parent = obj.parent;
        if (parent[val].readOnly === true) {
            delete parent[val];
        }
    } });
    return oasSpec;
}

describe('OAS postprocessor', function() {
    describe('validateExamples', function() {
        describe('API version 3', function() {
            it('should find errors in all request examples', async function() {
                const result = await validateExamples(loadTestData('v3/custom-postprocessing/readOnly'),
                    { specPostprocessor: removeReadOnlyFromPostModels });
                result.valid.should.equal(false);
                result.errors.length.should.equal(2);
                result.statistics.examplesTotal.should.equal(3);
            });
        });
    });
});
