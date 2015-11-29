// *****************************************************************************
// Variable definitions
// *****************************************************************************

var objDependencies = {
    'html-minifier' : '0.7.2',
    'jade'          : '1.9.2',
    'cheerio'       : '0.19.0',
};

// *****************************************************************************
// Package definitions
// *****************************************************************************

Package.describe({
    name          : 'marcstark:meteor-angular-jade-extended',
    version       : '1.0.0-beta',
    summary       : 'Extended handler for Jade in Meteor-Angular projects.',
    git           : 'https://github.com/marcstark/meteor-angular-jade-extended.git',
    documentation : 'README.md'
});

// *****************************************************************************

Npm.depends(objDependencies);

// *****************************************************************************

Package.registerBuildPlugin({
    name                : 'marcstark:meteor-angular-jade-extended',
    use                 : [],
    sources             : ['plugin/plugin.js'],
    npmDependencies     : objDependencies,
});

// *****************************************************************************

Package.onUse(function(api) {
    api.versionsFrom('1.2');
    api.use('isobuild:compiler-plugin@1.0.0');
});

// *****************************************************************************

Package.onTest(function(api) {
    api.use(['tinytest', 'standard-minifiers'], 'server');
    api.addAssets(['tests/mocks/jade-valid.jade'], 'server');
    api.addAssets(['tests/mocks/jade-valid.ng.jade'], 'server');
    api.addAssets(['tests/mocks/jade-valid.include.jade'], 'server');
    api.addAssets(['tests/mocks/jade-invalid.jade'], 'server');
    api.addFiles('tests/stubs.js', 'server');
    api.addFiles('plugin/plugin.js', 'server');
    api.addFiles('tests/tests.js', 'server');
});

// *****************************************************************************
