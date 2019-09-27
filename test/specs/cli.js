const VERSION = require('../../package').version,
    { text: helpText } = require('../data/output-help'),
    exec = require('child_process').exec,
    {
        getPathOfTestData
    } = require('../util/setup-tests');

const CMD__RUN = 'node dist/cli.js';

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
                stdout.should.equal(helpText);
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('with valid examples', () => {
        it('should write to stdout, but not into stderr', (done) => {
            exec(`${ CMD__RUN } ${ getPathOfTestData('simple-example') }`, (err, stdout, stderr) => {
                stdout.should.not.equal('');
                stderr.should.equal('');
                done();
            });
        });
    });
    describe('with invalid examples', () => {
        it('should write to stdout and stderr', (done) => {
            exec(`${ CMD__RUN } ${ getPathOfTestData('multiple-errors') }`, (err, stdout, stderr) => {
                stdout.should.not.equal('');
                stderr.should.not.equal('');
                done();
            });
        });
    });
});
