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
   *  `Class.create` creates a class and returns a constructor function for
   *  instances of the class. Calling the constructor function (typically as
   *  part of a `new` statement) will invoke the class's `initialize` method.
   *
   *  `Class.create` accepts two kinds of arguments. If the first argument is
   *  a `Class`, it's used as the new class's superclass, and all its methods
   *  are inherited. Otherwise, any arguments passed are treated as objects,
   *  and their methods are copied over ("mixed in") as instance methods of the
   *  new class. In cases of method name overlap, later arguments take
   *  precedence over earlier arguments.
   *
   *  If a subclass overrides an instance method declared in a superclass, the
   *  subclass's method can still access the original method. To do so, declare
   *  the subclass's method as normal, but insert `$super` as the first
   *  argument. This makes `$super` available as a method for use within the
   *  function.
   *
   *  To extend a class after it has been defined, use [[Class#addMethods]].
   *
   *  For details, see the
   *  [inheritance tutorial](http://prototypejs.org/learn/class-inheritance)
   *  on the Prototype website.
  **/
  var allClasses = [];
  function subclass() {};
  function create() {
    var parent = null, properties = $A(arguments);
    if (Object.isFunction(properties[0]))
      parent = properties.shift();

    function klass() {
      if (this.initialize) return this.initialize.apply(this, arguments);
    }

    Object.extend(klass, Class.Methods);
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
    allClasses.push(klass);
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
   *  subclasses, those subclasses will receive the new methods &mdash; even in
   *  the context of `$super` calls. The new methods also propagate to instances
   *  of the class and of all its subclasses, even those that have already been
   *  instantiated.
   *
   *  <h5>Examples</h5>
   *
   *      var Animal = Class.create({
   *        initialize: function(name, sound) {
   *          this.name  = name;
   *          this.sound = sound;
   *        },
   *
   *        speak: function() {
   *          alert(this.name + " says: " + this.sound + "!");
   *        }
   *      });
   *
   *      // subclassing Animal
   *      var Snake = Class.create(Animal, {
   *        initialize: function($super, name) {
   *          $super(name, 'hissssssssss');
   *        }
   *      });
   *
   *      var ringneck = new Snake("Ringneck");
   *      ringneck.speak();
   *
   *      //-> alerts "Ringneck says: hissssssss!"
   *
   *      // adding Snake#speak (with a supercall)
   *      Snake.addMethods({
   *        speak: function($super) {
   *          $super();
   *          alert("You should probably run. He looks really mad.");
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck says: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
   *
   *      // redefining Animal#speak
   *      Animal.addMethods({
   *        speak: function() {
   *          alert(this.name + 'snarls: ' + this.sound + '!');
   *        }
   *      });
   *
   *      ringneck.speak();
   *      //-> alerts "Ringneck snarls: hissssssss!"
   *      //-> alerts "You should probably run. He looks really mad."
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
        ancestor = this.superclass,
        subclasses = (this === Class.Methods) ? allClasses : this.subclasses,
        original = Object.clone(this),
        properties = Object.keys(source);

    if (!Object.keys({ toString: true }).length) {
      if (source.toString != Object.prototype.toString)
        properties.push("toString");
      if (source.valueOf != Object.prototype.valueOf)
        properties.push("valueOf");
    }

    if (this !== source || this !== Class.Methods){
      for (var p = 0; p < properties.length; p++){
        var property = properties[p], value = source[property];

        if (ancestor && Object.isFunction(value) && value.argumentNames().first() == "$super") {
          var method = value;
          value = (function(m) {
            return function() { return ancestor[m].apply(this, arguments); };
          })(property).wrap(method);

          value.valueOf = method.valueOf.bind(method);
          value.toString = method.toString.bind(method);
        }

        this[property] = value;
      };
    };

    // foreach subclass
    for (var s = 0; s < subclasses.length; s++){
      var subclass = subclasses[s], updates = {};
      // find updatable properties
      for (var p = 0; p < properties.length; p++){
        var property = properties[p], value = this[property];
        // if the destination class's property value is idential to it superclass or undefined
        if (!(property in subclass) || subclass[property] === original[property])
          updates[property] = value;
      };
      subclass.addClassMethods(updates);
    }

    return this;
  }

  function curry(){
    if (!arguments.length) return this;
    return Class.create(this, {
      initialize: Function.prototype.curry.apply(this.prototype.initialize,arguments)
    });
  }

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
      curry:              curry,
      extend:             addClassMethods,
      include:            addInstanceMethods,
      addClassMethods:    addClassMethods,
      addInstanceMethods: addInstanceMethods,
      addMethods:         addInstanceMethods  //DEPRECIATED
    }
  };
})();