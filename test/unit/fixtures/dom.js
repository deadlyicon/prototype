var testVar = 'to be updated', testVar2 = '', documentViewportProperties;

Element.addMethods({
  hashBrowns: function(element) { return 'hash browns'; }
});

Element.addMethods("LI", {
  pancakes: function(element) { return "pancakes"; }
});

Element.addMethods("DIV", {
  waffles: function(element) { return "waffles"; }
});

Element.addMethods($w("li div"), {
  orangeJuice: function(element) { return "orange juice"; }
});


// PollFor tests
var preExistingElementFound = false;
Element.pollFor('#preExistingElement', function(){
  preExistingElementFound = true;
});

var noneExistingElementFound = noneExistingElementGaveup = false;
Element.pollFor('.none.existing.element',{
  onAvailable:  function(){
    noneExistingElementFound = true;
  },
  onGiveup: function(){
    noneExistingElementGaveup = true;
  }
});

var multiplePreExistingElementFound = multiplePreExistingElementGaveup = false;
Element.pollFor(['ul','ul li.one','ul li.two'],{
  onAvailable:  function(){
    multiplePreExistingElementFound = true;
  },
  onGiveup: function(){
    multiplePreExistingElementGaveup = true;
  }
});


var delayedElementFound = delayedElementFoundGaveup = false;
Element.pollFor(['ul.couting','ul.couting li.one','ul.couting li.two','ul.couting li.three'],{
  onAvailable:  function(){
    delayedElementFound = true;
  },
  onGiveup: function(){
    delayedElementFoundGaveup = true;
  }
});

document.observe('dom:loaded',function(){
  $$('ul.couting').first().appendChild(new Element('li').addClassName('three'));
});