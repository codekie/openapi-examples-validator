# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
