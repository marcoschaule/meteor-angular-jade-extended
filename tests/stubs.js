/**
* marcstark:meteor-angular-jade-extended
* 
* The meteor stub file of the extended handler
* for Jade in Meteor-Angular projects.
*
* @see {@link https://github.com/marcstark/meteor-angular-jade-extended.git}
* @license MIT
*/
if (Meteor.isServer) {

// *****************************************************************************
// Includes and requires
// *****************************************************************************

var path    = Npm.require('path');
var fs      = Npm.require('fs');

// *****************************************************************************
// Global vars
// *****************************************************************************

/**
 * String for mocks directory.
 * 
 * @type {String}
 */
var __strMocksDirName = 'tests/mocks/';

// *****************************************************************************
// Plugin stubs
// *****************************************************************************

/**
 * Override stub of Meteor "Plugin" symbol.
 *
 * @type {Class}
 */
var Plugin = function() {};

// *****************************************************************************

/**
 * Override stub of "registerCompiler" method of the Meteor "Plugin" symbol.
 * 
 * @param  {Object}   objOptions  object of given options from plugin
 * @param  {Function} startup     startup function called immediately
 */
Plugin.registerCompiler = function(objOptions, startup) {
    Plugin.arrExtensions = objOptions.extensions || null;
    Plugin.objCompiler   = startup();
};

// *****************************************************************************

/**
 * Startup function to process one file at a time, but
 * pretending it to be an array of files, which will then
 * given as argument to the "processFilesForTarget" method
 * of the "Plugin" symbol.
 * 
 * @param  {String} strFileName  string of the file name to be processed
 * @return {Array}               array of processed file to be used in test
 */
Plugin.processFile = function(strFileName) {

    // create files stub with given file name
    var arrFiles = [_stubFileObject(strFileName)];

    // call file processor
    Plugin.objCompiler.processFilesForTarget(arrFiles);

    return arrFiles;
};

// *****************************************************************************
// Publish to global name space
// *****************************************************************************

// Add "Plugin" stub to global namespace, overriding meteors original.
// Since I could not find any method to inject Meteor's compiling process (yet),
// I had to stub the "Plugin" symbol.
global.Plugin = Plugin;

// *****************************************************************************

}

// *****************************************************************************
// Helper functions
// *****************************************************************************

/**
 * Helper function to stub the given file. Add things like path and file content
 * to an object and use it as the file object given by Meteor's "Plugin" symbol
 * when calling "processFilesForTarget".
 * 
 * @param  {String} strMockFileName  string of mocked jade file to be tested
 * @return {Object}                  object as mocked file
 */
function _stubFileObject(strMockFileName) {
    var objFile                 = {};
    objFile.strBasename         = strMockFileName;
    objFile.strDirname          = path.join(__strMocksDirName);
    objFile.strPathInPackage    = path.join(objFile.strDirname, objFile.strBasename);
    objFile.strContent          = Assets.getText(objFile.strPathInPackage);
    objFile.arrHtml             = [];
    objFile.arrJavaScript       = [];
    objFile.getBasename         = function() { return this.strBasename; };
    objFile.getDirname          = function() { return this.strDirname; };
    objFile.getPathInPackage    = function() { return this.strPathInPackage; };
    objFile.getContentsAsString = function() { return this.strContent; };
    objFile.getArch             = function() { return 'web.browser'; };

    // final function to add HTML to result
    objFile.addHtml = function(objHtml) {
        this.arrHtml.push(objHtml);
    };

    // final function to add JavaScript to result
    objFile.addJavaScript = function(objJavaScript) {
        this.arrJavaScript.push(objJavaScript);
    };

    return objFile;
}

// *****************************************************************************
