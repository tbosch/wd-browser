/*
 * grunt-build-webdriver.js
 */
var shell = require('shelljs');

module.exports = function(grunt){
    grunt.registerTask('buildWebdriver', 'download webdriver.js and build it', function(type){
        //defaults
        var options = this.options({
            target: 'lib'
        });
        if (!options.version) {
            throw new Error("no version for buildWebdriver set!");
        }

        var pwd = shell.pwd(),
            targetDir = pwd+'/'+options.target,
            downloadDir = '.tmp/selenium';
        if (shell.test('-e', downloadDir)) {
            shell.cd(downloadDir);
            shell.exec('git pull ', 'Pulled selenium repo');
        } else {
            shell.exec('git clone https://code.google.com/p/selenium/ '+downloadDir);
            grunt.log.ok('Cloned selenium repo');
            shell.cd(downloadDir);
        }
        shell.rm('-rf', 'build');
        grunt.log.ok('Deleted old build artifacts');
        shell.exec('git checkout '+options.version, 'checked out version '+options.version);
        grunt.log.ok('Checked out version '+options.version);
        shell.exec('./go //javascript/webdriver:webdriver');
        grunt.log.ok('Built webdriver.js');
        shell.exec('./go //javascript/atoms:atoms');
        grunt.log.ok('Built atoms.js');
        shell.cp('-f', './build/javascript/webdriver/webdriver.js', targetDir);
        shell.cp('-f', './build/javascript/atoms/atoms.js', targetDir);
        grunt.log.ok('Copied webdriver.js and atoms.js to '+targetDir);
    });
};