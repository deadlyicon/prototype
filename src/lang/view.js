/** section: Language
 * class View
 *
 *  A class for sophisticated view templates in javascript.
 *
 *  Any time you have a group of similar objects and you need to produce
 *  formatted output for these objects, maybe inside a loop, you typically
 *  resort to concatenating string literals with the object's fields:
 *
 *     var comment = new View('<div class="comment"><=# comment #></div>');
 *     element.update(comment.evaluate({comment: 'you suck'}));
 *
 *  View is based on "Simple JavaScript Templating" by John Resig - http://ejohn.org/
 **/
var View = Class.create({
  /**
   *  new View(template)
   *
   *  Creates a View object.
  **/
  initialize: function(source){
    this.evaluate = new Function("obj",
      "var p=[],print=function(){p.push.apply(p,arguments);};" +

      // Introduce the data as local variables using with(){}
      "with(obj){p.push('" +

      // Convert the template into pure JavaScript
      source.toString()
        .replace(/[\r\t\n]/g, " ")
        .replace(/'(?=[^#]*#>)/g,"\t")
        .split("'").join("\\'")
        .split("\t").join("'")
        .replace(/<#=(.+?)#>/g, "',$1,'")
        .split(this.tag[0]).join("');")
        .split(this.tag[1]).join("p.push('")
      + "');}return p.join('');");
  },
  /**
   *  View#tag
   *  
   *  an array of the lest and right sides of the tag used in the view
   */
  tag: ['<%','%>'],
  /**
   *  View#evaluate(object) -> String
   *
   *  Applies the view to `object`'s data, producing a formatted string
   *  with symbols replaced by `object`'s corresponding properties.
  **/
  evaluate: Prototype.emptyFunction
});