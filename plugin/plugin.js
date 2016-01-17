/**
* marcstark:meteor-angular-jade-extended
* 
* The plugin file of the extended handler
* for Jade in Meteor-Angular projects.
*
* @see {@link https://github.com/marcstark/meteor-angular-jade-extended.git}
* @license MIT
*/
(function() { 'use strict'; 
/* jshint validthis:true */

// *****************************************************************************
// Includes
// *****************************************************************************

var minify  = Npm.require('html-minifier').minify;
var jade    = Npm.require('jade');
var path    = Npm.require('path');
var cheerio = Npm.require('cheerio');

// *****************************************************************************
// Local variables
// *****************************************************************************

/**
 * Local string to identify files ending on "ng.jade". These files are included
 * into the Angular template cache.
 * 
 * @type {String}
 */
var __strMatchNgJade = 'ng.jade';

/**
 * Local string to identify files ending on "include.jade". These files are
 * ignored since they should be included by other jade files.
 * 
 * @type {String}
 */
var __strMatchIncludeJade = 'include.jade';

/**
 * Local string to identify files ending on "jade". These files - the rest - are
 * included into the "body" section of the Meteor layout file.
 * 
 * @type {String}
 */
var __strMatchJade = 'jade';

/**
 * Jade compiling options. Contain file options to include jade files into other
 * jade files.
 * 
 * @type {Object}
 */
var __objJadeOptions = {
    basedir      : process.env.PWD,
    pretty       : true,
    compileDebug : false,
    filename     : path.join(process.env.PWD, 'index')
};

/**
 * Object of cheerio jQuery interpretation.
 * 
 * @type {Object}
 */
var $;

// *****************************************************************************
// Plug in register compiler
// *****************************************************************************

Plugin.registerCompiler({
        extensions: [__strMatchJade],
    }, function createCompiler() {
    
    return (new AngularJadeCompiler());
});

// *****************************************************************************
// Compiler class
// *****************************************************************************

/**
 * This is the Angular Jade compiler class function to be instantiated in
 * the compiler register method.
 * 
 * @class AngularJadeCompiler
 */
function AngularJadeCompiler() {}

// *****************************************************************************

/**
 * Prototype function to process files for target.
 * @memberof AngularJadeCompiler
 * 
 * @param {Array} arrFiles  array of files to be compiled
 */
AngularJadeCompiler.prototype.processFilesForTarget = function(arrFiles) {
    return arrFiles.forEach(_handleFile.call(this));
};

// *****************************************************************************
// Helper functions
// *****************************************************************************

/**
 * @function _handleFile
 * @private
 * 
 * Helper function to handle each file separately.
 *
 * @return {Function}  function handler to handle the file object
 */
function _handleFile() {
    var that = this;

    return function(objFile) {
        var strFileName;
        var strFilePath;
        var strFileContent;
        var strContentCompiled;
        var strContentMinified;
        var objContentMinified;
        var objHead;
        var strHead;
        var objBody;
        var strBody;
        var strBodyClasses;
        var objBodyAttrsRest;
        var objTemplates;
        var objScripts;
        
        // get file name and content and compile it
        strFileName    = objFile.getBasename();
        strFileContent = objFile.getContentsAsString().toString('utf8');

        // compile Jade
        strContentCompiled = _compileJade.call(that, strFileContent, strFileName);

        // if file ends on "include.jade"
        if (_isFileOfType(strFileName, __strMatchIncludeJade)) {
            return;
        }

        // if file ends on "ng.jade"
        else if (_isFileOfType(strFileName, __strMatchNgJade)) {
            strContentMinified = _minifyHtml.call(that, strContentCompiled);
            return _addHtmlToAngularTemplateCache.call(that, objFile, strContentMinified);
        }

        // get rid of more than one empty space, all new line and tabulator characters
        strContentCompiled = strContentCompiled
                .replace(/\s+/, ' ')
                .replace(/\t/, '')
                .replace(/\n/g, '')
                ;

        // load the compiled HTML into "cheerio" and let it look like jQuery
        $ = cheerio.load(strContentCompiled);

        // get DOM of head, body and template if available
        objHead      = $('head');
        objBody      = $('body');
        objTemplates = $('template[name]');
        objScripts   = $('script[type="text/ng-template"][id]');

        // Get strings of inner HTML of each of them but only if they are
        // root tags. Tags with a parent element are ignored since it is
        // invalid HTML anyway. Also, minify the strings.
        // Also, only the first head and body tag is considered.
        strHead = objHead && objHead[0] && !objHead[0].parent &&
                'function' === typeof objHead.html &&
                _minifyHtml.call(that, objHead.html());
        strBody = objBody && objBody[0] && !objBody[0].parent &&
                'function' === typeof objBody.html &&
                _minifyHtml.call(that, objBody.html());
        strBodyClasses = objBody &&
                'function' === typeof objBody.attr &&
                objBody.attr('class');
        objBodyAttrsRest = objBody && objBody[0] &&
                objBody[0].attribs;

        // remove "class" attribute
        if (objBodyAttrsRest && objBodyAttrsRest.class) {
            delete objBodyAttrsRest.class;
        }

        // handle each template and script separately
        var _templateHandler = _handleTemplate.call(that, objFile);
        objTemplates.each(_templateHandler);
        objScripts.each(_templateHandler);

        // otherwise add head and body to layout separately
        objContentMinified = {
            strHead          : strHead,
            strBody          : strBody,
            strBodyClasses   : strBodyClasses,
            objBodyAttrsRest: objBodyAttrsRest,
        };

        return _addHtmlToLayout.call(that, objFile, objContentMinified);
    };
}

// *****************************************************************************

/**
 * @function _handleTemplate
 * @private
 * 
 * Helper function to handle each template in a file separately.
 * 
 * @param  {Object} objFile  object of the current file.
 */
function _handleTemplate(objFile) {
    var that = this;

    // if cheerio's jquery is not defined, return an empty function.
    if (!$) {
        return function() {};
    }

    return function(numIndex, objTemplate) {
        var strTemplate, strTemplateName;
        var objTemplateWrapper = $(this);

        // Get strings of inner HTML of the template tag only if it is a
        // root tags. Tags with a parent element are ignored since it is
        // invalid HTML anyway. Also, minify the strings.
        // Also, only the first head and body tag is considered.
        strTemplate = objTemplate && !objTemplate.parent &&
                'function' === typeof objTemplateWrapper.html &&
                _minifyHtml.call(that, objTemplateWrapper.html());

        // Get the template name from the "id" attribute (if the template is a
        // "script" tag) or - if not available - from the "name" attribute (if
        // the template is a "template" tag).
        strTemplateName =
                (objTemplate.attribs && objTemplate.attribs.id) ||
                (objTemplate.attribs && objTemplate.attribs.name);

        // If there is a template in the jade file, parse it as if
        // the file ended in "ng.jade".
        if (strTemplate && strTemplateName) {
            _addHtmlToAngularTemplateCache.call(that, objFile, strTemplate, strTemplateName);
        }
    };
}

// *****************************************************************************

/**
 * @function _testFileType
 * @private
 * 
 * Helper function to compile the jade content and wrap it with an Angular
 * script tag eventually.
 * 
 * @param  {String}  strFileContent  string of file content to be compiled
 * @param  {String}  strFileName     string of file name
 * @return {String}                  string of compiled content
 */
function _compileJade(strFileContent) {
    return jade.compile(strFileContent.toString('utf8'), __objJadeOptions)({});
}

// *****************************************************************************

/**
 * @function _minifyHtml
 * @private
 * 
 * Helper function to minify the HTML content including the
 * inner HTML of Angular script tags.
 * 
 * @param  {String} strContent  string of content to be minified
 * @return {String}             string of result that is minified
 */
function _minifyHtml(strContent) {
    if (!strContent) {
        return null;
    }

    // escape single quotes in content
    strContent = strContent.replace(/'/g, "\\'");

    // minify content including the inner of Angular script tags
    var strResult = minify(strContent, {
        collapseWhitespace   : true,
        conservativeCollapse : true,
        removeComments       : true,
        minifyJS             : true,
        minifyCSS            : true,
        processScripts       : ['text/ng-template'],
    });

    // escape newline characters
    strResult.replace(/\n/g, '\\n');

    return strResult;
}

// *****************************************************************************

/**
 * @function _addHtmlToAngularTemplateCache
 * @private
 * 
 * Helper function to add the compiled and minified HTML as a Template to the
 * Angular Template cache.
 * 
 * @param {Object} objFile             object of the file that was compiled and minified
 * @param {String} strContentMinified  string of the compiled and minified content of the file
 * @param {String} [strTemplateName]   string of the name/path of the template (optional)
 */
function _addHtmlToAngularTemplateCache(objFile, strContentMinified, strTemplateName) {
    var strFilePath, strFileName, strFileNameEscaped, strVarName, strAngularTemplateCacheCommand;

    // If there is a name for the template, use the name.
    if (strTemplateName) {
        strFileName = strTemplateName;
        strFilePath = path.join(objFile.getDirname(), strTemplateName).replace(/\\/g, '/');
    }

    // Otherwise use the base name.
    else {
        strFileName = objFile.getBasename();
        strFileName = strFileName && strFileName.replace(__strMatchNgJade, 'html');
        strFilePath = objFile.getPathInPackage();
        strFilePath = strFilePath.replace(/\\/g, '/'); // replace back slashes (if necessary)
        strFilePath = strFilePath.replace(__strMatchNgJade, 'html');
    }

    // If file name or path is not set, return.
    if (!strFileName || !strFilePath) {
        return;
    }

    strFileNameEscaped = strFileName.replace(/[^a-zA-Z]/g, '_');
    strAngularTemplateCacheCommand = [
        "angular.module('angular-meteor')",
            ".constant('C_", strFileNameEscaped, "', '", strContentMinified, "')",
            ".run(['$templateCache', 'C_", strFileNameEscaped, "', function($templateCache, C_", strFileNameEscaped, ") { ",
                "$templateCache.put('", strFileName, "', C_", strFileNameEscaped, ");",
                "$templateCache.put('", strFilePath, "', C_", strFileNameEscaped, ");",
            "}]);",
    ].join('');

    objFile.addJavaScript({
        data       : strAngularTemplateCacheCommand,
        path       : strFilePath,
        sourcePath : objFile.getPathInPackage(),
    });

    // *************************************************************************

    // // delete everything except letters
    // strVarName = '__' + strFileName.replace(/[^a-zA-Z]+/g, '');

    // // Alternative:
    // strAngularTemplateCacheCommand = [
    //     "angular.module('angular-meteor').run(['$templateCache', function($templateCache) { ",
    //         "var ", strVarName, " = '", strContentMinified, "';",
    //         "$templateCache.put('", strFileName, "', ", strVarName , ");",
    //         "$templateCache.put('", strFilePath, "', ", strVarName , ");",
    //     "}]);",
    // ].join('');
}

// *****************************************************************************

/**
 * @function _addHtmlToLayout
 * @private
 * 
 * Helper function to add the final HTML to the file object.
 * 
 * @param {Object} objFile                              object of file the HTML will be added to
 * @param {Object} objContentMinified                   object of compiled and minified content
 * @param {String} objContentMinified.strHead           string of the compiled and minified HTML head
 * @param {String} objContentMinified.strBody           string of the compiled and minified HTML body
 * @param {String} objContentMinified.strBodyClasses    string of the body's class attribute
 * @param {String} objContentMinified.objBodyAttrsRest  string of the body's attributes other than "class"
 */
function _addHtmlToLayout(objFile, objContentMinified) {
    var strFilePath, strJavaScript = '';

    // if "jade" files are not in web targets, aboard
    if (objFile.getArch().indexOf('web.browser') < 0) {
            console.log('\n');
            console.log('WARNING from package "marcstark:meteor-angular-jade-extended":' + '\n');
            console.log([
                    'Document sections can only be emitted to web targets. ',
                    'This error appears if you use ".jade" files outside ',
                    'of the web target arch. ',
                    'To avoid this, move all ".jade" files into the "client" ',
                    'folder or corresponding sub-folders.'
                ].join('') + '\n');
            return;
        }

    if (objContentMinified.strHead) {
        objFile.addHtml({
            section : 'head',
            data    : objContentMinified.strHead,
        });
    }

    if (objContentMinified.strBody) {
        objFile.addHtml({
            section : 'body',
            data    : objContentMinified.strBody,
        });
    }

    if (objContentMinified.strBody && objContentMinified.strBodyClasses) {
        strJavaScript += [
            "$('body').addClass('", objContentMinified.strBodyClasses , "');"
        ].join('');
    }

    if (objContentMinified.strBody && objContentMinified.objBodyAttrsRest) {
        strJavaScript += [
            "$('body').attr(", JSON.stringify(objContentMinified.objBodyAttrsRest) , ");",
        ].join('');
    }

    if (objContentMinified.strBody && (objContentMinified.strBodyClasses || objContentMinified.objBodyAttrsRest)) {
        strFilePath   = objFile.getPathInPackage();
        strFilePath   = strFilePath.replace(/\\/g, '/'); // replace back slashes (if necessary)
        strFilePath   = strFilePath.replace(__strMatchNgJade, 'html');
        strJavaScript = ["Meteor.startup(function() { ", strJavaScript, " });"].join('');

        objFile.addJavaScript({
            path: strFilePath,
            data: strJavaScript,
        });
    }
}

// *****************************************************************************

/**
 * @function _isFileOfType
 * @private
 * 
 * Helper function to test whether a given file name is type of a given
 * extension or not.
 * 
 * @param {String} strFileName   string of name of file to be compiled
 * @param {String} strExtension  string of the extension to test the file for
 */
function _isFileOfType(strFileName, strExtension) {
    var regexIdentification = new RegExp(strExtension + '$', 'gi');
    var isExtension         = !!regexIdentification.test(strFileName);

    return isExtension;
}

// *****************************************************************************

})();
