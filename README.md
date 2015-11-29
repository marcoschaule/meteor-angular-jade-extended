Jade for Angular-Meteor
=======================

[![Meteor Icon](http://icon.meteor.com/package/marcstark:meteor-angular-jade-extended)](https://atmospherejs.com/marcstark/meteor-angular-jade-extended)

This [Meteor](https://www.meteor.com/) package provides some support for the
[Jade](http://jade-lang.com/) template engine in an Meteor-Angular environment.

It gives you the possibility

* to use Jade files ending on ```.jade``` with ```head```, ```body```,
    ```template``` or ```script``` tags adding each of them to either the
    corresponding tag in the parsed layout or to the Angular template cache,
* to use files ending on ```.ng.jade```, which will be added to
    the Angular template cache and
* to use files ending on ```.include.jade``` that will be ignored by
    the Jade compiler.

Regardless of which file extension you use, the compiler always replaces it with
the ```.html``` extension.



Table of contents
-----------------

* [Installation](#installation)
* [Usage](#usage)
    * [Using files ending on ```.jade```](#using-files-ending-on-jade)
    * [Using files ending on ```.ng.jade```](#using-files-ending-on-ngjade)
    * [Including files that end on ```.include.jade```](#including-files-that-end-on-includejade)
    * [Referring to the templates in Angular](#referring-to-the-templates-in-angular)
    * [Body Attributes](#body-attributes)
* [Todo](#todo)



Installation
------------

Meteor-Angular-Jade-Extended is installable from [atmosphere][atmosphere],
the meteor package system, by:

```sh
$ meteor add marcstark:meteor-angular-jade-extended
```



Usage
-----

### Using files ending on ```.jade```

If you create a file that ends on ```.jade```, you can - as root element - add

* one ```head``` tag,
* one ```body``` tag,
* multiple ```template(name="<template-name>")``` tags and
* multiple ```script(type="text/ng-template", id="<template-name>")``` tags

to the file. Doing so,

* the ```head``` tag will be added at the bottom of the
    main layout's ```head``` tag,
* the ```body``` tag will be added at the bottom of the
    main layout's ```body``` tag,
* the ```template``` and ```script``` tags will be added to Angular's
    template cache.

##### Example:

``` Jade
//- my-template.jade

//- will be added to the bottom of the main layout's "head"
head
    link(rel="stylesheet", href="/some/address/and/file.css")

//- will be added to the bottom of the main layout's "body"
body
    div(class="some-class-name-whatever")
        div(class="some-other-class-name-bla-bla")

//- will be added to Angular's template cache, and will be referred
//- to by "my-template.html" and "client/path/of/file/my-template.html"
//- (including ".html" - your choice)
script(type="text/ng-template", id="my-template.html")
    div(class="some-class-name-I-have-no-idea")

//- will be added to Angular's template cache, and will be referred
//- to by "my-template" and "client/path/of/file/my-template"
//- (no ".htm" necessary - your choice)
script(type="text/ng-template", id="my-template")
    div(class="some-class-name you-know-the-drill")
```

**Warning:** When using the ```template``` and ```script``` tags, you can omit
the ```.html``` in the template name. If you use the file extension ```.ng.jade```
as your file name though, the template name will definitely end on ```.html```.

### Using files ending on ```.ng.jade```

If you create a file that ends on ```.ng.jade```, the content of the file
will be added to Angular's tempalte cache, referable by either the
file name or the fill path including the file name.

##### Example:

``` Jade
//- my-template.ng.jade

//- will be added to Angular's template cache, and will be referred
//- to by "my-template.html" and "client/path/of/file/my-template.html"
//- (including ".html" necessary - NOT your choice)
div(class="come-on I-dont-know-what-to-write-anymore")
    div(class="bla bla bla")
```

### Including files that end on ```.include.jade```

If you create a file that ends on ```.include.jade```, this file is ignored
by the plugin and can be included by other Jade files. Including them in Jade
though, you have to use the full path and file name relative to the Meteor app's
route directory **including the ```.jade``` extension**.

##### Example:

``` Jade
//- client/lib/mixins/my-mixins.include.jade

//- define the mixin
mixin myMixin(strSomething)
    div #{strSomething}
```

``` Jade
//- client/components/something/my-template.jade

//- include the file
include client/lib/mixins/my-mixins.include.jade

//- use a mixin
div
    +myMixin('something')
```

### Referring to the templates in Angular

In Angular, from now on you can refer to the template file by using

* by using the ```<template-name>``` or
* by using the complete path ```path/to/the/<template-name>```.

Both versions are supported.

##### Example in view:

``` HTML
<!-- This works -->
<div ng-include="'my-template.html'"></div>

<!-- This works, too -->
<div ng-include="'client/components/something/my-template.html'"></div>
```

##### Example in UI-Router:

``` JavaScript
{ // This works
    'Controller' : 'MyCtrl as mv',
    'templateUrl': 'my-template.html'
}

{ // This works, too
    'Controller' : 'MyCtrl as mv',
    'templateUrl': 'client/components/something/my-template.html'
}
```

### Body Attributes

If you have attributes in your ```body``` tag, they will be added to the
main layout's ```body``` tag in the following way:

* All ```class``` attributes are combined to one class attribute.
    
    The files

    ``` Jade
    //- file1.jade
    body(class="file1")
        div(class="div-something1")
    ```
    
    and

    ``` Jade
    //- file2.jade
    body(class="file2")
        div(class="div-something2")
    ```

    will be combined to:

    ``` html
    <body class="file1 file2">
        <div class="somthing1"></div>
        <div class="somthing2"></div>
    </body>
    ```

* All other attributes are added to the body tag, at which already existing
    attributes are overridden by new ones with the same name. Attributes with
    prefixes like ```data-``` are still threaten as individual attributes. This
    may change in a later version.

    The files

    ``` Jade
    //- file1.jade
    body(ng-app="myApp", ng-cloak)
        div(class="div-something1")
    ```
    
    and

    ``` Jade
    //- file2.jade
    body(ng-app="myOtherApp", data-ng-cloak)
        div(class="div-something2")
    ```

    will be combined to:

    ``` html
    <body ng-app="myOtherApp" ng-cloak="ng-cloak" data-ng-cloak="data-ng-cloak">
        <div class="somthing1"></div>
        <div class="somthing2"></div>
    </body>
    ```

Todo
----

* Find out about possible negative consequences of saving the template HTML
    in an Angular constant and assigning this constant to the template cache
    in order to keep each template in memory only once. Does this work? Does
    it have any effect? Any side-effect?
* Test what happens if file name is ```<filename>.ng.jade```
    and file content is something like:

    ``` Jade
    template(name="some-template-name.html")
        div(class="some-class-name")
    ```
* Find a better way to integrate the Meteor parser to ```tinytest```
    in the tests of the package.
* Write tests for body attribtues.
* Implement code coverage and build tags.
* Implement ```standard-minifiers``` instead of ```html-minifiers``` package.
