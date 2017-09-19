describe("Rune.SVG", function() {

  var svgFile = typeof window === 'undefined' ? "test/tiger.svg" : "tiger.svg";


  describe("constructor", function() {

    it("should set svg", function() {
      var svg = new Rune.SVG("<svg></svg>");
      expect(svg.url).toBeUndefined();
      expect(svg.svg).toEqual("<svg></svg>");
    });

    it("should set url", function() {
      var svg = new Rune.SVG(svgFile);
      expect(svg.url).toEqual(svgFile);
      expect(svg.svg).toBeUndefined();
    });

  });

  describe("load()", function() {
    it("should load the SVG", function(done) {
      var svg = new Rune.SVG(svgFile);
      svg.load(function(err) {
        expect(err).toBeNull();
        expect(svg.svg).not.toBeUndefined();
        done()
      });
    });
  });

});
