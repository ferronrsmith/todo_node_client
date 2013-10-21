module.exports = function (grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jshint: {
            files: ['Gruntfile.js', 'test/unit/*.js'],
            options: {
                // options here to override JSHint defaults
                jshintrc: '.jshintrc'
            }
        },
        karma: {
            options: {
                singleRun: true,
                browsers: ['PhantomJS'],
            },
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        watch: {
            files: ['gruntfile.js', 'app/js/*.js', 'test/**/*.js'],
            tasks: ['jshint']
        },
        coveralls: {
            options: {
                coverage_dir: 'coverage'
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-karma-coveralls');
//    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.registerTask('test', ['jshint', 'karma:unit']);
    grunt.registerTask('default', ['jshint', 'karma:unit', 'coveralls']);

};
