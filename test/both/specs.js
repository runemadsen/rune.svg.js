describe('Rune.SVG', function() {
  var testFile = 'test/test.svg';
  var tigerFile = 'test/tiger.svg';

  describe('constructor', function() {
    it('should set svg', function() {
      var svg = new Rune.Svg('<svg></svg>');
      expect(svg.url).toBeUndefined();
      expect(svg.svg).toEqual('<svg></svg>');
    });

    it('should set url', function() {
      var svg = new Rune.Svg(testFile);
      expect(svg.url).toEqual(testFile);
      expect(svg.svg).toBeUndefined();
    });
  });

  describe('load()', function() {
    it('should load the SVG', function(done) {
      var svg = new Rune.Svg(testFile);
      svg.load(function(err) {
        expect(err).toBeNull();
        expect(svg.svg).not.toBeUndefined();
        done();
      });
    });
  });

  describe('toGroup()', function() {
    fit('should parse the complicated tiger file', function(done) {
      var svg = new Rune.Svg(tigerFile);
      svg.load(function(err) {
        var group = svg.toGroup();
        expect(group.children.length).toEqual(1);
        done();
      });
    });

    it('should parse the SVG and return a Rune.Group', function(done) {
      var svg = new Rune.Svg(testFile);
      svg.load(function(err) {
        var group = svg.toGroup();

        // Rect
        var rect = group.children[0];
        expect(rect.type).toEqual('rectangle');
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
        expect(ellipse.type).toEqual('ellipse');
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
        expect(circle.type).toEqual('circle');
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
        expect(line.type).toEqual('line');
        expect(line.state.x).toEqual(1);
        expect(line.state.y).toEqual(2);
        expect(line.state.x2).toEqual(3);
        expect(line.state.y2).toEqual(4);
        expect(line.state.rotation).toEqual(5);
        expect(line.state.rotationX).toEqual(6);
        expect(line.state.rotationY).toEqual(7);
        expect(line.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(line.state.fill).toEqual(new Rune.Color(255, 0, 0));

        // Polygon
        var polygon = group.children[4];
        expect(polygon.type).toEqual('polygon');
        expect(polygon.state.x).toEqual(4);
        expect(polygon.state.y).toEqual(5);
        expect(polygon.state.rotation).toEqual(1);
        expect(polygon.state.rotationX).toEqual(2);
        expect(polygon.state.rotationY).toEqual(3);
        expect(polygon.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(polygon.state.fill).toEqual(new Rune.Color(255, 0, 0));
        expect(polygon.state.vectors).toEqual([
          new Rune.Vector(200, 10),
          new Rune.Vector(250, 190),
          new Rune.Vector(160, 210)
        ]);

        // Path
        var path = group.children[5];
        expect(path.type).toEqual('path');
        expect(path.state.x).toEqual(4);
        expect(path.state.y).toEqual(5);
        expect(path.state.rotation).toEqual(1);
        expect(path.state.rotationX).toEqual(2);
        expect(path.state.rotationY).toEqual(3);
        expect(path.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(path.state.fill).toEqual(new Rune.Color(255, 0, 0));
        expect(path.state.anchors).toEqual([
          new Rune.Anchor().setMove(1, 2),
          new Rune.Anchor().setMove(2, 4), // relative
          new Rune.Anchor().setLine(3, 4),
          new Rune.Anchor().setLine(6, 8), // relative
          new Rune.Anchor().setCurve(5, 6, 7, 8),
          new Rune.Anchor().setCurve(12, 14, 14, 16), // relative
          new Rune.Anchor().setCurve(5, 6, 7, 8, 9, 10),
          new Rune.Anchor().setCurve(14, 16, 16, 18, 18, 20), // relative
          new Rune.Anchor().setClose()
        ]);

        // Text
        var text = group.children[6];
        expect(text.type).toEqual('text');
        expect(text.state.text).toEqual('Rune');
        expect(text.state.x).toEqual(1);
        expect(text.state.y).toEqual(2);
        expect(text.state.rotation).toEqual(3);
        expect(text.state.rotationX).toEqual(4);
        expect(text.state.rotationY).toEqual(5);
        expect(text.state.stroke).toEqual(new Rune.Color(255, 0, 0));
        expect(text.state.fill).toEqual(new Rune.Color(255, 0, 0));
        expect(text.state.textAlign).toEqual('left');
        expect(text.state.fontFamily).toEqual('Helvetica');
        expect(text.state.fontStyle).toEqual('italic');
        expect(text.state.fontWeight).toEqual('bold');
        expect(text.state.fontSize).toEqual(12);
        expect(text.state.letterSpacing).toEqual(0.5);
        expect(text.state.textDecoration).toEqual('none');

        // Image
        var image = group.children[7];
        expect(image.type).toEqual('image');
        expect(image.state.x).toEqual(1);
        expect(image.state.y).toEqual(2);
        expect(image.state.rotation).toEqual(3);
        expect(image.state.rotationX).toEqual(4);
        expect(image.state.rotationY).toEqual(5);
        expect(image.state.url).toEqual('one.jpg');

        // Group
        var group = group.children[8];
        expect(group.type).toEqual('group');
        expect(group.state.x).toEqual(1);
        expect(group.state.y).toEqual(2);
        expect(group.state.rotation).toEqual(3);
        expect(group.state.rotationX).toEqual(4);
        expect(group.state.rotationY).toEqual(5);
        var child1 = group.children[0];
        expect(child1.type).toEqual('rectangle');
        expect(child1.state.x).toEqual(6);
        expect(child1.state.y).toEqual(7);
        expect(child1.state.width).toEqual(8);
        expect(child1.state.height).toEqual(9);
        var child2 = group.children[1];
        expect(child2.type).toEqual('group');
        expect(child2.state.x).toEqual(10);
        expect(child2.state.y).toEqual(11);
        expect(child2.state.rotation).toEqual(12);
        expect(child2.state.rotationX).toEqual(13);
        expect(child2.state.rotationY).toEqual(14);
        var child3 = child2.children[0];
        expect(child3.type).toEqual('rectangle');
        expect(child3.state.x).toEqual(15);
        expect(child3.state.y).toEqual(16);
        expect(child3.state.width).toEqual(17);
        expect(child3.state.height).toEqual(18);

        done();
      });
    });
  });
});
