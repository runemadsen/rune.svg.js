var Rune = Rune || {};
Rune['Svg'] = /******/ (function(modules) {
  // webpackBootstrap
  /******/ // The module cache
  /******/ var installedModules = {}; // The require function
  /******/
  /******/ /******/ function __webpack_require__(moduleId) {
    /******/
    /******/ // Check if module is in cache
    /******/ if (installedModules[moduleId]) {
      /******/ return installedModules[moduleId].exports;
      /******/
    } // Create a new module (and put it into the cache)
    /******/ /******/ var module = (installedModules[moduleId] = {
      /******/ i: moduleId,
      /******/ l: false,
      /******/ exports: {}
      /******/
    }); // Execute the module function
    /******/
    /******/ /******/ modules[moduleId].call(
      module.exports,
      module,
      module.exports,
      __webpack_require__
    ); // Flag the module as loaded
    /******/
    /******/ /******/ module.l = true; // Return the exports of the module
    /******/
    /******/ /******/ return module.exports;
    /******/
  } // expose the modules object (__webpack_modules__)
  /******/
  /******/
  /******/ /******/ __webpack_require__.m = modules; // expose the module cache
  /******/
  /******/ /******/ __webpack_require__.c = installedModules; // define getter function for harmony exports
  /******/
  /******/ /******/ __webpack_require__.d = function(exports, name, getter) {
    /******/ if (!__webpack_require__.o(exports, name)) {
      /******/ Object.defineProperty(exports, name, {
        /******/ configurable: false,
        /******/ enumerable: true,
        /******/ get: getter
        /******/
      });
      /******/
    }
    /******/
  }; // getDefaultExport function for compatibility with non-harmony modules
  /******/
  /******/ /******/ __webpack_require__.n = function(module) {
    /******/ var getter =
      module && module.__esModule
        ? /******/ function getDefault() {
            return module['default'];
          }
        : /******/ function getModuleExports() {
            return module;
          };
    /******/ __webpack_require__.d(getter, 'a', getter);
    /******/ return getter;
    /******/
  }; // Object.prototype.hasOwnProperty.call
  /******/
  /******/ /******/ __webpack_require__.o = function(object, property) {
    return Object.prototype.hasOwnProperty.call(object, property);
  }; // __webpack_public_path__
  /******/
  /******/ /******/ __webpack_require__.p = ''; // Load entry module and return exports
  /******/
  /******/ /******/ return __webpack_require__((__webpack_require__.s = 0));
  /******/
})(
  /************************************************************************/
  /******/ [
    /* 0 */
    /***/ function(module, exports, __webpack_require__) {
      var Rune = __webpack_require__(1);
      var isomorphicLoad = __webpack_require__(2);
      var pathParser = __webpack_require__(4);

      // The xmldoc package makes it hard to stub the external because
      // it is required as .DOMParser, so we do this instead to make it
      // work in both node and browser (without the lib).
      var IsomorphicDOMParser;
      var xmldom = __webpack_require__(5);
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
              transform: ['rotate']
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
              transform: ['rotate']
            });
            group.add(s);
          } else if (child.tagName == 'circle') {
            var s = fillShape(new Rune.Circle(), child, {
              cx: 'x',
              cy: 'y',
              r: 'radius',
              stroke: 'stroke',
              fill: 'fill',
              transform: ['rotate']
            });
            group.add(s);
          } else if (child.tagName == 'line') {
            var s = fillShape(new Rune.Line(), child, {
              x1: 'x',
              y1: 'y',
              x2: 'x2',
              y2: 'y2',
              transform: ['rotate'],
              stroke: 'stroke',
              fill: 'fill'
            });
            group.add(s);
          } else if (child.tagName == 'polygon') {
            var s = fillShape(new Rune.Polygon(), child, {
              transform: ['rotate', 'translate'],
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
              transform: ['rotate', 'translate'],
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
              transform: ['rotate']
            });
            s.state.text = child.childNodes[0].nodeValue;
            group.add(s);
          } else if (child.tagName == 'image') {
            var s = fillShape(new Rune.Image(), child, {
              x: 'x',
              y: 'y',
              width: 'width',
              height: 'height',
              transform: ['rotate']
            });
            s.state.url =
              child.getAttribute('xlink:href') ||
              child.getAttribute('href') ||
              null;
            group.add(s);
          } else if (child.tagName == 'g') {
            var s = fillShape(new Rune.Group(), child, {
              transform: ['rotate', 'translate']
            });
            domChildrenToGroupChildren(s, child.childNodes);
            group.add(s);
          }
        }

        // Make sure they are all changed so they render
        for (var i = 0; i < group.children; i++) {
          group.children[i].changed();
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
        for (var i in (str = str.match(
          /(\w+\((\-?\d+\.?\d*e?\-?\d*,?\s?)+\))+/g
        ))) {
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
              if (v.indexOf('rotate') > -1 && hash.rotate) {
                if (hash.rotate[0])
                  shape.state.rotation = parseFloat(hash.rotate[0]);
                if (hash.rotate[1])
                  shape.state.rotationX = parseFloat(hash.rotate[1]);
                if (hash.rotate[2])
                  shape.state.rotationY = parseFloat(hash.rotate[2]);
              }
              if (v.indexOf('translate') > -1 && hash.translate) {
                if (hash.translate[0])
                  shape.state.x = parseFloat(hash.translate[0]);
                if (hash.translate[1])
                  shape.state.y = parseFloat(hash.translate[1]);
              }
            }
          } else if (k == 'stroke' || k == 'fill') {
            var attributeVal = node.getAttribute(k);
            if (attributeVal) {
              shape[k](attributeVal);
            }
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

      /***/
    },
    /* 1 */
    /***/ function(module, exports) {
      module.exports = Rune;

      /***/
    },
    /* 2 */
    /***/ function(module, exports, __webpack_require__) {
      function loadFromFile(url, callback) {
        var fs = __webpack_require__(3);
        fs.readFile(url, 'utf8', callback);
      }

      function loadFromUrl(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4) {
            if (xhr.status == 200) {
              callback(null, xhr.responseText);
            } else {
              callback('Load failed');
            }
          }
        };
        xhr.open('GET', url);
        xhr.send();
      }

      function load(url, callback) {
        var isNode = typeof window === 'undefined';
        var loadFn = isNode ? loadFromFile : loadFromUrl;
        loadFn(url, function(err, data) {
          if (err) {
            return callback(err);
          }
          return callback(null, data);
        });
      }

      module.exports = load;

      /***/
    },
    /* 3 */
    /***/ function(module, exports) {
      module.exports = fs;

      /***/
    },
    /* 4 */
    /***/ function(module, exports, __webpack_require__) {
      var __WEBPACK_AMD_DEFINE_FACTORY__,
        __WEBPACK_AMD_DEFINE_ARRAY__,
        __WEBPACK_AMD_DEFINE_RESULT__; /*!
 * d-path-parser - v1.0.0
 * by Massimo Artizzu (MaxArt2501)
 *
 * https://github.com/MaxArt2501/d-path-parser
 *
 * Licensed under the MIT License
 * See LICENSE for details
 */

      (function(root, factory) {
        if (true) {
          // AMD. Register as an anonymous module.
          !((__WEBPACK_AMD_DEFINE_ARRAY__ = []),
          (__WEBPACK_AMD_DEFINE_FACTORY__ = factory),
          (__WEBPACK_AMD_DEFINE_RESULT__ =
            typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function'
              ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(
                  exports,
                  __WEBPACK_AMD_DEFINE_ARRAY__
                )
              : __WEBPACK_AMD_DEFINE_FACTORY__),
          __WEBPACK_AMD_DEFINE_RESULT__ !== undefined &&
            (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
        } else if (typeof exports === 'object') {
          // Node. Does not work with strict CommonJS, but
          // only CommonJS-like environments that support module.exports,
          // like Node.
          module.exports = factory();
        } else {
          // Browser globals (root is window)
          root.dPathParse = factory();
        }
      })(this, function() {
        'use strict';

        return function parse(d) {
          var re = {
            command: /\s*([achlmqstvz])/gi,
            number: /\s*([+-]?\d*\.?\d+(?:e[+-]?\d+)?)/gi,
            comma: /\s*(?:(,)|\s)/g,
            flag: /\s*([01])/g
          };
          var matchers = {
            number: function(must) {
              return +get('number', must);
            },
            'coordinate pair': function(must) {
              var x = get('number', must);
              if (x === null && !must) return null;
              get('comma');
              var y = get('number', true);
              return { x: +x, y: +y };
            },
            'arc definition': function(must) {
              var radii = matchers['coordinate pair'](must);
              if (!radii && !must) return null;
              get('comma');
              var rotation = +get('number', true);
              get('comma', true);
              var large = !!+get('flag', true);
              get('comma');
              var clockwise = !!+get('flag', true);
              get('comma');
              var end = matchers['coordinate pair'](true);
              return {
                radii: radii,
                rotation: rotation,
                large: large,
                clockwise: clockwise,
                end: end
              };
            }
          };
          var index = 0;
          var commands = [];

          while (index < d.length) {
            var cmd = get('command');
            var upcmd = cmd.toUpperCase();
            var relative = cmd !== upcmd;
            var sequence;
            switch (upcmd) {
              case 'M':
                sequence = getSequence('coordinate pair').map(function(
                  coords,
                  i
                ) {
                  if (i === 1) cmd = relative ? 'l' : 'L';
                  return makeCommand({ end: coords });
                });
                break;
              case 'L':
              case 'T':
                sequence = getSequence('coordinate pair').map(function(coords) {
                  return makeCommand({ end: coords });
                });
                break;
              case 'C':
                sequence = getSequence('coordinate pair');
                if (sequence.length % 3)
                  throw Error(
                    'Expected coordinate pair triplet at position ' + index
                  );

                sequence = sequence.reduce(function(seq, coords, i) {
                  var rest = i % 3;
                  if (!rest) {
                    seq.push(makeCommand({ cp1: coords }));
                  } else {
                    var last = seq[seq.length - 1];
                    last[rest === 1 ? 'cp2' : 'end'] = coords;
                  }
                  return seq;
                }, []);

                break;
              case 'Q':
              case 'S':
                sequence = getSequence('coordinate pair');
                if (sequence.length & 1)
                  throw Error(
                    'Expected coordinate pair couple at position ' + index
                  );

                sequence = sequence.reduce(function(seq, coords, i) {
                  var odd = i & 1;
                  if (!odd) {
                    seq.push(makeCommand({ cp: coords }));
                  } else {
                    var last = seq[seq.length - 1];
                    last.end = coords;
                  }
                  return seq;
                }, []);

                break;
              case 'H':
              case 'V':
                sequence = getSequence('number').map(function(value) {
                  return makeCommand({ value: value });
                });
                break;
              case 'A':
                sequence = getSequence('arc definition').map(makeCommand);
                break;
              case 'Z':
                sequence = [{ code: 'Z' }];
                break;
            }
            commands.push.apply(commands, sequence);
          }

          return commands;

          function makeCommand(obj) {
            obj.code = cmd;
            obj.relative = relative;

            return obj;
          }
          function get(what, must) {
            re[what].lastIndex = index;
            var res = re[what].exec(d);
            if (!res || res.index !== index) {
              if (!must) return null;
              throw Error('Expected ' + what + ' at position ' + index);
            }

            index = re[what].lastIndex;

            return res[1];
          }
          function getSequence(what) {
            var sequence = [];
            var matched;
            var must = true;
            while ((matched = matchers[what](must))) {
              sequence.push(matched);
              must = !!get('comma');
            }

            return sequence;
          }
        };
      });

      /***/
    },
    /* 5 */
    /***/ function(module, exports) {
      module.exports = DOMParser;

      /***/
    }
    /******/
  ]
);
