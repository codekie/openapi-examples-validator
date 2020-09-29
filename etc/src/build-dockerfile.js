const path = require('path'),
    fs = require('fs');

const VERSION = require('../../package.json').version,
    FILE_PATH__DOCKERFILE = path.join(__dirname, '../../dist/Dockerfile');

_writeDockerfile();

function _writeDockerfile() {
    const dockerfile = _createDockerfile().trim();
    fs.writeFileSync(FILE_PATH__DOCKERFILE, dockerfile, 'utf8');
}


function _createDockerfile() {
    return `
FROM node:14.11.0-alpine3.12

RUN npm install -g openapi-examples-validator@${ VERSION }

ENTRYPOINT ["openapi-examples-validator"]
CMD ["--help"]
    `;
}
