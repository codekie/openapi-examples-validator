const implV2 = require('./v2/index'),
    implV3 = require('./v3/index');

const REGEX__OPEN_API = /^3\./;

module.exports = {
    getImplementation
};

function getImplementation(swaggerSpec) {
    if (typeof swaggerSpec.swagger === 'string') {
        return implV2;
    }
    if (swaggerSpec.openapi && swaggerSpec.openapi.match(REGEX__OPEN_API)) {
        return implV3;
    }
    return null;
}
