const generateBMFont = require('../index');
const fs = require('fs');
const path = require('path');

const opt = {
  outputType: "xml",
  filename: "font",
  fieldType: "msdf",
  fontSize: 42,
  distanceRange: 5,
  roundDecimal: 0
};
generateBMFont(path.join(__dirname, 'DIN_CB.ttf'), opt , (error, textures, font) => {
  if (error) throw error;
  textures.forEach((texture, index) => {
    fs.writeFile(path.join(__dirname, texture.filename), texture.texture, (err) => {
      if (err) throw err;
      console.log('wrote spritesheet[', index, '] : ', texture.filename);
    });
  });
  fs.writeFile(path.join(__dirname, font.filename), font.data, (err) => {
    if (err) throw err;
    console.log('wrote font file        : ', font.filename);
  });
});
