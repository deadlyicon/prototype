var id, found, givenup;
function assertElementFound(){
  console.log('Asserting not found',found,givenup);
  this.assert(found, id+" was not found");
  this.assert(!givenup, "polling for "+id+" gave up");
  this.assert($(id), id+" doesnt exist but should");
}
function assertElementNotFound(){
  console.log('asserting found',found,givenup);
  this.assert(!found, id+" was found");
  this.assert(givenup, "polling for "+id+" didn't give up");
  this.assert(!$(id), id+" exists but was not found");
}
function createElement(){
  console.log('creating '+id);
  document.body.appendChild(new Element('div',{id:id}));
}
function onAvailable(element){
  console.log('onAvail run', id);
  this.assertIdentical($(id), element);
  found = true;
}
function onGivenup(){
  console.log('onGivenup run', id);
  givenup = true;
}
new Test.Unit.Runner({
  setup: function() {

  },
  testElementPollForFindsElementWhenElementAlreadyExists: function(){
    id = 'albert'; found = false;
    createElement()
    Element.pollFor(id, onAvailable.bind(this));
    assertElementFound.bind(this)();    
  },
  testElementPollForGivesupWhenElementDoesntExist: function(){
    id = 'sampson'; found = givenup = false;
    Element.pollFor(id, {
      giveUpAfter: 100,
      onAvailable: onAvailable.bind(this),
      onGivenup:   onGivenup.bind(this)
    });
    this.wait(110, assertElementNotFound);
  },
  testElementPollForFindsElementWhenRunBeforeElementExists: function(){
    id = 'paul'; found = givenup = false;
    Element.pollFor(id, {
      giveUpAfter: 500,
      onAvailable: onAvailable.bind(this),
      onGivenup:   onGivenup.bind(this)
    });
    this.wait(100, function(){
      console.log('B4',found,givenup);
      createElement();
      console.log('A',found,givenup);
      this.wait(700, assertElementFound);
    });
  }
});