beforeEach(function() {
  jasmine.addMatchers({
    toHaveState: function() {
      return {
        compare: function(shape, attrs) {
          var missingOrWrongState = [];
          var keys = Object.keys(attrs);
          for (var i = 0; i < keys.length; i++) {
            if (shape.state[keys[i]] !== attrs[keys[i]]) {
              missingOrWrongState.push(
                `${keys[i]} is ${shape.state[keys[i]]} but should be ${attrs[
                  keys[i]
                ]}`
              );
            }
          }

          if (missingOrWrongState.length > 0) {
            return {
              pass: false,
              message:
                "State missing or wrong:\n" + missingOrWrongState.join("\n")
            };
          } else {
            return {
              pass: true
            };
          }
        }
      };
    }
  });
});
