var Rune = require("rune.js");
var isomorphicLoad = require('./load');

var SVG = function(url) {
  if(url.match(/\<svg/)) {
    this.svg = url;
  } else {
    this.url = url;
  }
}

SVG.prototype = {

  load: function(cb) {
    var that = this;
    isomorphicLoad(this.url, function(err, data) {
      that.svg = data;
      cb(err);
    });
  },

  toGroup: function() {

    if(!this.svg) throw Error("You must use load() before generating font paths");

    // DO A BUNCH OF THINGS

  }

}

module.exports = SVG;
