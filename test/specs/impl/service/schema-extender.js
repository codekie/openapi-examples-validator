const { setNoAdditionalProperties } = require('../../../../src/impl/service/disallow-additional-properties'),
    { getJsonPathsToExamples } = require('../../../../src/impl/v3/index');

const SCHEMA = _getSchema(),
    JSON_PATHS__OBJECTS = _getPaths();

describe('The schema extender', function() {
    it('should find the right matches', function() {
        const paths = [];
        setNoAdditionalProperties(SCHEMA, getJsonPathsToExamples(), () => (value, resultType, data) => {
            paths.push(data.path);
        });
        paths.sort().should.deep.equal(JSON_PATHS__OBJECTS.sort());
    });
});

function _getSchema() {
    return {
        'openapi': '3.0.0',
        'info': {
            'version': '1.0.0',
            'title': 'Swagger Petstore',
            'license': {
                'name': 'MIT'
            }
        },
        'servers': [
            {
                'url': 'http://petstore.swagger.io/v1'
            }
        ],
        'paths': {
            '/pets': {
                'get': {
                    'summary': 'List all pets',
                    'operationId': 'listPets',
                    'responses': {
                        '200': {
                            'description': 'An array of pets',
                            'content': {
                                'application/json': {
// MAYBE (not necessary, but doesn't break if it's included)
// I haven't been able to write a JSONPath-query, to exclude it (`$..application/json.schema` for the type `array`)
                                    'schema': {
                                        'type': 'array',
// TO BE FOUND
                                        'items': {
                                            'required': [
                                                'id',
                                                'name'
                                            ],
                                            'properties': {
                                                'id': {
                                                    'type': 'number'
                                                },
                                                'name': {
                                                    'type': 'string'
                                                },
                                                'tag': {
                                                    'type': 'string'
                                                },
// TO BE FOUND
                                                'schema': {
                                                    'type': 'object',
                                                    'properties': {
// TO BE FOUND
                                                        'properties': {
                                                            'type': 'object',
// NOT TO BE FOUND
                                                            'properties': {
                                                                'type': {
                                                                    'type': 'object'
                                                                },
                                                                'color': {
                                                                    'type': 'string'
                                                                },
// TO BE FOUND
                                                                'properties': {
                                                                    'type': 'object',
                                                                    'properties': {
                                                                        'foo': {
                                                                            'type': 'number'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    'examples': {
                                        'single': {
                                            'value': [
                                                {
                                                    'id': 0,
                                                    'name': 'Herbert',
                                                    'tag': 'Doggo',
                                                    'owner': 'John',
                                                    'age': 5,
// NOT TO BE FOUND (examples-sub-path)
                                                    'schema': {
// NOT TO BE FOUND (examples-sub-path)
                                                        'properties': {
                                                            'color': 'black',
                                                            'type': 'object',
                                                            'properties': {
                                                                'foo': 1
                                                            }
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },
                        'default': {
                            'description': 'unexpected error',
                            'content': {
                                'application/json': {
// TO BE FOUND
                                    'schema': {
                                        'required': [
                                            'code',
                                            'message'
                                        ],
                                        'properties': {
                                            'code': {
                                                'type': 'number'
                                            },
                                            'message': {
                                                'type': 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'post': {
                    'summary': 'Create a pet',
                    'operationId': 'createPets',
                    'tags': [
                        'pets'
                    ],
                    'responses': {
                        '201': {
                            'description': 'Null response'
                        },
                        'default': {
                            'description': 'unexpected error',
                            'content': {
                                'application/json': {
// TO BE FOUND
                                    'schema': {
                                        'required': [
                                            'code',
                                            'message'
                                        ],
                                        'properties': {
                                            'code': {
                                                'type': 'number'
                                            },
                                            'message': {
                                                'type': 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/pets/{petId}': {
                'get': {
                    'summary': 'Info for a specific pet',
                    'operationId': 'showPetById',
                    'parameters': [
                        {
                            'name': 'petId',
                            'in': 'path',
                            'required': true,
                            'description': 'The id of the pet to retrieve',
                            'schema': {
                                'type': 'string'
                            }
                        }
                    ],
                    'responses': {
                        '200': {
                            'description': 'Expected response to a valid request',
                            'content': {
                                'application/json': {
// TO BE FOUND
                                    'schema': {
                                        'required': [
                                            'id',
                                            'name'
                                        ],
                                        'properties': {
                                            'id': {
                                                'type': 'number'
                                            },
                                            'name': {
                                                'type': 'string'
                                            },
                                            'tag': {
                                                'type': 'string'
                                            },
// TO BE FOUND
                                            'schema': {
                                                'type': 'object',
                                                'properties': {
// TO BE FOUND
                                                    'properties': {
                                                        'type': 'object',
                                                        'properties': {
                                                            'color': {
                                                                'type': 'string'
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    'example': {
                                        'id': 0,
                                        'name': 'Herbert',
                                        'tag': 'Doggo',
                                        'owner': 'John',
                                        'age': 5,
// NOT TO BE FOUND
                                        'schema': {
                                            'properties': {
                                                'color': 'black'
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'default': {
                            'description': 'unexpected error',
                            'content': {
                                'application/json': {
// TO BE FOUND
                                    'schema': {
                                        'required': [
                                            'code',
                                            'message'
                                        ],
                                        'properties': {
                                            'code': {
                                                'type': 'number'
                                            },
                                            'message': {
                                                'type': 'string'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };
}

function _getPaths() {
    /* eslint-disable max-len */
    return [
        "$['paths']['/pets']['get']['responses'][200]['content']['application/json']['schema']",
        "$['paths']['/pets']['get']['responses'][200]['content']['application/json']['schema']['items']",
        "$['paths']['/pets']['get']['responses'][200]['content']['application/json']['schema']['items']['properties']['schema']",
        "$['paths']['/pets']['get']['responses'][200]['content']['application/json']['schema']['items']['properties']['schema']['properties']['properties']",
        "$['paths']['/pets']['get']['responses'][200]['content']['application/json']['schema']['items']['properties']['schema']['properties']['properties']['properties']['properties']",
        "$['paths']['/pets']['get']['responses']['default']['content']['application/json']['schema']",
        "$['paths']['/pets']['post']['responses']['default']['content']['application/json']['schema']",
        "$['paths']['/pets/{petId}']['get']['responses'][200]['content']['application/json']['schema']",
        "$['paths']['/pets/{petId}']['get']['responses'][200]['content']['application/json']['schema']['properties']['schema']",
        "$['paths']['/pets/{petId}']['get']['responses'][200]['content']['application/json']['schema']['properties']['schema']['properties']['properties']",
        "$['paths']['/pets/{petId}']['get']['responses']['default']['content']['application/json']['schema']"
    ];
    /* eslint-enable max-len */
}
