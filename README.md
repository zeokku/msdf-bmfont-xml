# msdf-bmfont-xml

[![Build Status](https://travis-ci.org/soimy/msdf-bmfont-xml.svg?branch=master)](https://travis-ci.org/soimy/msdf-bmfont-xml)
[![npm version](https://badge.fury.io/js/msdf-bmfont-xml.svg)](https://badge.fury.io/js/msdf-bmfont-xml)

Converts a `.ttf` font file into multichannel signed distance fields, then outputs packed spritesheets and a xml(.fnt} or json representation of an AngelCode BMfont.

Signed distance fields are a method of reproducing vector shapes from a texture representation, popularized in [this paper by Valve](http://www.valvesoftware.com/publications/2007/SIGGRAPH2007_AlphaTestedMagnification.pdf).
This tool uses [Chlumsky/msdfgen](https://github.com/Chlumsky/msdfgen) to generate multichannel signed distance fields to preserve corners. The distance fields are created from vector fonts, then rendered into texture pages. A BMFont object is provided for character layout.

![Preview image](https://raw.githubusercontent.com/soimy/msdf-bmfont-xml/master/msdf-bmfont-xml.png)

## Install as CLI
```bash
$ npm install msdf-bmfont-xml -g
```
Then you just need to call `msdf-bmfont` from console to generate font file.
Type in `msdf-bmfont --help` for more detail usage,

## Install as Module

```bash
$ npm install msdf-bmfont-xml
```

## Examples

Writing the distance fields and font data to disk:
```js
const generateBMFont = require('msdf-bmfont-xml');
const fs = require('fs');

generateBMFont('Some-Font.ttf', (error, textures, font) => {
  if (error) throw error;
  textures.forEach((texture, index) => {
    fs.writeFile(texture.filename, texture.texture, (err) => {
      if (err) throw err;
    });
  });
  fs.writeFile(font.filename, font.data, (err) => {
    if (err) throw err;
  });
});
```

Generating a single channel signed distance field with a custom character set:
```js
const generateBMFont = require('msdf-bmfont');

const opt = {
  charset: 'ABC.ez_as-123!',
  fieldType: 'sdf'
};
generateBMFont('Some-Font.ttf', opt, (error, textures, font) => {
	...
});
```

## Usage

#### `generateBMFont(fontPath, [opt], callback)`

Renders a bitmap font from the font at `fontPath` with optional `opt` settings, triggering `callback` on complete.

Options:
- `outputType` (String)
  - type of output font file. Defaults to `xml`
    - `xml` a BMFont standard .fnt file which is wildly supported. 
    - `json` a JSON file compatible with [Hiero](https://github.com/libgdx/libgdx/wiki/Hiero)
- `filename` (String)
  - filename of both font file and font atlas. If omited, font face name is used.
- `charset` (String|Array)
  - the characters to include in the bitmap font. Defaults to all ASCII printable characters. 
- `fontSize` (Number)
  - the font size at which to generate the distance field. Defaults to `42`
- `textureWidth, textureHeight` (Number)
  - the dimensions of an output texture sheet, normally power-of-2 for GPU usage. Both dimensions default to `512`
- `texturePadding` (Number)
  - pixels between each glyph in the texture. Defaults to `2`
- `fieldType` (String)
  - what kind of distance field to generate. Defaults to `msdf`. Must be one of:
    - `msdf` Multi-channel signed distance field
    - `sdf` Monochrome signed distance field
    - `psdf` monochrome signed pseudo-distance field
- `distanceRange` (Number)
  - the width of the range around the shape between the minimum and maximum representable signed distance in pixels, defaults to `3`
- `roundDecimal` (Number)
  - rounded digits of the output font metics. For `xml` output, `roundDecimal: 0` recommended.
- `vector` (Boolean)
  - output a SVG Vector file for debugging. Defautls to `false`

The `callback` is called with the arguments `(error, textures, font)`

- `error` on success will be null/undefined
- `textures` an array of js objects of texture spritesheet.
  - `textures[index].filename` Spritesheet filename 
  - `textures[index].texture` Image Buffers, containing the PNG data of one texture sheet
- `font` an object containing the BMFont data, to be used to render the font
  - `font.filename` font filename
  - `font.data` stringified xml\json data to be written to disk

Since `opt` is optional, you can specify `callback` as the second argument.

## License

MIT, see [LICENSE.md](http://github.com/Jam3/xhr-request/blob/master/LICENSE.md) for details.
