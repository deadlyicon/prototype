/* Based on Alex Arnell's inheritance implementation. */

/** section: Language
 * Class
 *
 *  Manages Prototype's class-based OOP system.
 *
 *  Refer to Prototype's web site for a [tutorial on classes and
 *  inheritance](http://prototypejs.org/learn/class-inheritance).
**/
var Class = (function() {
  /**
   *  Class.create([superclass][, methods...]) -> Class
   *    - superclass (Class): The optional superclass to inherit methods from.
   *    - methods (Object): An object whose properties will be "mixed-in" to the
   *        new class. Any number of mixins can be added; later mixins take
   *        precedence.
   *
   *  Creates a class.
   *
   *  Class.create returns a function that, when called, will fire its own
   *  `initialize` method.
   *
   *  `Class.create` accepts two kinds of arguments. If the first argument is
   *  a `Class`, it's treated as the new class's superclass, and all its
   *  methods are inherited. Otherwise, any arguments passed are treated as
   *  objects, and their methods are copied over as instance methods of the new
   *  class. Later arguments take precedence over earlier arguments.
   *
   *  If a subclass overrides an instance method declared in a superclass, the
   *  subclass's method can still access the original method. To do so, declare
   *  the subclass's method as normal, but insert `$super` as the first
   *  argument. This makes `$super` available as a method for use within the
   *  function.
   *
   *  To extend a class after it has been defined, use [[Class#addMethods]].
  **/
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      if (this.initialize) return this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      if (!parent.subclasses) parent.subclasses = [];
      if (!parent.addClassMethods) Object.extend(parent, Class.Methods);
      subclass.prototype = parent.prototype;
      klass.prototype = new subclass;
      parent.subclasses.push(klass);
      parent.addClassMethods();
    }else{
      Object.extend(klass, Class.Methods);
    }

    for (var i = 0; i < properties.length; i++)
      klass.addMethods(properties[i]);

    if (!klass.prototype.initialize)
      klass.prototype.initialize = Prototype.emptyFunction;

    klass.prototype.constructor = klass;
    return klass;
  }

  /**
   *  Class#addInstanceMethods(methods) -> Class
   *    - methods (Object): The instance methods to add to the class.
   *
   *  Adds instance methods to an existing class.
   *
   *  `Class#addInstanceMethods` is a method available on classes that have been
   *  defined or extended from with `Class.create`. It can be used to add new 
   *  instance methods to that class, or overwrite existing methods, after the 
   *  class has been defined.
   *
   *  New methods propagate down the inheritance chain. If the class has
   *  subclasses, those subclasses will receive the new methods &mdash; even in the
   *  context of `$super` calls. The new methods also propagate to instances of
   *  the class and of all its subclasses, even those that have already been
   *  instantiated.
  **/
  function addInstanceMethods(source) {
    var ancestor   = this.superclass && this.superclass.prototype;
    var properties = Object.keys(source);

    // IE6 doesn't enumerate toString and valueOf properties,
    // Force copy if they're not coming from Object.prototype.
    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    for (var i = 0, length = properties.length; i < length; i++) {
      var property = properties[i], value = source[property];
      if (ancestor && Object.isFunction(value) &&
          value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }
      this.prototype[property] = value;
    }

    return this;
  }
  
  /**
   *  Class#addClassMethods(methods) -> Class
   *    - methods (Object): The class methods to add to the class.
   *
   *  Adds class methods to an existing class.
   *
   *  `Class#addClassMethods` is a method available on classes that have been
   *  defined or extended from with `Class.create`. It can be used to add new 
   *  class methods to that class, or overwrite existing methods, after the 
   *  class has been defined.
   *
   *  New methods are coppied to subclasses if the subclass simulating the native
   *  inheritance chain. If the class has subclasses, those subclasses will 
   *  receive the new methods &mdash; even in the context of `$super` calls.
  **/
  function addClassMethods(source){
    var source = source || this,
        destination = this,
        refresh = this == source,
        ancestor = this.superclass,
        properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }
    
    // this needs to be changed to
    // clone this
    // update this
    // update subclasses

    for (var p = properties.length - 1; p >= 0; p--){
      var property = properties[p], value = source[property];

      if (!refresh && ancestor && Object.isFunction(value) && value.argumentNames().first() == "$super") {
        var method = value;
        value = (function(m) {
          return function() { return ancestor[m].apply(this, arguments); };
        })(property).wrap(method);

        value.valueOf = method.valueOf.bind(method);
        value.toString = method.toString.bind(method);
      }

      for (var s = this.subclasses.length - 1; s >= 0; s--){
        var subclass = this.subclasses[s];
        if (!(property in subclass) || subclass[property] === this[property])
          subclass[property] = value;
      };

      if (!refresh) this[property] = value;
    };

    return this;
  };
  
  function apply(klass, a){
    if (typeof a == 'undefined' || !(a instanceof Array))
      throw new TypeError("second argument to Class.apply must be an array");
    return eval(
      'new klass('+
      a.map(function(v,i){ return 'a['+i+']'; }).join(',')+
      ')'
    );
  }

  return {
    create: create,
    apply:  apply,
    Methods: {
      extend:             addClassMethods,
      include:            addInstanceMethods,
      addClassMethods:    addClassMethods,
      addInstanceMethods: addInstanceMethods,
      addMethods:         addInstanceMethods  //DEPRECIATED
    }
  };
})();