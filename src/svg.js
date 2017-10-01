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
    var el = parser.parseFromString(this.svg, 'image/svg+xml');
    var svgel = findChildByTag(el, 'svg');
    var shapes = domChildrenToGroupChildren(group, svgel.childNodes);
    return group;
  }
};

// Helpers
// ---------------------------------------------------

var floats = [
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
  'letterSpacing',
  'strokeWidth',
  'strokeMiterlimit',
  'strokeDashOffset'
];

var tagmap = {
  rect: {
    shape: Rune.Rectangle,
    vars: {
      x: 'x',
      y: 'y',
      width: 'width',
      height: 'height',
      rx: 'rx',
      ry: 'ry'
    },
    transform: ['rotate'],
    mixins: ['styles']
  },
  ellipse: {
    shape: Rune.Ellipse,
    vars: {
      cx: 'x',
      cy: 'y',
      rx: 'rx',
      ry: 'ry'
    },
    transform: ['rotate'],
    mixins: ['styles']
  },
  circle: {
    shape: Rune.Circle,
    vars: {
      cx: 'x',
      cy: 'y',
      r: 'radius'
    },
    transform: ['rotate'],
    mixins: ['styles']
  },
  line: {
    shape: Rune.Line,
    vars: {
      x1: 'x',
      y1: 'y',
      x2: 'x2',
      y2: 'y2'
    },
    transform: ['rotate'],
    mixins: ['styles']
  },
  polygon: {
    shape: Rune.Polygon,
    transform: ['rotate', 'translate'],
    mixins: ['styles'],
    callback: function(node, shape) {
      var points = polygonParser(node.getAttribute('points'));
      for (var i = 0; i < points.length; i += 2) {
        shape.state.vectors.push(new Rune.Vector(points[i], points[i + 1]));
      }
      return shape;
    }
  },
  path: {
    shape: Rune.Path,
    transform: ['rotate', 'translate'],
    mixins: ['styles'],
    callback: function(node, shape) {
      return fillPath(node, shape);
    }
  },
  text: {
    shape: Rune.Text,
    vars: {
      x: 'x',
      y: 'y',
      'text-align': 'textAlign',
      'font-family': 'fontFamily',
      'font-style': 'fontStyle',
      'font-weight': 'fontWeight',
      'font-size': 'fontSize',
      'letter-spacing': 'letterSpacing',
      'text-decoration': 'textDecoration'
    },
    transform: ['rotate'],
    mixins: ['styles'],
    callback: function(node, shape) {
      shape.state.text = node.childNodes[0].nodeValue;
      return shape;
    }
  },
  image: {
    shape: Rune.Image,
    vars: {
      x: 'x',
      y: 'y',
      width: 'width',
      height: 'height'
    },
    transform: ['rotate'],
    callback: function(node, shape) {
      shape.state.url =
        node.getAttribute('xlink:href') || node.getAttribute('href') || null;
      return shape;
    }
  },
  g: {
    shape: Rune.Group,
    transform: ['rotate', 'translate'],
    mixins: ['styles'],
    callback: function(node, shape) {
      domChildrenToGroupChildren(shape, node.childNodes);
      return shape;
    }
  }
};
var tagkeys = Object.keys(tagmap);

function domChildrenToGroupChildren(group, childNodes) {
  for (var i = 0; i < childNodes.length; i++) {
    var child = childNodes[i];
    if (child.tagName && tagkeys.indexOf(child.tagName > -1)) {
      var mapitem = tagmap[child.tagName];
      var shape = new mapitem.shape();

      if (mapitem.vars) {
        assignVars(shape, child, mapitem.vars);
      }

      if (mapitem.transform) {
        assignTransform(shape, child, mapitem.transform);
      }

      if (mapitem.mixins) {
        assignMixins(shape, child, mapitem.mixins);
      }

      if (mapitem.callback) {
        mapitem.callback(child, shape);
      }

      group.add(shape);
      shape.changed();
    } else if (child.tagName) {
      console.error('Tag not implemented in parser:', child.tagName);
    }
  }
}

function assignVars(shape, node, vars) {
  var keys = Object.keys(vars);
  for (var i = 0; i < keys.length; i++) {
    var attrVal = node.getAttribute(keys[i]);
    if (attrVal) {
      if (floats.indexOf(vars[keys[i]]) > -1) {
        shape.state[vars[keys[i]]] = parseFloat(attrVal);
      } else {
        shape.state[vars[keys[i]]] = attrVal;
      }
    }
  }
}

var styleVars = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeCap',
  'stroke-linejoin': 'strokeJoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-dasharray': 'strokeDash',
  'stroke-dashoffset': 'strokeDashOffset'
};

function assignMixins(shape, node, mixins) {
  if (mixins.indexOf('styles') > -1) {
    shape.state.fill = false;
    shape.state.stroke = false;

    var fill = node.getAttribute('fill');
    if (fill && fill !== 'none') {
      shape.state.fill = new Rune.Color(fill);
    }

    var stroke = node.getAttribute('stroke');
    if (stroke && stroke !== 'none') {
      shape.state.stroke = new Rune.Color(stroke);
    }

    var keys = Object.keys(styleVars);
    for (var i = 0; i < keys.length; i++) {
      var attrVal = node.getAttribute(keys[i]);
      if (attrVal) {
        if (floats.indexOf(styleVars[keys[i]]) > -1) {
          shape.state[styleVars[keys[i]]] = parseFloat(attrVal);
        } else {
          shape.state[styleVars[keys[i]]] = attrVal;
        }
      }
    }
  }
}

function assignTransform(shape, node, transform) {
  var transformVal = node.getAttribute('transform');
  if (transformVal) {
    var hash = transformValToHash(transformVal);
    if (transform.indexOf('rotate') > -1 && hash.rotate) {
      if (hash.rotate[0]) shape.state.rotation = parseFloat(hash.rotate[0]);
      if (hash.rotate[1]) shape.state.rotationX = parseFloat(hash.rotate[1]);
      if (hash.rotate[2]) shape.state.rotationY = parseFloat(hash.rotate[2]);
    }
    if (transform.indexOf('translate') > -1 && hash.translate) {
      if (hash.translate[0]) shape.state.x = parseFloat(hash.translate[0]);
      if (hash.translate[1]) shape.state.y = parseFloat(hash.translate[1]);
    }
  }
}

function fillPath(node, shape) {
  var dObject = pathParser(node.getAttribute('d'));
  var s = shape;

  for (var j = 0; j < dObject.length; j++) {
    var p = dObject[j];

    // relative coords will be converted to absolute, as rune.js
    // does not support relative output in path
    var addX = 0;
    var addY = 0;
    if (p.relative && j > 0) {
      var lastAnchor = s.state.anchors[s.state.anchors.length - 1];
      var lastVec = lastAnchor.vec3 || lastAnchor.vec2 || lastAnchor.vec1;
      addX = lastVec.x;
      addY = lastVec.y;
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
    } else if (p.code === 'S' || p.code === 's') {
      // Convert shorthand to full cubic bezier.
      // If last anchor is cubic, mirror cp2 to end vector
      // If not, just use last end position
      var lastAnchor = s.state.anchors[s.state.anchors.length - 1];
      var cp1;
      if (lastAnchor.command == 'cubic') {
        cp1 = lastAnchor.vec3.sub(lastAnchor.vec2).add(lastAnchor.vec3);
      } else {
        cp1 = lastAnchor.vec3 || lastAnchor.vec2 || lastAnchor.vec1;
      }
      s.state.anchors.push(
        new Rune.Anchor().setCurve(
          cp1.x,
          cp1.y,
          p.cp.x + addX,
          p.cp.y + addY,
          p.end.x + addX,
          p.end.y + addY
        )
      );
    } else if (p.code === 'V' || p.code === 'v') {
      var lastAnchor = s.state.anchors[s.state.anchors.length - 1];
      s.state.anchors.push(
        new Rune.Anchor().setLine(
          (lastAnchor.vec3 || lastAnchor.vec2 || lastAnchor.vec1).x,
          p.value + addY
        )
      );
    } else if (p.code === 'H' || p.code === 'h') {
      var lastAnchor = s.state.anchors[s.state.anchors.length - 1];
      s.state.anchors.push(
        new Rune.Anchor().setLine(
          p.value + addX,
          (lastAnchor.vec3 || lastAnchor.vec2 || lastAnchor.vec1).y
        )
      );
    } else if (p.code === 'Z' || p.code === 'z') {
      s.state.anchors.push(new Rune.Anchor().setClose());
    } else {
      console.error('path command not implemented in parser:', p.code);
    }
  }

  return shape;
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
