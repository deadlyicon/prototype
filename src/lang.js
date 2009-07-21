/**
 * == Language ==
 * Additions to JavaScript's "standard library" and extensions to
 * built-in JavaScript objects.
**/

var Abstract = { };

/** section: Language
 * Try
**/

/**
 *  Try.these(function...) -> ?
 *  - function (Function): A function that may throw an exception.
 *
 *  Accepts an arbitrary number of functions and returns the result of the
 *  first one that doesn't throw an error.
 **/
var Try = {
  these: function() {
    var returnValue;

    for (var i = 0, length = arguments.length; i < length; i++) {
      var lambda = arguments[i];
      try {
        returnValue = lambda();
        break;
      } catch (e) { }
    }

    return returnValue;
  }
};

/**
 *  returning(object, function) -> Object
 *  - object (Object): The object to be returned.
 *  - function (Function): the block to be exectued.
 *  - object (Object): The object to be returned.
 *
 *  Always returns the object no matter what the return value of the block is.
 *  The object is passed as the first and only argument to the block.
 *
 *     function handler(response){
 *       returning(response,function(response){
 *         ...
 *       },this);
 *     }
 *
 *
 **/
var returning = function returning(returnValue, block, context){
 block.bind(context || returnValue)(returnValue);
 return returnValue;
};

//= require "lang/class"
//= require "lang/object"
//= require "lang/function"
//= require "lang/date"
//= require "lang/regexp"
//= require "lang/periodical_executer"
//= require "lang/string"
//= require "lang/template"
//= require "lang/view"
//= require "lang/enumerable"
//= require "lang/array"
//= require "lang/hash"
//= require "lang/number"
//= require "lang/range"
//= require "lang/pathname"
//= require "lang/observable"