/* eslint-disable max-len */
module.exports = {
    text: `Usage: cli [options] <filepath>

Validate embedded examples in OpenAPI-specs (JSON and YAML supported).
  To validate external examples, use the \`-s\` and \`-e\` option.
  To pass a mapping-file, to validate multiple external examples, use the \`-m\` option.

Options:
  -V, --version                              output the version number
  -s, --schema-jsonpath <schema-jsonpath>    Path to OpenAPI-schema, to validate the example file against
  -e, --example-filepath <example-filepath>  file path to example file, to be validated
  -m, --mapping-filepath <mapping-filepath>  file path to map, containing schema-paths as key and the file-path(s) to examples as value. If wildcards are used, the parameter has to be put in quotes.
  -c, --cwd-to-mapping-file                  changes to the directory of the mapping-file, before resolving the example's paths. Use this option, if your mapping-files use relative paths for the examples
  -n, --no-additional-properties             don't allow properties that are not described in the schema
  -o, --ignore-formats <ignored-formats...>  Datatype formats to ignore (to prevent "unknown format" errors.)
  -h, --help                                 display help for command


  Example for external example-file:

    $ openapi-examples-validator -s $.paths./.get.responses.200.schema -e example.json openapi-spec.json


`
};
