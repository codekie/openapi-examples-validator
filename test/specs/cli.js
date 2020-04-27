const VERSION = require('../../package').version,
    { text: _textHelp } = require('../data/output-help'),
    { text: _textMapExternalExamples } = require('../data/v2/output-map-external-examples'),
    exec = require('child_process').exec,
    {
        getPathOfTestData
    } = require('../util/setup-tests');

const CMD__RUN = 'node src/cli.js',
    CMD__RUN_BUILT = 'node dist/cli.js',
    JSON_PATH__SCHEMA = '$.paths./.get.responses.200.schema';

describe('CLI-module', function() {
    describe('version', function() {
        it('should print out the current version', function(done) {
            exec(`${ CMD__RUN } --version`, (err, stdout, stderr) => {
                stdout.should.equal(`${ VERSION }\n`);
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('help', function() {
        it('should show the right text', function(done) {
            exec(`${ CMD__RUN } --help`, (err, stdout, stderr) => {
                stdout.should.equal(_textHelp);
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('file mappings and invalid examples', function() {
        it('should work with the source code', function(done) {
            const pathMapExamples = getPathOfTestData('v2/map-external-examples-relative-invalid'),
                pathSchema = getPathOfTestData('v2/external-examples-schema');
            exec(`${ CMD__RUN } -m ${ pathMapExamples } -c ${ pathSchema }`,
                (err, stdout, stderr) => {
                    stdout.should.equal(_textMapExternalExamples);
                    stderr.should.not.equal('');
                    done();
                }
            );
        });
        it('should work with the built code', function(done) {
            const pathMapExamples = getPathOfTestData('v2/map-external-examples-relative-invalid'),
                pathSchema = getPathOfTestData('v2/external-examples-schema');
            exec(`${ CMD__RUN_BUILT } -m ${ pathMapExamples } -c ${ pathSchema }`,
                (err, stdout, stderr) => {
                    stdout.should.equal(_textMapExternalExamples);
                    stderr.should.not.equal('');
                    done();
                }
            );
        });
    });
    describe('with valid examples', function() {
        it('should write to stdout, but not into stderr', function(done) {
            exec(`${ CMD__RUN } ${ getPathOfTestData('v2/simple-example') }`,
                (err, stdout, stderr) => {
                    stdout.should.not.equal('');
                    stderr.should.equal('');
                    done();
                }
            );
        });
    });
    describe('with invalid examples', function() {
        it('should write to stdout and stderr', function(done) {
            exec(`${ CMD__RUN } ${ getPathOfTestData('v2/multiple-errors') }`,
                (err, stdout, stderr) => {
                    stdout.should.not.equal('');
                    stderr.should.not.equal('');
                    done();
                }
            );
        });
    });
    describe('single external example', function() {
        it('should have no error', function(done) {
            const pathMapExamples = getPathOfTestData('v2/external-examples-valid-example1'),
                pathSchema = getPathOfTestData('v2/external-examples-schema');
            exec(`${ CMD__RUN } -s ${ JSON_PATH__SCHEMA } -e ${ pathMapExamples } ${ pathSchema }`,
                (err, stdout, stderr) => {
                    stdout.should.not.equal('');
                    stderr.should.equal('');
                    done();
                }
            );
        });
    });
});
