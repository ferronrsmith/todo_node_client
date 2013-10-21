// Karma configuration
// Generated on Sat Jan 19 2013 21:49:34 GMT-0400 (AST)


module.exports = function (config) {
    config.set({
        basePath: '',
        files: [
            'adapter/*.src.js',
            'js/libs/**/jquery-*.js',
            'js/libs/**/angular.js',
            'js/libs/**/angular-resource.js',
            'js/app.js',
            'js/services/*.js',
            'js/directives/*.js',
            'js/controllers/*.js',
            'test/vendor/angular-mocks.js',
            'js/libs/matchers/*.js',
            'test/unit/*.js'
        ],
        autoWatch: true,
        browsers: ['PhantomJS'],
        junitReporter: {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        },
        reporters: ['progress', 'coverage'],
        coverageReporter : {
            type : 'lcov',
            dir : 'coverage/'
        },
        preprocessors : {
            '**/js/controllers/*.js' : 'coverage',
            '**/js/directives/*.js' : 'coverage',
            '**/js/services/*.js' : 'coverage',
            '**/app/scripts/app.js' : 'coverage'
        },
        singleRun: false,
        frameworks : ['jasmine']
    });
};