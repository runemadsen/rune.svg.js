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
        var rect = group.children[0];
        expect(rect.type).toEqual("rectangle");
        expect(rect.state.x).toEqual(1);
        expect(rect.state.y).toEqual(2);
        expect(rect.state.width).toEqual(3);
        expect(rect.state.height).toEqual(4);
        expect(rect.state.rx).toEqual(5);
        expect(rect.state.ry).toEqual(6);
        expect(rect.state.rotation).toEqual(9);
        expect(rect.state.rotationX).toEqual(10);
        expect(rect.state.rotationY).toEqual(11);
        expect(rect.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(rect.state.fill).toEqual(new Rune.Color(255, 0, 0));

        // Ellipse
        var ellipse = group.children[1];
        expect(ellipse.type).toEqual("ellipse");
        expect(ellipse.state.x).toEqual(1);
        expect(ellipse.state.y).toEqual(2);
        expect(ellipse.state.rx).toEqual(3);
        expect(ellipse.state.ry).toEqual(4);
        expect(ellipse.state.rotation).toEqual(7);
        expect(ellipse.state.rotationX).toEqual(8);
        expect(ellipse.state.rotationY).toEqual(9);
        expect(ellipse.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(ellipse.state.fill).toEqual(new Rune.Color(255, 0, 0));

        // Circle
        var circle = group.children[2];
        expect(circle.type).toEqual("circle");
        expect(circle.state.x).toEqual(1.1);
        expect(circle.state.y).toEqual(2.2);
        expect(circle.state.radius).toEqual(3.3);
        expect(circle.state.rotation).toEqual(4);
        expect(circle.state.rotationX).toEqual(5);
        expect(circle.state.rotationY).toEqual(6);
        expect(circle.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(circle.state.fill).toEqual(new Rune.Color(255, 0, 0));

        // Line
        var line = group.children[3];
        expect(line.type).toEqual("line");
        expect(line.state.x).toEqual(1);
        expect(line.state.y).toEqual(2);
        expect(line.state.x2).toEqual(3);
        expect(line.state.y2).toEqual(4);
        expect(line.state.rotation).toEqual(5);
        expect(line.state.rotationX).toEqual(6);
        expect(line.state.rotationY).toEqual(7);
        expect(line.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(line.state.fill).toEqual(new Rune.Color(255, 0, 0));
        done();
      });
    });
  });
});
