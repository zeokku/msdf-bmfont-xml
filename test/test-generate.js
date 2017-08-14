const generateBMFont = require('../index');
const fs = require('fs');
const path = require('path');

const opt = {
  outputType: "xml",
  filename: "font",
  fieldType: "sdf",
  fontSize: 30,
  fontSpacing: [-20, 0],
  distanceRange: 3,
  texturePadding: 1,
  textureWidth: 2048,
  textureHeight: 1024,
  roundDecimal: 0,
  // debug: true,
  // progress: true
};

fs.readFile(path.join(__dirname, 'charset.input.txt'), 'utf8', (error, data) => {
  if (error) throw error;
  if (data) opt.charset = data;
  generateBMFont(path.join(__dirname, 'fonts/FZZDHS.TTF'), opt , (error, textures, font) => {
    if (error) throw error;
    textures.forEach((texture, index) => {
      fs.writeFile(path.join(__dirname, `output/${texture.filename}`), texture.texture, (err) => {
        if (err) throw err;
        console.log('wrote spritesheet[', index, '] : ', texture.filename);
      });
      if (opt.debug) {
        const handlebars = require('handlebars');
        const svgTemplate = 
        `<?xml version="1.0"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="{{width}}" height="{{height}}">
{{{svgPath}}}
</svg>`;
        const template = handlebars.compile(svgTemplate);
        const content = template({
          width: opt.textureWidth,
          height: opt.textureHeight,
          svgPath: texture.svg
        });
        fs.writeFile(path.join(__dirname, `output/${texture.filename}.svg`), content , (err) => {
          if (err) throw err;
          console.log('wrote svg[', index, ']         : ', `${texture.filename}.svg`);
        });
      }
    });
    fs.writeFile(path.join(__dirname, `output/${font.filename}`), font.data, (err) => {
      if (err) throw err;
      console.log('wrote font file        : ', font.filename);
    });
  });
});

