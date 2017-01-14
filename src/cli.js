// Shebang will be added by webpack
//#!/usr/bin/env node --harmony

const
    VERSION = require('../package.json').version,
    fs = require('fs'),
    program = require('commander'),
    validate = require('./index').default;

program
    .version(VERSION)
    .arguments('<filePath>')
    .description('Validate embedded examples in Swagger-JSONs')
    .action(filePath => {
        const
            jsonSchema = JSON.parse(fs.readFileSync(filePath, 'utf-8')),
            result = validate(jsonSchema);
        if (result.valid) { return; }
        process.stderr.write(JSON.stringify(result.errors, null, '    '));
    });
program.parse(process.argv);
