const VERSION = require('../../package').version,
    { text: textHelp } = require('../data/output-help'),
    { text: textMapExternalExamples } = require('../data/output-map-external-examples'),
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
                stdout.should.equal(textHelp);
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('file mappings and invalid examples', function() {
        it('should work with the source code', function(done) {
            exec(`${ CMD__RUN } -m ${ getPathOfTestData('map-external-examples') } `
                + `-c ${ getPathOfTestData('external-examples-schema') }`, (err, stdout) => {
                stdout.should.equal(textMapExternalExamples);
                done();
            });
        });
        it('should work with the built code', function(done) {
            exec(`${ CMD__RUN_BUILT } -m ${ getPathOfTestData('map-external-examples') } `
                + `-c ${ getPathOfTestData('external-examples-schema') }`, (err, stdout) => {
                stdout.should.equal(textMapExternalExamples);
                done();
            });
        });
    });
    describe('with valid examples', function() {
        it('should write to stdout, but not into stderr', function(done) {
            exec(`${ CMD__RUN } ${ getPathOfTestData('simple-example') }`, (err, stdout, stderr) => {
                stdout.should.not.equal('');
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('with invalid examples', function() {
        it('should write to stdout and stderr', function(done) {
            exec(`${ CMD__RUN } ${ getPathOfTestData('multiple-errors') }`, (err, stdout, stderr) => {
                stdout.should.not.equal('');
                stderr.should.not.equal('');
                done();
            });
        });
    });
});
