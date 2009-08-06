/** section: Language
 * class Function
 *
 *  Extensions to the built-in `Function` object.
**/
Object.extend(Function.prototype, (function() {
  var slice = Array.prototype.slice;

  function update(array, args) {
    var arrayLength = array.length, length = args.length;
    while (length--) array[arrayLength + length] = args[length];
    return array;
  }

  function merge(array, args) {
    array = slice.call(array, 0);
    return update(array, args);
  }

  /**
   *  Function#argumentNames() -> Array
   *
   *  Reads the argument names as stated in the function definition and returns
   *  the values as an array of strings (or an empty array if the function is
   *  defined without parameters).
  **/
  function argumentNames() {
    var names = this.toString().match(/^[\s\(]*function[^(]*\(([^)]*)\)/)[1]
      .replace(/\/\/.*?[\r\n]|\/\*(?:.|[\r\n])*?\*\//g, '')
      .replace(/\s+/g, '').split(',');
    return names.length == 1 && !names[0] ? [] : names;
  }

  /**
   *  Function#bind(object[, args...]) -> Function
   *  - object (Object): The object to bind to.
   *
   *  Wraps the function in another, locking its execution scope to an object
   *  specified by `object`.
  **/
  function bind(context) {
    if (arguments.length < 2 && Object.isUndefined(arguments[0])) return this;
    var __method = this, args = slice.call(arguments, 1);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(context, a);
    };
  }

  /** related to: Function#bind
   *  Function#bindAsEventListener(object[, args...]) -> Function
   *  - object (Object): The object to bind to.
   *
   *  An event-specific variant of [[Function#bind]] which ensures the function
   *  will recieve the current event object as the first argument when
   *  executing.
  **/
  function bindAsEventListener(context) {
    var __method = this, args = slice.call(arguments, 1);
    return function(event) {
      var a = update([event || window.event], args);
      return __method.apply(context, a);
    };
  }

  /**
   *  Function#curry(args...) -> Function
   *  Partially applies the function, returning a function with one or more
   *  arguments already "filled in."
   *
   *  Function#curry works just like [[Function#bind]] without the initial
   *  scope argument. Use the latter if you need to partially apply a function
   *  _and_ modify its execution scope at the same time.
  **/
  function curry() {
    if (!arguments.length) return this;
    var __method = this, args = slice.call(arguments, 0);
    return function() {
      var a = merge(args, arguments);
      return __method.apply(this, a);
    };
  }

  /**
   *  Function#delay(seconds[, args...]) -> Number
   *  - seconds (Number): How long to wait before calling the function.
   *
   *  Schedules the function to run after the specified amount of time, passing
   *  any arguments given.
   *
   *  Behaves much like `window.setTimeout`. Returns an integer ID that can be
   *  used to clear the timeout with `window.clearTimeout` before it runs.
   *
   *  To schedule a function to run as soon as the interpreter is idle, use
   *  [[Function#defer]].
  **/
  function delay(timeout) {
    var __method = this, args = slice.call(arguments, 1);
    timeout = timeout * 1000;
    return window.setTimeout(function() {
      return __method.apply(__method, args);
    }, timeout);
  }

  /**
   *  Function#defer(args...) -> Number
   *  Schedules the function to run as soon as the interpreter is idle.
   *
   *  A "deferred" function will not run immediately; rather, it will run as soon
   *  as the interpreter's call stack is empty.
   *
   *  Behaves much like `window.setTimeout` with a delay set to `0`. Returns an
   *  ID that can be used to clear the timeout with `window.clearTimeout` before
   *  it runs.
  **/
  function defer() {
    var args = update([0.01], arguments);
    return this.delay.apply(this, args);
  }

  /**
   *  Function#deferErrors(args...) -> Number
   *  Schedules the function to run as soon as the interpreter is idle.
   *
   *  A "deferred" function will not run immediately; rather, it will run as soon
   *  as the interpreter's call stack is empty.
   *
   *  Behaves much like `window.setTimeout` with a delay set to `0`. Returns an
   *  ID that can be used to clear the timeout with `window.clearTimeout` before
   *  it runs.
  **/
  function deferErrors() {
    try{
      return this.apply(this, arguments);
    }catch(e){
      (function(){ throw e; }).defer();
    }
  }

  /**
   *  Function#wrap(wrapperFunction) -> Function
   *  - wrapperFunction (Function): The function to act as a wrapper.
   *
   *  Returns a function "wrapped" around the original function.
   *
   *  `Function#wrap` distills the essence of aspect-oriented programming into
   *  a single method, letting you easily build on existing functions by
   *  specifying before and after behavior, transforming the return value, or
   *  even preventing the original function from being called.
  **/
  function wrap(wrapper) {
    var __method = this;
    return function() {
      var a = update([__method.bind(this)], arguments);
      return wrapper.apply(this, a);
    };
  }

  /**
   *  Function#append(wrapperFunction) -> Function
   *  - appendingFunction (Function): The function to be appended onto this function.
   *
   *  Returns a function that executes the original function and then the given
   *  function with the same arguments.
   *
   *  Note. The function returns the return value of Function1 or if not returned then 
   *  Function2's return value is returned.
  **/
  function append(__method2){
    var __method = this;
    return function() {
        var __return = __method.apply(this, arguments);
        __method2.apply(this, arguments);
        return __return;
    };
  };

  /**
   *  Function#methodize() -> Function
   *  Wraps the function inside another function that, at call time, pushes
   *  `this` to the original function as the first argument.
   *
   *  Used to define both a generic method and an instance method.
  **/
  function methodize() {
    if (this._methodized) return this._methodized;
    var __method = this;
    return this._methodized = function() {
      var a = update([this], arguments);
      return __method.apply(null, a);
    };
  }

  /**
   *  Function#selfDestruct() -> Function
   *  Wraps the function inside another function that only allows
   *  the original function to be called once. All subsquent calls
   *  return undefined
   *
   *  Used to define both a generic method and an instance method.
  **/
  function selfDestruct(){
    var __method = this,
        __method_has_run = false;

    return function(){
      if (__method_has_run) return;
      __method_has_run = true;
      return __method.apply(this,arguments);
    };
  };

  /**
   *  Function#ensureExecutionIn(milliseconds) -> Function
   *  Wraps the function inside another function that ensures the
   *  original function is called if nothing else calls it within
   *  the given millseconds
   *
   *  Used to define a callback handler that is gauranteed to be called eventually
  **/
  function ensureExecutionIn(seconds){
    var __method = this.selfDestruct();

    var __methodTimeout = function(){
      return __method.apply(this,arguments);
    }.delay(seconds);

    return function(){
      window.clearTimeout(__methodTimeout);
      return __method.apply(this,arguments);
    };
  };


 return {
    argumentNames:       argumentNames,
    bind:                bind,
    bindAsEventListener: bindAsEventListener,
    curry:               curry,
    delay:               delay,
    deferErrors:         deferErrors,
    defer:               defer,
    wrap:                wrap,
    append:              append,
    methodize:           methodize,
    selfDestruct:        selfDestruct,
    ensureExecutionIn:   ensureExecutionIn
  };
})());

