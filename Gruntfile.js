module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            all: {
                src: ['lib/webdriver.js', 'lib/atoms.js', 'src/**/*.js'],
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        watch: {
            files: '<%= jshint.files %>',
            tasks: ['jshint', 'concat', 'karma:dev:run']
        },
        jshint: {
            files: ['src/**/*.js', 'test/**/*Spec.js'],
            options: {
                strict: false,
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: false,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                trailing: true,
                globals: {
                    module: false,
                    webdriver: true,
                    describe: true,
                    ddescribe: true,
                    xdescribe: true,
                    beforeEach: true,
                    afterEach: true,
                    it: true,
                    xit: true,
                    iit: true,
                    runs: true,
                    waitsFor: true,
                    waits: true,
                    spyOn: true,
                    expect: true,
                    jasmine: true,
                    uitest: true,
                    testutils: true,
                    window: true,
                    document: true,
                    dump: true
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 9000,
                    base: './',
                    hostname: ''
                }
            }
        },
        karma: {
            options: {
                configFile: 'test/config/karma.conf.js',
                files: [
                    'dist/wd-browser.js',
                    'test/**/*Spec.js'],
                proxies:  {
                    '/googlede': 'http://www.google.de',
                    '/search': 'http://www.google.de/search'
                }
            },
            dev: {
                options: {
                    singleRun: false,
                    browsers: []
                },
                background: true
            },
            travis: {
                options: {
                    singleRun: true,
                    browsers: ['PhantomJS']
                }
            },
            localBuild: {
                options: {
                    singleRun: true,
                    browsers: ['PhantomJS']
                }
            }
        },
        buildWebdriver: {
            options: {
                version: '2.34.0',
                target: 'lib'
            }
        }
    });

    grunt.registerTask('dev', ['karma:dev', 'watch']);

    grunt.registerTask('default', ['jshint', 'concat', 'karma:localBuild']);

    grunt.registerTask('travis', ['jshint', 'concat', 'karma:travis']);

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadTasks('build/grunt');
};