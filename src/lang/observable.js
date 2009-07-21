/** section: Language
 * mixin Observable
 *
 *  `Enumerable` provides a observe and fire methods that enable your class
 *  to use event hooks in the same way DOM elements do.
 *
 *  `Enumerable` is a _mixin_: a set of methods intended not for standaone
 *  use, but for incorporation into other objects.
 *
 *      var myClass = Class.create(Observable,{..})
 *      new myClass()
 *        .observe('born',function(event){..})
 *        .fire('born',memo);
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
   *  object.fire(element, eventName[, memo]) -> Event
   *  - memo (?): Metadata for the event. Will be accessible through the
   *    event's `memo` property.
   *
   *  Fires a custom event of name `eventName` with `element` as its target.
  **/
  function fire(eventName){
    var memo = $A(arguments), eventName = memo.shift();
    memo.unshift(this);
    returning(this, function(){
      if (!this._eventHandlers || !this._eventHandlers[eventName]) return;
      this._eventHandlers[eventName].each(function(handler) {
        if (Object.isFunction(handler)) handler.apply(this, memo);
      },this);
    });
  }

  return {
    observe:       observe,
    stopObserving: stopObserving,
    fire:          fire
  };

})();