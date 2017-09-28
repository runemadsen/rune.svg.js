var Rune = Rune || {}; Rune["Svg"] =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

var Rune = __webpack_require__(1);
var isomorphicLoad = __webpack_require__(2);

// The xmldoc package makes it hard to stub the external because
// it is required as .DOMParser, so we do this instead to make it
// work in both node and browser (without the lib).
var IsomorphicDOMParser;
var xmldom = __webpack_require__(4);
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


/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = Rune;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

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
      }
      else {
        callback('Load failed');
      }
    }
  };
  xhr.open("GET", url);
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


/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = fs;

/***/ }),
/* 4 */
/***/ (function(module, exports) {

module.exports = DOMParser;

/***/ })
/******/ ]);