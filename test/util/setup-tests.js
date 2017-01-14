import * as fs from 'fs';
import 'mocha';
import chai from 'chai';

// Environment setup (may be used by Babel as well in .babelrc)
process.env.NODE_ENV = 'test';
// Activate `should`-notation
const should = chai.should();

// PUBLIC API

export {
    should,
    getPathOfTestData,
    loadTestData
};

// IMPLEMENTATION DETAILS

const
    BASE_PATH__TEST_DATA = '../data/',
    BASE_PATH__TEST_DATA_STRING = './test/data/',
    SUFFIX__JSON = '.json';

// Public

/**
 * Loads data from test-data (sub)directory
 * @param {String}  fileName            Filename (without suffix) or path, relative to the test-data path
 * @param {Boolean} [asString=false]    If <code>true</code> Loads file and returns content as string. Otherwise, it
 *                                      will be loaded as JSON
 * @returns {Object|String} Test-data as JSON, or String
 */
function loadTestData(fileName, asString) {
    return asString
        ? fs.readFileSync(BASE_PATH__TEST_DATA_STRING + fileName, 'utf-8')
        : require(BASE_PATH__TEST_DATA + fileName + SUFFIX__JSON);
}

function getPathOfTestData(fileName, asString) {
    return BASE_PATH__TEST_DATA_STRING + fileName + (!asString ? SUFFIX__JSON : '');
}
