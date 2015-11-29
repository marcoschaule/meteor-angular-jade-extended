/**
* marcstark:meteor-angular-jade-extended
* 
* The meteor test file of the extended handler
* for Jade in Meteor-Angular projects.
*
* @see {@link https://github.com/marcstark/meteor-angular-jade-extended.git}
* @license MIT
*/
if (Meteor.isServer) {

// *****************************************************************************
// Includes and requires
// *****************************************************************************

var cheerio = Npm.require('cheerio');

// *****************************************************************************
// Test startup
// *****************************************************************************

if (Meteor.isServer) {
    var objFileValid, objFileInvalid, objFileAngular, objFileInclude;

    // *****************************************************************************
    // Valid jade file
    // *****************************************************************************

    objFileValid = Plugin.processFile('jade-valid.jade')[0];

    // *****************************************************************************

    Tinytest.add('Test the valid jade mock file in general.', function(objTest) {

        // number of parsed items
        objTest.length(objFileValid.arrHtml, 2,
            'Length of parts added to HTML should be 2.');
        objTest.length(objFileValid.arrJavaScript, 2,
            'Length of parts added to JavaScript should be 2.');
    });

    // *****************************************************************************

    Tinytest.add('Test the valid jade mock file parsing the head tag.', function(objTest) {
        var $head = cheerio.load(objFileValid.arrHtml[0].data);

        // head item
        objTest.isNotUndefined($head,
            'Head item should not be undefined.');

        // head's child tag "base"
        objTest.isNotUndefined($head('base'),
            'Head item\'s child "base"\'s attributes should not be undefined.');
        objTest.isNotUndefined($head('base').attr('href'),
            'Head item\'s child "base"\'s first attribute\'s "href" should not be undefined.');
        objTest.equal($head('base').attr('href'), '/',
            'Head item\'s child "base"\'s first attribute\'s "href" should be equal to "/".');

        // head's child tag "link"
        objTest.isNotUndefined($head('link'), // link(href="no-actual-source")
            'Head item\'s child "link" should not be undefined.');
        objTest.isNotUndefined($head('link').attr('href'),
            'Head item\'s child "link"\'s first attribute\'s "href" should not be undefined.');
        objTest.equal($head('link').attr('href'), 'no-actual-source',
            'Head item\'s child "link"\'s first attribute\'s "href" should be equal to "no-actual-source".');
    });

    // *****************************************************************************

    Tinytest.add('Test the valid jade mock file parsing the body tag.', function(objTest) {
        var $body = cheerio.load(objFileValid.arrHtml[1].data);
        
        // body item
        objTest.isNotUndefined($body,
            'Body item should not be undefined.');
        
        // body's child tag "div"
        objTest.isNotUndefined($body('div'),
            'Body item\'s child "div"\'s attributes should not be undefined.');
        objTest.isNotUndefined($body('div').attr('class'),
            'Body item\'s child "div"\'s first attribute\'s "class" should not be undefined.');
        objTest.equal($body('div').attr('class'), 'container',
            'Body item\'s child "div"\'s first attribute\'s "class" should be equal to "container".');
        
        // body's child tag "div"'s child tag "div"
        objTest.isNotUndefined($body('div > div'),
            'Body item\'s child "div"\'s attributes should not be undefined.');
        objTest.isNotUndefined($body('div > div').attr('class'),
            'Body item\'s child "div > div"\'s first attribute\'s "class" should not be undefined.');
        objTest.equal($body('div > div').attr('class'), 'content',
            'Body item\'s child "div > div"\'s first attribute\'s "class" should be equal to "content".');
    });

    // *****************************************************************************

    Tinytest.add('Test the valid jade mock file parsing the template tag.', function(objTest) {
        var objHtml       = objFileValid.arrHtml[0];
        var objJavaScript = objFileValid.arrJavaScript[0];

        // template item
        objTest.isNotUndefined(objJavaScript,
            'Template item should not be undefined.');
        objTest.isNotUndefined(objJavaScript.data,
            'Template item\'s data field should not be undefined.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('template.html'") > 0,
            'Template item\'s data should contain template name without path.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('tests/mocks/template.html'") > 0,
            'Template item\'s data should contain template name with path.');

        // template item's child tag "div"
        objTest.isTrue(objJavaScript.data.match(/<div class="template-container">.*<\/div>/gi).length > 0,
            'Template item\'s child tag "div" should exist.');
    });

    // *****************************************************************************

    Tinytest.add('Test the valid jade mock file parsing the script tag.', function(objTest) {
        var objHtml       = objFileValid.arrHtml[0];
        var objJavaScript = objFileValid.arrJavaScript[1];

        // script item
        objTest.isNotUndefined(objJavaScript,
            'Script item should not be undefined.');
        objTest.isNotUndefined(objJavaScript.data,
            'Script item\'s data field should not be undefined.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('script.html'") > 0,
            'Script item\'s data should contain script name without path.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('tests/mocks/script.html'") > 0,
            'Script item\'s data should contain script name with path.');

        // script item's child tag "div"
        objTest.isTrue(objJavaScript.data.match(/<div class="script-container">.*<\/div>/gi).length > 0,
            'Script item\'s child tag "div" should exist.');
    });

    // *****************************************************************************
    // Jade Angular file
    // *****************************************************************************

    objFileAngular = Plugin.processFile('jade-valid.ng.jade')[0];

    // *****************************************************************************

    Tinytest.add('Test using "ng.jade" as file name.', function(objTest) {
        var objJavaScript = objFileAngular.arrJavaScript[0];

        // template general
        objTest.isTrue(objFileAngular.arrHtml.length <= 0,
            'Length of parts added to HTML should be 0.');
        objTest.isTrue(objFileAngular.arrJavaScript.length > 0,
            'Length of parts added to JavaScript should not be 0.');

        // template item
        objTest.isNotUndefined(objJavaScript,
            'Template item should not be undefined.');
        objTest.isNotUndefined(objJavaScript.data,
            'Template item\'s data field should not be undefined.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('jade-valid.html'") > 0,
            'Template item\'s data should contain template name without path.');
        objTest.isTrue(objJavaScript.data.indexOf("$templateCache.put('tests/mocks/jade-valid.html'") > 0,
            'Template item\'s data should contain template name with path.');

        // template item's child tag "div"
        objTest.isTrue(objJavaScript.data.match(/<div class="outer">.*<\/div>/gi).length > 0,
            'Template item\'s data\'s child tag "div" should exist.');
        objTest.isTrue(objJavaScript.data.match(/<div class="inner">.*<\/div>/gi).length > 0,
            'Template item\'s data\'s child\'s child tag "div" should exist.');
    });

    // *****************************************************************************
    // Jade include file
    // *****************************************************************************

    objFileInclude = Plugin.processFile('jade-valid.include.jade')[0];

    // *****************************************************************************

    Tinytest.add('Test using "include.jade" as file name.', function(objTest) {

        // template general
        objTest.isTrue(objFileInclude.arrHtml.length <= 0,
            'Length of parts added to HTML should be 0.');
        objTest.isTrue(objFileInclude.arrJavaScript.length <= 0,
            'Length of parts added to JavaScript should be 0.');
    });

    // *****************************************************************************
    // Invalid jade file
    // *****************************************************************************

    objFileInvalid = Plugin.processFile('jade-invalid.jade')[0];

    // *****************************************************************************

    Tinytest.add('Test the invalid jade mock file in general.', function(objTest) {

        // template general
        objTest.isTrue(objFileInvalid.arrHtml.length <= 0,
            'Length of parts added to HTML should be 0.');
        objTest.isTrue(objFileInvalid.arrJavaScript.length <= 0,
            'Length of parts added to JavaScript should be 0.');
    });

    // *****************************************************************************
}

// *****************************************************************************

}

// *****************************************************************************
