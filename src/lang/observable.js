/** section: Language
 * mixin Observable
 *
 *  `Enumerable` provides a observe and fire methods that enable your class
 *  to use event hooks in the same way DOM elements do.
 *
 *  `Enumerable` is a _mixin_: a set of methods intended not for standaone
 *  use, but for incorporation into other objects.
 *
 *      var Frog = Class.create(Observable);
 *      var f = new Frog;
 *      f.observe('jump', function(frog, height){ ... });
 *      f.fire('jump', 14.3);
 **/
var Observable = (function() {

  /**
   *  object.observe(eventName, handler) -> Element
   *
   *  Registers an event handler onto a javascript object
  **/
  function observe(eventName, handler){
    eventName = eventName.toString();
    this._eventHandlers || (this._eventHandlers = {});
    this._eventHandlers[eventName] || (this._eventHandlers[eventName] = []);
    this._eventHandlers[eventName].push(handler);
    return this;
  }

  /**
   *  object.observeOnce(eventName, handler) -> Element
   *
   *  Registers an event handler that only executes once
  **/
  function observeOnce(eventName, handler){
    var __observer = function selfStoppingObserver(){
      this.stopObserving(eventName, __observer);
      return handler.apply(this, arguments);
    }.bind(this);
    this.observe(eventName, __observer);
    return this;
  }

  /**
   *  object.stopObserve(eventName, handler) -> Element
   *
   *  UnRegisters an event handler onto a javascript object
  **/
  function stopObserving(eventName, handler){
    returning(this, function(){
      eventName = eventName.toString();
      if (!this._eventHandlers || !this._eventHandlers[eventName]) return;
      this._eventHandlers[eventName] = this._eventHandlers[eventName].without(handler);
    });
  }

  /**
   *  object.fire(eventName[, memo]) -> Event
   *  - memo (?): Metadata for the event. Will be passed to the observer
   *    along with a reference to `this`
   *
   *  Fires a custom event of name `eventName` with `object` as its target.
   *

  **/
  function fire(eventName, memo){
    var memo = $A(arguments), eventName = memo.shift(), handlers;
    memo.unshift(this);
    if (this._eventHandlers && (handlers = this._eventHandlers[eventName]))
      for (var i=0; i < handlers.length; i++)
        if (Object.isFunction(handlers[i]))
          try{ handlers[i].apply(this, memo); }
          catch(e){ (function() { throw e; }).defer(); }
    return this;
  }


  return {
    observe:       observe,
    observeOnce:   observeOnce,
    observeNext:   observeOnce,
    stopObserving: stopObserving,
    fire:          fire
  };

})();