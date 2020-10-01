const standardVersion = require('standard-version');

_bundleRelease();

async function _bundleRelease() {
    try {
        const version = await standardVersion({
            skip: {
                commit: true,
                tag: true
            }
        });
        console.log(`Finished bundling release ${ version }`);
    } catch (e) {
        console.error(`standard-version failed with message: ${e.message}`);
    }
}
