const
    { 'default': validateExamples } = require('../../src'),
    { loadTestData } = require('../util/setup-tests');
const { JSONPath: jp } = require('jsonpath-plus');

function deepClone(oasSpec) {
    // please note that $RefParser.dereference used internally is reusing objects
    return JSON.parse(JSON.stringify(oasSpec));
}

function removeReadOnlyFromPostModels(oasSpec) {
    const path = '$..requestBody..schema..*[?(@.readOnly)]';
    jp({ path, json: oasSpec, resultType: 'parentProperty', callback: (val, _, obj) => {
        const parent = obj.parent;
        if (parent[val].readOnly === true) {
            delete parent[val];
        }
    } });
    return oasSpec;
}

function chained(functions) {
    return function(input) {
        return functions.reduce((result, func) => func(result), input);
    };
}

describe('OAS postprocessor', function() {
    describe('validateExamples taking into readOnly flag from OAS spec', function() {
        describe('API version 3', function() {
            it('without "readOnly" post-processor an error is not captured', async function() {
                //please look into spec and check that the 'invalid1' example is not complying to OAS spec
                const result = await validateExamples(loadTestData('v3/custom-postprocessing/readOnly'));
                result.valid.should.equal(true);
                result.statistics.examplesTotal.should.equal(2);
            });

            it('should find errors in all request examples', async function() {
                const postProcessor = chained([deepClone, removeReadOnlyFromPostModels]);
                const result = await validateExamples(loadTestData('v3/custom-postprocessing/readOnly'),
                    { specPostprocessor: postProcessor });
                result.valid.should.equal(false);
                result.errors.length.should.equal(1);
                result.errors[0].examplePath.includes('invalid');
                result.statistics.examplesTotal.should.equal(2);
            });
        });
    });
});
