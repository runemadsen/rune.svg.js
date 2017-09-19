function loadFromFile(url, callback) {
  var fs = require('fs');
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
