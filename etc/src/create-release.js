const standardVersion = require('standard-version');

_bundleRelease();

async function _bundleRelease() {
    try {
        await standardVersion({
            commitAll: true,
            skip: {
                bump: true,
                changelog: true
            }
        });
    } catch (e) {
        console.error(`standard-version failed with message: ${e.message}`);
    }
}
