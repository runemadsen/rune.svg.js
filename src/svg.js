var Rune = require('rune.js');
var isomorphicLoad = require('./load');
var pathParser = require('d-path-parser');

// The xmldoc package makes it hard to stub the external because
// it is required as .DOMParser, so we do this instead to make it
// work in both node and browser (without the lib).
var IsomorphicDOMParser;
var xmldom = require('xmldom');
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
      throw Error('You must use load() before generating font paths');
    }

    var group = new Rune.Group(x || 0, y || 0);
    var parser = new IsomorphicDOMParser();
    var el = parser.parseFromString(this.svg);
    var svgel = findChildByTag(el, 'svg');
    var shapes = domChildrenToGroupChildren(group, svgel.childNodes);
    return group;
  }
};

// Helpers
// ---------------------------------------------------

function domChildrenToGroupChildren(group, childNodes) {
  for (var i = 0; i < childNodes.length; i++) {
    var child = childNodes[i];

    if (child.tagName == 'rect') {
      var s = fillShape(new Rune.Rectangle(), child, {
        x: 'x',
        y: 'y',
        width: 'width',
        height: 'height',
        rx: 'rx',
        ry: 'ry',
        stroke: 'stroke',
        fill: 'fill',
        transform: ['rotation']
      });
      group.add(s);
    } else if (child.tagName == 'ellipse') {
      var s = fillShape(new Rune.Ellipse(), child, {
        cx: 'x',
        cy: 'y',
        rx: 'rx',
        ry: 'ry',
        stroke: 'stroke',
        fill: 'fill',
        transform: ['rotation']
      });
      group.add(s);
    } else if (child.tagName == 'circle') {
      var s = fillShape(new Rune.Circle(), child, {
        cx: 'x',
        cy: 'y',
        r: 'radius',
        stroke: 'stroke',
        fill: 'fill',
        transform: ['rotation']
      });
      group.add(s);
    } else if (child.tagName == 'line') {
      var s = fillShape(new Rune.Line(), child, {
        x1: 'x',
        y1: 'y',
        x2: 'x2',
        y2: 'y2',
        transform: ['rotation'],
        stroke: 'stroke',
        fill: 'fill'
      });
      group.add(s);
    } else if (child.tagName == 'polygon') {
      var s = fillShape(new Rune.Polygon(), child, {
        transform: ['rotation', 'translate'],
        stroke: 'stroke',
        fill: 'fill'
      });
      var points = polygonParser(child.getAttribute('points'));
      for (var j = 0; j < points.length; j += 2) {
        s.state.vectors.push(new Rune.Vector(points[j], points[j + 1]));
      }
      group.add(s);
    } else if (child.tagName == 'path') {
      var s = fillShape(new Rune.Path(), child, {
        transform: ['rotation', 'translate'],
        stroke: 'stroke',
        fill: 'fill'
      });

      var path = pathParser(child.getAttribute('d'));
      for (var j = 0; j < path.length; j++) {
        var p = path[j];

        // relative coords will be converted to absolute, as rune.js
        // does not support relative output in path
        var addX = 0;
        var addY = 0;
        if (p.relative && j > 0) {
          addX = path[j - 1].end.x;
          addY = path[j - 1].end.y;
        }

        if (p.code === 'M' || p.code === 'm') {
          s.state.anchors.push(
            new Rune.Anchor().setMove(p.end.x + addX, p.end.y + addY)
          );
        } else if (p.code === 'L' || p.code === 'l') {
          s.state.anchors.push(
            new Rune.Anchor().setLine(p.end.x + addX, p.end.y + addY)
          );
        } else if (p.code === 'Q' || p.code == 'q') {
          s.state.anchors.push(
            new Rune.Anchor().setCurve(
              p.cp.x + addX,
              p.cp.y + addY,
              p.end.x + addX,
              p.end.y + addY
            )
          );
        } else if (p.code === 'C' || p.code === 'c') {
          s.state.anchors.push(
            new Rune.Anchor().setCurve(
              p.cp1.x + addX,
              p.cp1.y + addY,
              p.cp2.x + addX,
              p.cp2.y + addY,
              p.end.x + addX,
              p.end.y + addY
            )
          );
        } else if (p.code === 'Z' || p.code === 'z') {
          s.state.anchors.push(new Rune.Anchor().setClose());
        }
        group.add(s);
      }
    } else if (child.tagName == 'text') {
      var s = fillShape(new Rune.Text(), child, {
        x: 'x',
        y: 'y',
        stroke: 'stroke',
        fill: 'fill',
        'text-align': 'textAlign',
        'font-family': 'fontFamily',
        'font-style': 'fontStyle',
        'font-weight': 'fontWeight',
        'font-size': 'fontSize',
        'letter-spacing': 'letterSpacing',
        'text-decoration': 'textDecoration',
        transform: ['rotation']
      });
      s.state.text = child.childNodes[0].nodeValue;
      group.add(s);
    }
  }
}

function polygonParser(points) {
  var nums = [];
  var reg = /\d+/g;
  var num;
  while ((num = reg.exec(points)) !== null) {
    nums.push(parseFloat(num[0]));
  }
  return nums;
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
    if (k == 'transform') {
      var transformVal = node.getAttribute('transform');
      if (transformVal) {
        var hash = transformValToHash(transformVal);
        if (v.indexOf('rotation') > -1 && hash.rotate) {
          if (hash.rotate[0]) shape.state.rotation = parseFloat(hash.rotate[0]);
          if (hash.rotate[1])
            shape.state.rotationX = parseFloat(hash.rotate[1]);
          if (hash.rotate[2])
            shape.state.rotationY = parseFloat(hash.rotate[2]);
        }
        if (v.indexOf('translate') > -1 && hash.translate) {
          if (hash.translate[0]) shape.state.x = parseFloat(hash.translate[0]);
          if (hash.translate[1]) shape.state.y = parseFloat(hash.translate[1]);
        }
      }
    } else if (k == 'stroke' || k == 'fill') {
      var attributeVal = node.getAttribute(k);
      shape[k](attributeVal);
    } else if (typeof v == 'string') {
      // if this is just a string, assign to that state var
      var attributeVal = node.getAttribute(k);
      if (attributeVal) {
        var shouldBeFloat =
          [
            'x',
            'y',
            'x2',
            'y2',
            'width',
            'height',
            'rx',
            'ry',
            'cx',
            'cy',
            'radius',
            'fontSize',
            'letterSpacing'
          ].indexOf(v) > -1;
        shape.state[v] = shouldBeFloat
          ? parseFloat(attributeVal)
          : attributeVal;
      }
    }
  }
  shape.changed();
  return shape;
}

function parseTransform(transformString) {
  var attrs = {};

  if (rotateMatch) {
    var nums = rotateMatch[1].split(' ');
    attrs.rotation = parseFloat(nums[0]);
    if (nums[1]) {
      attrs.rotationX = parseFloat(nums[1]);
    }
    if (nums[2]) {
      attrs.rotationY = parseFloat(nums[2]);
    }
  }
  return attrs;
}

function getAtttributes(node, keys) {
  var attrs = {};
  for (var i = 0; i < keys.length; i++) {
    var val = node.getAttribute(keys[i]);
    if (val) {
      if (keys[i] == 'transform') {
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
