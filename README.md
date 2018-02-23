swagger-examples-validator
==========================

Validates embedded examples in Swagger-specs (only JSON supported, yet)

[![npm version](https://badge.fury.io/js/swagger-examples-validator.svg)](https://badge.fury.io/js/swagger-examples-validator)
[![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version)
[![Build Status](https://travis-ci.org/codekie/swagger-examples-validator.svg?branch=master)](https://travis-ci.org/codekie/swagger-examples-validator)
[![Coverage Status](https://coveralls.io/repos/github/codekie/swagger-examples-validator/badge.svg?branch=master)](https://coveralls.io/github/codekie/swagger-examples-validator?branch=master)
[![dependencies Status](https://david-dm.org/codekie/swagger-examples-validator/status.svg)](https://david-dm.org/codekie/swagger-examples-validator)

Install
-------

Install using [npm](https://docs.npmjs.com/getting-started/what-is-npm):

    npm install -g swagger-examples-validator

Usage
-----

```
swagger-examples-validator [options] <filepath>

Validate embedded examples in Swagger-JSONs.
To validate external examples, use the `-s` and `-e` option.
To pass a mapping-file, to validate multiple external examples, use the `-m` option.

Options:

  -V, --version                              output the version number
  -s, --schema-jsonpath <schema-jsonpath>    JSON-path to schema, to validate the example file against
  -e, --example-filepath <example-filepath>  file path to example file, to be validated
  -m, --mapping-filepath <mapping-filepath>  file path to map, containing schema-paths as key and the file-path(s) to
                                             examples as value. If wildcards are used, the parameter has to be put in
                                             quotes.
  -c, --cwd-to-mapping-file                  changes to the directory of the mapping-file, before resolving the
                                             example's paths. Use this option, if your mapping-files use relative paths
                                             for the examples
  -h, --help                                 output usage information
````

The validator will search the Swagger-JSON for response-examples and validate them against its schema.

If an external example has to be verified, the `-s` and `-e` option has to be used.

For example:

```
$ swagger-examples-validator -s $.paths./.get.responses.200.schema -e example.json swagger.json
```

To validate multiple external examples, pass a mapping file with a similar structure along with the `-m` option:

```json
{
  "$.paths./.get.responses.200.schema": [
    "test/data/external-examples-valid-example1.json",
    "test/data/external-examples-valid-example2.json",
    "test/data/external-examples-invalid-type.json"
  ],
  "$.paths./.get.responses.300.schema": "test/data/external-examples-invalid-missing-link.json"
}
```

Errors will be written to `stderr`.

Sample output of validation errors:

```json
[
    {
        "keyword": "type",
        "dataPath": ".versions[0].id",
        "schemaPath": "#/properties/versions/items/properties/id/type",
        "params": {
            "type": "string"
        },
        "message": "should be string",
        "examplePath": "/~1/get/responses/200/examples/application~1json"
    }
]
```

Test
----

To run the tests, execute

    npm test

or to check the coverage

    npm run coverage

Future features
---------------

- YAML support
