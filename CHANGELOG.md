# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [4.3.0](https://github.com/codekie/openapi-examples-validator/compare/v4.2.2...v4.3.0) (2021-02-10)


### Features

* do not set noAdditionalProperties on schemas containing JSON schema combiners ([#121](https://github.com/codekie/openapi-examples-validator/issues/121)) ([14e01dc](https://github.com/codekie/openapi-examples-validator/commit/14e01dc1fe2ed5f1d382cf386e83c7eee8bc58c4))


### Bug Fixes

* upgrade dependencies ([#131](https://github.com/codekie/openapi-examples-validator/issues/131)) ([2ff3ca8](https://github.com/codekie/openapi-examples-validator/commit/2ff3ca8d44903fe9e2cbc01ea724590983e492e7))

### [4.2.2](https://github.com/codekie/openapi-examples-validator/compare/v4.2.1...v4.2.2) (2021-02-05)


### Bug Fixes

* detect examples with names that have to be escaped ([#126](https://github.com/codekie/openapi-examples-validator/issues/126)) ([40b8ea4](https://github.com/codekie/openapi-examples-validator/commit/40b8ea491da4d71d557974d26e79b6fec68abc55))

### [4.2.1](https://github.com/codekie/openapi-examples-validator/compare/v4.2.0...v4.2.1) (2021-01-18)


### Bug Fixes

* fail on unhandled promise rejections ([#120](https://github.com/codekie/openapi-examples-validator/issues/120)) ([41e347f](https://github.com/codekie/openapi-examples-validator/commit/41e347f8cd6349446b496f99c57a770236b15e78))
* upgrade dependencies ([#122](https://github.com/codekie/openapi-examples-validator/issues/122)) ([ba92a99](https://github.com/codekie/openapi-examples-validator/commit/ba92a99f4013aa8a2f027bd03b391f7d2103d273))

## [4.2.0](https://github.com/codekie/openapi-examples-validator/compare/v4.1.1...v4.2.0) (2020-11-21)


### Features

* implement JSON schema draft-04 as default ([#110](https://github.com/codekie/openapi-examples-validator/issues/110)) ([94d6880](https://github.com/codekie/openapi-examples-validator/commit/94d6880e515039c3e9b3a0e81729cdf830dd8b7a))


### Bug Fixes

* upgrade dependencies ([#109](https://github.com/codekie/openapi-examples-validator/issues/109)) ([991c4c8](https://github.com/codekie/openapi-examples-validator/commit/991c4c809cc8b182e01332da40fd23904e1a77a6))

### [4.1.1](https://github.com/codekie/openapi-examples-validator/compare/v4.1.0...v4.1.1) (2020-10-01)


### Bug Fixes

* add docker-section in README.md ([581ce88](https://github.com/codekie/openapi-examples-validator/commit/581ce8888888da7f2f1874da73b2e2c7cc706988))

## [4.1.0](https://github.com/codekie/openapi-examples-validator/compare/v4.0.1...v4.1.0) (2020-10-01)


### Features

* add docker-support ([#104](https://github.com/codekie/openapi-examples-validator/issues/104)) ([74996e0](https://github.com/codekie/openapi-examples-validator/commit/74996e0792b238f203c6fe90feed0c7b381698a7)), closes [#102](https://github.com/codekie/openapi-examples-validator/issues/102)


### Bug Fixes

* upgrade ajv-oai from 1.2.0 to 1.2.1 ([#101](https://github.com/codekie/openapi-examples-validator/issues/101)) ([8aa4ce4](https://github.com/codekie/openapi-examples-validator/commit/8aa4ce406e5439fe2720999fc6b769580747bbd0))
* upgrade json-pointer from 0.6.0 to 0.6.1 ([#100](https://github.com/codekie/openapi-examples-validator/issues/100)) ([c8b48da](https://github.com/codekie/openapi-examples-validator/commit/c8b48da9b1f322b3632b79ade62545fe616111c2))

### [4.0.1](https://github.com/codekie/openapi-examples-validator/compare/v4.0.0...v4.0.1) (2020-09-15)


### Bug Fixes

* upgrade ajv from 6.12.3 to 6.12.4 ([#98](https://github.com/codekie/openapi-examples-validator/issues/98)) ([6052029](https://github.com/codekie/openapi-examples-validator/commit/6052029cc04bd7332662462e0847e112674623a7))
* upgrade ajv from 6.12.4 to 6.12.5 ([#99](https://github.com/codekie/openapi-examples-validator/issues/99)) ([fb8efd2](https://github.com/codekie/openapi-examples-validator/commit/fb8efd22d7cfd5b3fb8047080475517a9157c0a3))
* upgrade json-schema-ref-parser from 9.0.3 to 9.0.5 ([#94](https://github.com/codekie/openapi-examples-validator/issues/94)) ([d4a11f3](https://github.com/codekie/openapi-examples-validator/commit/d4a11f35454a286c451b4135d4be7a43fb277c01))
* upgrade json-schema-ref-parser from 9.0.5 to 9.0.6 ([#95](https://github.com/codekie/openapi-examples-validator/issues/95)) ([452ca34](https://github.com/codekie/openapi-examples-validator/commit/452ca345c816d97bb52d62c736575b1b39c1d2b9))

## [4.0.0](https://github.com/codekie/openapi-examples-validator/compare/v3.0.4...v4.0.0) (2020-07-14)


### ⚠ BREAKING CHANGES

* The entry function `validateExamples` in `src/index.js` is `async` now

### Features

* support the option to disallow properties that have not been defined in the spec ([#87](https://github.com/codekie/openapi-examples-validator/issues/87)) ([c23ec9d](https://github.com/codekie/openapi-examples-validator/commit/c23ec9db6113a80c5530f7b931da6949f3bb026b))


### Bug Fixes

* upgrade dependencies ([67293ad](https://github.com/codekie/openapi-examples-validator/commit/67293ad07e9bc5a524d88ce64bcf2dbb328c8c4e))
* upgrade yaml from 1.9.2 to 1.10.0 ([8a68137](https://github.com/codekie/openapi-examples-validator/commit/8a68137824f378e2379583df6a62301e89c5f2fb))
* upgrade yaml from 1.9.2 to 1.10.0 ([6dad1b8](https://github.com/codekie/openapi-examples-validator/commit/6dad1b85e14630c1c2ba0c05af2c84438b29ab14))

### [3.0.4](https://github.com/codekie/openapi-examples-validator/compare/v3.0.3...v3.0.4) (2020-06-08)


### Bug Fixes

* don't recognize `value`-properties as examples ([9457dbe](https://github.com/codekie/openapi-examples-validator/commit/9457dbe53d98261a2e8436dad681170404a8ead8))

### [3.0.3](https://github.com/codekie/openapi-examples-validator/compare/v3.0.2...v3.0.3) (2020-05-19)


### Bug Fixes

* map yaml-parser errors to ApplicationErros ([0737dd3](https://github.com/codekie/openapi-examples-validator/commit/0737dd37afce26ff1d0e591334531bd3796f4a8b))
* upgrade dependencies ([b86daee](https://github.com/codekie/openapi-examples-validator/commit/b86daeedc76603a0c5183b92f2bf0fa9cfd8a92b))

### [3.0.2](https://github.com/codekie/openapi-examples-validator/compare/v3.0.1...v3.0.2) (2020-04-29)


### Bug Fixes

* fix statistics for `schemasWithExamples` over multiple mapping-files ([d694cdf](https://github.com/codekie/openapi-examples-validator/commit/d694cdfe716fe04c787ec97f648e2c4b97ea49e2))

### [3.0.1](https://github.com/codekie/openapi-examples-validator/compare/v3.0.0...v3.0.1) (2020-04-27)


### Bug Fixes

* fix statistics for `schemasWithExamples` ([d68f07e](https://github.com/codekie/openapi-examples-validator/commit/d68f07e2eea70521c82228ac6f6a93a572eb30ee))
* upgrade dependencies ([8c56445](https://github.com/codekie/openapi-examples-validator/commit/8c564457bbe7a6fec062f9b5dfa9fb6f8bfb65c3))

## [3.0.0](https://github.com/codekie/openapi-examples-validator/compare/v2.1.0...v3.0.0) (2020-04-21)


### ⚠ BREAKING CHANGES

* Raised minimal requirement of NodeJS to `v10`

### Features

* support dereferencing JSON Schema $ref pointers ([fd85c20](https://github.com/codekie/openapi-examples-validator/commit/fd85c2071dc5015531f4a4187b272e50f79ec22f))


### Bug Fixes

* upgrade dependencies ([cfcaf9f](https://github.com/codekie/openapi-examples-validator/commit/cfcaf9f7b36fae043f24ec0597f8fd4999f5bce0))

## [2.1.0](https://github.com/codekie/openapi-examples-validator/compare/v2.0.1...v2.1.0) (2020-02-25)


### Features

* add formats `int32`, `float` and `double` to type `number` and format `int64` to type `string` ([9f5a6d9](https://github.com/codekie/openapi-examples-validator/commit/9f5a6d96be8e56ce1d5702693297bbedfdc93d6a))
* support `example`-property ([3cf4167](https://github.com/codekie/openapi-examples-validator/commit/3cf4167d7229d77d5a6cf315d9fd3c3b7be35ea8))
* support `nullable` for input and output data types ([c9ceb38](https://github.com/codekie/openapi-examples-validator/commit/c9ceb383df44ffdbf2eacad5d6d8b95f3f91d097))
* support validation of example/examples in request (as `parameters` and `requestBody`) ([cb5ca6e](https://github.com/codekie/openapi-examples-validator/commit/cb5ca6e1ad9ff5cec6f6ef5cadc9daca2d72f71a))


### Bug Fixes

* test all examples of a spec, not only the last one ([e0a2dfc](https://github.com/codekie/openapi-examples-validator/commit/e0a2dfcb7094b5156488951219bbae8ffbbb9895))
* upgrade node-engine, in package.json ([4e281d5](https://github.com/codekie/openapi-examples-validator/commit/4e281d5eb8b3fe085430c85df2600f2417e3b8cd))

### [2.0.1](https://github.com/codekie/openapi-examples-validator/compare/v2.0.0...v2.0.1) (2019-11-28)


### Bug Fixes

* upgrade dependencies (fix-versions) ([9e70981](https://github.com/codekie/openapi-examples-validator/commit/9e709817653e5fad67a4b56975e98c007a93049e))
* upgrade dependencies (minor-versions) ([adf4039](https://github.com/codekie/openapi-examples-validator/commit/adf40393dcb14c279ef883bab4d7032a36a9da46))
* upgrade stryker-dependencies ([75c6af8](https://github.com/codekie/openapi-examples-validator/commit/75c6af863235e265ba8da139654caccbf2fc1589))

## [2.0.0](https://github.com/codekie/openapi-examples-validator/compare/v1.1.2...v2.0.0) (2019-11-13)


### ⚠ BREAKING CHANGES

* drop Node.js 6 support

### Bug Fixes

* fix CI-pipeline ([2acd331](https://github.com/codekie/openapi-examples-validator/commit/2acd331))
* increase mutation score ([87ea53b](https://github.com/codekie/openapi-examples-validator/commit/87ea53b))
* update dependencies (patches and minor upgrades) ([d5acecf](https://github.com/codekie/openapi-examples-validator/commit/d5acecf))
* **package:** update yaml to version 1.7.2 ([bad4f89](https://github.com/codekie/openapi-examples-validator/commit/bad4f89))


### Features

* add mutation-tests to CI-pipeline ([91c038e](https://github.com/codekie/openapi-examples-validator/commit/91c038e))
* add stryker-support for mutation-tests ([12a2c80](https://github.com/codekie/openapi-examples-validator/commit/12a2c80))
* add YAML-support ([c72266c](https://github.com/codekie/openapi-examples-validator/commit/c72266c))

<a name="1.1.2"></a>
## [1.1.2](https://github.com/codekie/openapi-examples-validator/compare/v1.1.1...v1.1.2) (2019-08-26)


### Bug Fixes

* make `ajv` a regular dependency [#18](https://github.com/codekie/openapi-examples-validator/issues/18) ([1f2adc1](https://github.com/codekie/openapi-examples-validator/commit/1f2adc1))



<a name="1.1.1"></a>
## [1.1.1](https://github.com/codekie/openapi-examples-validator/compare/v1.1.0...v1.1.1) (2019-03-07)


### Bug Fixes

* rename project to `openapi-examples-validator` ([6dc84d1](https://github.com/codekie/openapi-examples-validator/commit/6dc84d1))



<a name="1.1.0"></a>
# [1.1.0](https://github.com/codekie/openapi-examples-validator/compare/v1.0.0...v1.1.0) (2019-03-03)


### Features

* add codeclimate-badge ([402e9c3](https://github.com/codekie/openapi-examples-validator/commit/402e9c3))
* submit code coverage to codeclimate ([962657b](https://github.com/codekie/openapi-examples-validator/commit/962657b))
* support internal references ([2b9f626](https://github.com/codekie/openapi-examples-validator/commit/2b9f626))
* support OpenAPI v3 ([de0ea5e](https://github.com/codekie/openapi-examples-validator/commit/de0ea5e))



<a name="1.0.0"></a>
# [1.0.0](https://github.com/codekie/openapi-examples-validator/compare/v0.9.2...v1.0.0) (2018-10-09)


### Bug Fixes

* upgrade dependencies ([e2d8f78](https://github.com/codekie/openapi-examples-validator/commit/e2d8f78))


### BREAKING CHANGES

* dropping support for node version < 6



<a name="0.9.2"></a>
## [0.9.2](https://github.com/codekie/openapi-examples-validator/compare/v0.9.1...v0.9.2) (2018-10-09)


### Bug Fixes

* revert upgrade dependencies and restore compatibility for node versions 4+ ([8b310f9](https://github.com/codekie/openapi-examples-validator/commit/8b310f9))



<a name="0.9.1"></a>
## [0.9.1](https://github.com/codekie/openapi-examples-validator/compare/v0.9.0...v0.9.1) (2018-10-09)


### Bug Fixes

* fix wrong type of parameter ([9116238](https://github.com/codekie/openapi-examples-validator/commit/9116238))
* upgrade dependencies ([0103a7b](https://github.com/codekie/openapi-examples-validator/commit/0103a7b))



<a name="0.9.0"></a>
# [0.9.0](https://github.com/codekie/openapi-examples-validator/compare/v0.8.0...v0.9.0) (2018-02-26)


### Features

* support relative paths in mapping-files ([21484c5](https://github.com/codekie/openapi-examples-validator/commit/21484c5))



<a name="0.8.0"></a>
# [0.8.0](https://github.com/codekie/openapi-examples-validator/compare/v0.7.0...v0.8.0) (2018-02-23)


### Features

* support wildcards, when using mapping-files ([46d7028](https://github.com/codekie/openapi-examples-validator/commit/46d7028))



<a name="0.7.0"></a>
# [0.7.0](https://github.com/codekie/openapi-examples-validator/compare/v0.6.0...v0.7.0) (2018-02-22)


### Features

* improved error handling for missing files and wrong paths ([796e018](https://github.com/codekie/openapi-examples-validator/commit/796e018))



<a name="0.6.0"></a>
# [0.6.0](https://github.com/codekie/openapi-examples-validator/compare/v0.5.2...v0.6.0) (2018-02-20)


### Features

* support validation of external examples ([cbeaf7a](https://github.com/codekie/openapi-examples-validator/commit/cbeaf7a))
* support validation of multiple external examples, with a mapping-file ([277475b](https://github.com/codekie/openapi-examples-validator/commit/277475b))



<a name="0.5.2"></a>
## [0.5.2](https://github.com/codekie/openapi-examples-validator/compare/v0.5.1...v0.5.2) (2018-02-16)


### Bug Fixes

* properly validate array-responses ([9695e42](https://github.com/codekie/openapi-examples-validator/commit/9695e42))



<a name="0.5.1"></a>
## [0.5.1](https://github.com/codekie/openapi-examples-validator/compare/v0.5.0...v0.5.1) (2017-02-19)


### Bug Fixes

* coveralls - add `coverage`-task in `after_success` as well ([64145c1](https://github.com/codekie/openapi-examples-validator/commit/64145c1))



<a name="0.5.0"></a>
# [0.5.0](https://github.com/codekie/openapi-examples-validator/compare/v0.4.0...v0.5.0) (2017-02-19)


### Bug Fixes

* wrong examplePath upon invalid examples ([fe99ccf](https://github.com/codekie/openapi-examples-validator/commit/fe99ccf))


### Features

* add coveralls support ([bed0733](https://github.com/codekie/openapi-examples-validator/commit/bed0733))
* add dependencies badge ([b628972](https://github.com/codekie/openapi-examples-validator/commit/b628972))
* add travis-support ([6c93294](https://github.com/codekie/openapi-examples-validator/commit/6c93294))
* add version badge ([8f97818](https://github.com/codekie/openapi-examples-validator/commit/8f97818))
* upgrade dependencies ([c68f44d](https://github.com/codekie/openapi-examples-validator/commit/c68f44d))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/codekie/openapi-examples-validator/compare/v0.3.2...v0.4.0) (2017-02-02)


### Features

* add JSON-pointer to invalid example in error-output ([7054fac](https://github.com/codekie/openapi-examples-validator/commit/7054fac))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/codekie/openapi-examples-validator/compare/v0.3.1...v0.3.2) (2017-01-16)


### Reverts

* fix: shrinkwrap dependencies ([4f31e08](https://github.com/codekie/openapi-examples-validator/commit/4f31e08))



<a name="0.3.1"></a>
## [0.3.1](https://github.com/codekie/openapi-examples-validator/compare/v0.3.0...v0.3.1) (2017-01-16)


### Bug Fixes

* shrinkwrap dependencies ([0adab60](https://github.com/codekie/openapi-examples-validator/commit/0adab60))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/codekie/openapi-examples-validator/compare/v0.2.0...v0.3.0) (2017-01-16)


### Bug Fixes

* print all errors of invalid example. fixes [#1](https://github.com/codekie/openapi-examples-validator/issues/1) ([44b74c2](https://github.com/codekie/openapi-examples-validator/commit/44b74c2))


### Features

* add simple statistics to validation output ([da93a1a](https://github.com/codekie/openapi-examples-validator/commit/da93a1a))



<a name="0.2.0"></a>
# [0.2.0](https://github.com/codekie/openapi-examples-validator/compare/v0.1.0...v0.2.0) (2017-01-14)


### Bug Fixes

* build for NodeJS ([da55910](https://github.com/codekie/openapi-examples-validator/commit/da55910))


### Features

* add CLI-support ([9e0aaf2](https://github.com/codekie/openapi-examples-validator/commit/9e0aaf2))
