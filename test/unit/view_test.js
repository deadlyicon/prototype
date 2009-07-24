new Test.Unit.Runner({
  testViewEvaluation: function(){
    var template = new View('<tr><td><%= name %></td><td><%= age %></td></tr>');
    
    this.assertEqual('<tr><td>Sam</td><td>21</td></tr>',
      template.evaluate({name: 'Sam', age: 21}));
    this.assertEqual('<tr><td></td><td></td></tr>',
      template.evaluate({name: '', age: ''}));
  },
  testViewWithDifferentTagEvaluation: function(){
    var template = new View('<tr><td><#= name #></td><td><#= age #></td></tr>','#');
    
    this.assertEqual('<tr><td>Sam</td><td>21</td></tr>',
      template.evaluate({name: 'Sam', age: 21}));
    this.assertEqual('<tr><td></td><td></td></tr>',
      template.evaluate({name: '', age: ''}));
  }
})