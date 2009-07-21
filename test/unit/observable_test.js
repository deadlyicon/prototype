new Test.Unit.Runner({
  // test firing an event and observing it on the element it's fired from
  testEventFiring: function() {
    var test = this,
        cat = new Voyeur,
        fired = false,
        burger = new String('CHEEEZEBURGER'),
        observer = function(theCat, cheeezeBurger) {
          test.assertIdentical(cat,this);
          test.assertIdentical(cat,theCat);
          test.assertIdentical(burger,cheeezeBurger);
          fired = true;
        };

    cat.observe('hazCheeezeBurger',observer);
    cat.fire('hazCheeezeBurger',burger);
    this.assert(fired);

    fired = false;
    cat.fire("noCanHazCheeezeBurger");
    this.assert(!fired);

    cat.stopObserving('hazCheeezeBurger',observer);
    cat.fire('hazCheeezeBurger',burger);
    this.assert(!fired);
  },
});