const util = require('util'),
    VERSION = require('../../package').version,
    { text: _textHelp } = require('../data/output-help'),
    { text: _textMapExternalExamples } = require('../data/v2/output-map-external-examples'),
    exec = util.promisify(require('child_process').exec),
    {
        getPathOfTestData,
        should
    } = require('../util/setup-tests');

const CMD__RUN = `node ${require.resolve('../../src/cli.js')}`,   // Resolve path, for mutation-tests
    CMD__RUN_BUILT = 'node dist/cli.js',
    JSON_PATH__SCHEMA = '$.paths./.get.responses.200.schema';

describe('CLI-module', function() {
    before(function() {
        // Make sure that `commander`'s output will be the same, independent of the console's width
        this.origColumns = process.stdout.columns;
        process.stdout.columns = 80;
    });
    after(function() {
        process.stdout.columns = this.origColumns;
    });
    describe('spawning a child process', function() {
        describe('version', function() {
            it('should print out the current version', async function() {
                const { stdout, stderr } = await exec(`${CMD__RUN} --version`);
                stdout.should.equal(`${VERSION}\n`);
                stderr.should.equal('');
            });
        });
        describe('help', function() {
            it('should show the right text', async function() {
                const { stdout, stderr } = await exec(`${CMD__RUN} --help`);
                stdout.should.equal(_textHelp);
                stderr.should.equal('');
            });
        });
        describe('file mappings and invalid examples', function() {
            it('should work with the source code', async function() {
                const pathMapExamples = getPathOfTestData('v2/map-external-examples-relative-invalid'),
                    pathSchema = getPathOfTestData('v2/external-examples-schema');
                try {
                    await exec(`${CMD__RUN} -m ${pathMapExamples} -c ${pathSchema}`);
                    should.fail('Expected to throw an error');
                } catch ({ stdout, stderr }) {
                    stdout.should.equal(_textMapExternalExamples);
                    stderr.should.not.equal('');
                }
            });
            it('should work with the built code', async function() {
                const pathMapExamples = getPathOfTestData('v2/map-external-examples-relative-invalid'),
                    pathSchema = getPathOfTestData('v2/external-examples-schema');
                try {
                    await exec(`${CMD__RUN_BUILT} -m ${pathMapExamples} -c ${pathSchema}`);
                    should.fail('Expected to throw an error');
                } catch ({ stdout, stderr }) {
                    stdout.should.equal(_textMapExternalExamples);
                    stderr.should.not.equal('');
                }
            });
        });
        describe('with valid examples', function() {
            it('should write to stdout, but not into stderr', async function() {
                const { stdout, stderr } = await exec(`${CMD__RUN} ${getPathOfTestData('v2/simple-example')}`);
                stdout.should.not.equal('');
                stderr.should.equal('');
            });
        });
        describe('with invalid examples', function() {
            it('should write to stdout and stderr', async function() {
                try {
                    await exec(`${CMD__RUN} ${getPathOfTestData('v2/multiple-errors')}`);
                    should.fail('Expected to throw an error');
                } catch ({ stdout, stderr }) {
                    stdout.should.not.equal('');
                    stderr.should.not.equal('');
                }
            });
            it('should capture invalid references from ajv', async function() {
                await exec(`${CMD__RUN} ${getPathOfTestData('v2/invalid-format')}`)
                    .then(() => {
                        // should never reach this
                        throw { stdout: 'unreachable', stderr: 'unreachable' };
                    })
                    .catch(({ stdout, stderr }) => {
                        stdout.should.contain('Errors found.', 'Stdout did not contain "Errors found." message');
                        stderr.should.contain(
                            'unknown format \\"timestamp\\" is used in schema at '
                            + 'path \\"#/properties/versions/items/properties/occurred',
                            'Stderr did not contain unknown format errors'
                        );
                    });
            });
        });
        describe('single external example', function() {
            it('should have no error', async function() {
                const pathMapExamples = getPathOfTestData('v2/external-examples-valid-example1'),
                    pathSchema = getPathOfTestData('v2/external-examples-schema');
                const { stdout, stderr } = await exec(
                    `${CMD__RUN} -s ${JSON_PATH__SCHEMA} -e ${pathMapExamples} ${pathSchema}`
                );
                stdout.should.not.equal('');
                stderr.should.equal('');
            });
        });
        describe('with additional properties', function() {
            it('should show no error without providing the flag', async function() {
                const pathSchema = getPathOfTestData('v3/additional-properties/schema-with-examples.yaml', true);
                const { stdout, stderr } = await exec(`${CMD__RUN} ${pathSchema}`);
                stdout.should.not.equal('');
                stderr.should.equal('');
            });
            it('should show error with providing the flag', async function() {
                const pathSchema = getPathOfTestData('v3/additional-properties/schema-with-examples.yaml', true);
                try {
                    await exec(`${CMD__RUN} -n ${pathSchema}`);
                    should.fail('Expected to throw an error');
                } catch ({ stdout, stderr }) {
                    stdout.should.equal(require('../data/output/api-with-examples-and-additional-properties').value);
                    stderr.should.equal(JSON.stringify(
                        require('../data/v3/additional-properties/errors-schema-with-examples.json'),
                        null,
                        '    '
                    ));
                }
            });
            it('should show no errors due to the `allOf`-combiner in schema', async function() {
                const pathSchema
                    = getPathOfTestData('v3/additional-properties/schema-with-schema-combiner-invalid.yaml', true);
                try {
                    await exec(`${CMD__RUN} -n ${pathSchema}`);
                    should.fail('Expected to throw an error');
                } catch ({ stdout, stderr }) {
                    stdout.should.include('Errors found.');
                    stderr.should.include('"message": "should NOT have additional properties"');
                    stderr.should.include('extra_property');
                }
            });
            it('should show no errors with `allOf`-combiner in schema', async function() {
                const pathSchema
                    = getPathOfTestData('v3/additional-properties/schema-with-schema-combiner-valid.yaml', true);
                const { stdout } = await exec(`${CMD__RUN} -n ${pathSchema}`);
                stdout.should.include('\nNo errors found.\n');
            });
            it('should show no error when additional properties are allowed', async function() {
                const pathSchema
                    = getPathOfTestData('v3/additional-properties/schema-with-schema-combiner-invalid.yaml', true);
                const { stdout, stderr } = await exec(`${CMD__RUN} ${pathSchema}`);
                stdout.should.include('No errors found.');
                stderr.should.equal('');
            });
        });
    });
    describe('execute as module, via `require` (for mutation-tests)', function() {
        before(function() {
            // Preparations to run the CLI as module and not as child-process
            this.origArgv = process.argv;
            process.env.OPENAPI_EXAMPLES_VALIDATOR_TESTS = 'true';
            // Capture stdout-stream
            this.output = '';
            this.origStdoutWrite = process.stdout.write.bind(process.stdout);
            process.stdout.write = (chunk) => {
                if (typeof chunk === 'string') {
                    this.output += chunk;
                }
            };
            // Capture sterr-stream
            this.error = '';
            this.origStderrWrite = process.stderr.write.bind(process.stderr);
            process.stderr.write = (chunk) => {
                if (typeof chunk === 'string') {
                    this.error += chunk;
                }
            };
            this.origExit = process.exit;
            // Prevent commander from exiting the test-process
            process.exit = () => {
            };
        });
        after(function() {
            process.argv = this.origArgv;
            delete process.env.OPENAPI_EXAMPLES_VALIDATOR_TESTS;
            process.stdout.write = this.origStdoutWrite;
            process.stderr.write = this.origStderrWrite;
            process.exit = this.origExit;
        });
        beforeEach(function() {
            // Make sure that commander doesn't keep internal caches
            delete require.cache[require.resolve('commander')];
            // Don't cache the CLI-script
            delete require.cache[require.resolve('../../src/cli')];
            this.output = '';
            this.error = '';
        });
        it('should show the right help-text', async function() {
            process.argv = ['node', require.resolve('../../src/cli'), '--help'];
            // Hack, for `commander` to exit, after the help has been printed
            process.exit = () => {
                throw new Error('Exited');
            };
            try {
                await require('../../src/cli');
                should.fail('Expected to throw an error');
            } catch (e) {
                e.message.should.equal('Exited');
                this.output.should.equal(_textHelp);
            }
        });
        it('should show statistics in the error-case', async function() {
            const pathMapExamples = getPathOfTestData('v2/map-external-examples-relative-invalid'),
                pathSchema = getPathOfTestData('v2/external-examples-schema');
            process.argv = ['node', 'cli.js', '-m', pathMapExamples, '-c', pathSchema];
            await require('../../src/cli');
            this.output.should.equal(_textMapExternalExamples);
            this.error.should.not.equal('');
        });
    });
});
