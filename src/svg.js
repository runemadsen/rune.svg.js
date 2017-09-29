var Rune = require("rune.js");
var isomorphicLoad = require("./load");

// The xmldoc package makes it hard to stub the external because
// it is required as .DOMParser, so we do this instead to make it
// work in both node and browser (without the lib).
var IsomorphicDOMParser;
var xmldom = require("xmldom");
if (xmldom.DOMParser) {
  IsomorphicDOMParser = xmldom.DOMParser;
} else {
  IsomorphicDOMParser = DOMParser;
}

var Svg = function(url) {
  if (url.match(/\<svg/)) {
    this.svg = url;
  } else {
    this.url = url;
  }
};

Svg.prototype = {
  load: function(cb) {
    var that = this;
    isomorphicLoad(this.url, function(err, data) {
      that.svg = data;
      cb(err);
    });
  },

  toGroup: function(x, y) {
    if (!this.svg) {
      throw Error("You must use load() before generating font paths");
    }

    var group = new Rune.Group(x || 0, y || 0);
    var parser = new IsomorphicDOMParser();
    var el = parser.parseFromString(this.svg);
    var svgel = findChildByTag(el, "svg");
    var shapes = domChildrenToGroupChildren(group, svgel.childNodes);
    return group;
  }
};

// Helpers
// ---------------------------------------------------

function domChildrenToGroupChildren(group, childNodes) {
  for (var i = 0; i < childNodes.length; i++) {
    var child = childNodes[i];

    if (child.tagName == "rect") {
      var s = fillShape(new Rune.Rectangle(), child, {
        x: "x",
        y: "y",
        width: "width",
        height: "height",
        rx: "rx",
        ry: "ry",
        transform: ["rotation"]
      });
      group.add(s);
    } else if (child.tagName == "ellipse") {
      var s = fillShape(new Rune.Ellipse(), child, {
        cx: "x",
        cy: "y",
        rx: "rx",
        ry: "ry",
        transform: ["rotation"]
      });
      group.add(s);
    }
    // if ellipse
    // if circle
    // line
    // path
    // polygon
    // group
    // rectangle
    // text
  }
}

function transformValToHash(str) {
  var b = {};
  for (var i in (str = str.match(/(\w+\((\-?\d+\.?\d*e?\-?\d*,?\s?)+\))+/g))) {
    var c = str[i].match(/[\w\.\-]+/g);
    b[c.shift()] = c;
  }
  return b;
}

// This function loops through the node attributes based on
// the hash map keys, gets the attributes, and adds them to
// the shape state based on the hash values.
function fillShape(shape, node, map) {
  var keys = Object.keys(map);
  for (var i = 0; i < keys.length; i++) {
    var k = keys[i];
    var v = map[k];

    // if this is transform, handle it based on allowed vars in array
    if (k == "transform") {
      var transformVal = node.getAttribute("transform");
      if (transformVal) {
        var hash = transformValToHash(transformVal);
        if (v.indexOf("rotation") > -1 && hash.rotate) {
          if (hash.rotate[0]) shape.state.rotation = parseInt(hash.rotate[0]);
          if (hash.rotate[1]) shape.state.rotationX = parseInt(hash.rotate[1]);
          if (hash.rotate[2]) shape.state.rotationY = parseInt(hash.rotate[2]);
        }
      }
    } else if (typeof v == "string") {
      // if this is just a string, assign to that state var
      var attributeVal = node.getAttribute(k);
      if (attributeVal) {
        shape.state[v] = parseInt(attributeVal);
      }
    }
  }
  shape.changed();
  return shape;
}

function parseTransform(transformString) {
  var attrs = {};

  if (rotateMatch) {
    var nums = rotateMatch[1].split(" ");
    attrs.rotation = parseInt(nums[0]);
    if (nums[1]) {
      attrs.rotationX = parseInt(nums[1]);
    }
    if (nums[2]) {
      attrs.rotationY = parseInt(nums[2]);
    }
  }
  return attrs;
}

function getAtttributes(node, keys) {
  var attrs = {};
  for (var i = 0; i < keys.length; i++) {
    var val = node.getAttribute(keys[i]);
    if (val) {
      if (keys[i] == "transform") {
        Object.assign(attrs, parseTransform(val));
      } else {
        attrs[keys[i]] = val;
      }
    }
  }
  return attrs;
}

function findChildByTag(node, tagName) {
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].tagName == tagName) {
      return node.childNodes[i];
    }
  }
  return null;
}

module.exports = Svg;
