# Rune.Font.js

A plugin that parses SVG files (or strings) and converts them Rune objects.

Currently implemented:

- [x] Convert tags to Rune objects (`<rect>`, `<ellipse>`, `<circle>`, `<line>`, `<polygon>`, `<path>`, `<text>`, `<image>`, `<g>`)
- [x] Parse tag attributes supported by Rune
- [x] Parse style attributes supported by Rune
- [x] Path: Convert relative commands to absolute `Rune.Anchor`
- [x] Path: Convert `S` to full `Rune.Anchor` bezier
- [x] Path: Convert `V` and `H` to `Rune.Anchor` line
- [ ] Parse `<defs>` for gradients (Gradients not support in Rune.js yet)
- [ ] Convert transform attribute `matrix()` into actual `x` and `y` values for object


## Using in the browser

First download the [latest release](https://github.com/runemadsen/rune.svg.js/releases/latest). Then include the `rune.svg.js` file after your `rune.js` file in your HTML file.

```html
<head>
  <script src="rune.js"></script>
  <script src="rune.svg.js"></script>
</head>
```

The plugin is now available as `Rune.Svg`.

## Using in node

`npm install rune.svg.js`

Then require the `rune.svg.js` module in your code, along with your `rune.js` module (if needed).

```js
var Rune = require('rune.js');
var Svg = require('rune.svg.js');
```

The plugin is now available as `Svg`.

## Usage

This loads a SVG file and converts it to a `Rune.Group`.

```js
var svg = new Rune.Svg('myfile.svg');
svg.load(function(err) {
  var group = svg.toGroup();
  r.stage.add(group);
});
```

This parses a SVG string and converts it to a `Rune.Group`.

```js
var svg = new Rune.Svg('<svg>...</svg>');
svg.load(function(err) {
  var group = svg.toGroup();
  r.stage.add(group);
});
```
