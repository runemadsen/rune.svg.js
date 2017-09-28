var Rune = require("rune.js");
var isomorphicLoad = require('./load');

// The xmldoc package makes it hard to stub the external because
// it is required as .DOMParser, so we do this instead to make it
// work in both node and browser (without the lib).
var IsomorphicDOMParser;
var xmldom = require('xmldom');
if(xmldom.DOMParser) {
  IsomorphicDOMParser = xmldom.DOMParser;
}
else {
  IsomorphicDOMParser = DOMParser;
}

var Svg = function(url) {
  console.log(DOMParser);
  if(url.match(/\<svg/)) {
    this.svg = url;
  } else {
    this.url = url;
  }
}

Svg.prototype = {

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

module.exports = Svg;
