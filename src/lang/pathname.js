/** section: Language
 * class Pathname
 *
 *  A class for sophisticated pathname modification.
 *
 *      new Pathname('/games/photos/').join('/expired');
 *      // -> "#<Pathname:/games/photos/expired>"
**/
var Pathname = Class.create(String,{
  /**
   *  new Pathname(path)
   *
   *  Creates a Pathname object.
  **/
  initialize: function(value) {
    this.valueOf = String.prototype.valueOf.bind(value);
    this.toString = String.prototype.toString.bind(value);
  },
  /**
   *  Pathname#inspect -> String
  **/
  inspect: function inspect(){ return '#<Pathname:'+this+'>'; },
  /**
   *  Pathname#join(pathname) -> Pathname
   *
   *  Returns a new Pathname formed by joining this pathname to the
   *  given pathname
  **/
  join: function join(pathname){
    return this.constructor.join(this,pathname);
  },
  /**
   *  Pathname#isRoot() -> Boolean
   *
   *  Determines whether the pathname is /
  **/
  isRoot: function isRoot(){ return this == '/'; },
  /**
   *  Pathname#isRoot() -> Boolean
   *
   *  Determines whether the pathname is an absolute path
  **/
  isAbsolute: function(){ return this.startsWith('/'); },
  /**
   *  Pathname#isRoot() -> Boolean
   *
   *  Determines whether the pathname is a relative path
  **/
  isRelative: function(){ return !this.isAbsolute(); }
});

Object.extend(Pathname,(function() {

  /**
   *  Pathname#join(pathname) -> Pathname
   *
   *  Returns a new Pathname formed by joining this pathname to the
   *  given pathname
  **/
  function join(){
    return new this($A(arguments).inject('',function(joined, path){
      return joined+'/'+path;
    }).gsub(/\/+/,'/'));
  }

  return {
    join: join
  };
})());
