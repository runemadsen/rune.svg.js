describe("Rune.SVG", function() {
  var testFile = "test/test.svg";
  var tigerFile = "test/tiger.svg";

  describe("constructor", function() {
    it("should set svg", function() {
      var svg = new Rune.Svg("<svg></svg>");
      expect(svg.url).toBeUndefined();
      expect(svg.svg).toEqual("<svg></svg>");
    });

    it("should set url", function() {
      var svg = new Rune.Svg(testFile);
      expect(svg.url).toEqual(testFile);
      expect(svg.svg).toBeUndefined();
    });
  });

  describe("load()", function() {
    it("should load the SVG", function(done) {
      var svg = new Rune.Svg(testFile);
      svg.load(function(err) {
        expect(err).toBeNull();
        expect(svg.svg).not.toBeUndefined();
        done();
      });
    });
  });

  describe("toGroup()", function() {
    fit("should parse the SVG and return a Rune.Group", function(done) {
      var svg = new Rune.Svg(testFile);
      svg.load(function(err) {
        var group = svg.toGroup();

        // Rect
        expect(group.children[0].type).toEqual("rectangle");
        expect(group.children[0]).toHaveState({
          x: 1,
          y: 2,
          width: 3,
          height: 4,
          rx: 5,
          ry: 6,
          rotation: 9,
          rotationX: 10,
          rotationY: 11
        });

        // Ellipse
        expect(group.children[1].type).toEqual("ellipse");
        expect(group.children[1]).toHaveState({
          x: 1,
          y: 2,
          rx: 3,
          ry: 4,
          rotation: 7,
          rotationX: 8,
          rotationY: 9
        });
        done();
      });
    });
  });
});
