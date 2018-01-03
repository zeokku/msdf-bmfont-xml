#!/usr/bin/env node

const pjson = require('./package.json');
const generateBMFont = require('./index');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
// const args = require('commander');
const utils = require('./lib/utils');

const yargs = require('yargs');

yargs
  .usage('$0 [options] <font-file>', 'Creates a BMFont compatible bitmap font of signed distance fields from a font file', (yargs) => {
    yargs.positional('font-file', { type: 'string', desc: 'Font file, supported format: OTF, TTF, WOFF' })
  })
  .example('$0 -o path/to/atlas.png -m 512,256 -s 42 -t msdf path/to/font.ttf', 'generate a 512x256 multichannel-sdf atlas with font-size=42')
  .locale('en')
  .options({
    'output-type':    { alias: 'f', type: 'string', choice: ['xml', 'json'], requiresArg: true, default: 'xml', desc: 'font-file format' },
    'filename':       { alias: 'o', type: 'string', requiresArg: true, desc: 'filename of font textures (defaut: font-face) font filename always set to font-face name'},
    'font-size':      { alias: 's', type: 'number', requiresArg: true, default: 42, desc: 'font size for generated textures (default: 42)' },
    'charset-file':   { alias: 'i', type: 'string', desc: 'user-specified charactors from text-file' },
    'texture-size':   { alias: 'm', type: 'array', requiresArg: true, default: [512, 512], desc: 'user-specified charactors from text-file' },
    'texture-padding':{ alias: 'p', type: 'number', requiresArg: true, default: 1, desc: 'padding between glyphs (default: 1)' },
    'distance-range': { alias: 'r', type: 'number', requiresArg: true, default: 1, desc: 'distance range for SDF (default: 4)' },
    'field-type':     { alias: 't', type: 'string', choice: ['msdf', 'sdf', 'psdf', 'svg'], requiresArg: true, default: 'msdf', desc: 'msdf(default) | sdf | psdf | svg' },
    'round-decimal':  { alias: 'd', type: 'number', requiresArg: true, default: 0, desc: 'rounded digits of the output font file. (Defaut: 0)' },
    'vector':         { alias: 'v', type: 'boolean', desc: 'generate svg vector file for debuging' },
    'reuse':          { alias: 'u', type: 'string', desc: 'save/create config file for reusing settings' },
    'smart-size':     { type: 'boolean', group: 'Atlas control', desc: 'shrink atlas to the smallest possible square (Default: false)' },
    'pot':            { type: 'boolean', group: 'Atlas control', desc: 'atlas size shall be power of 2 (Default: false)' },
    'square':         { type: 'boolean', group: 'Atlas control', desc: 'atlas size shall be square (Default: false)' },
  })
  .version()
  .help()
  .argv;

// args
//   .version('msdf-bmfont-xml v' + pjson.version)
//   .usage('[options] <font-file>')
//   .arguments('<font_file>')
//   .description('Creates a BMFont compatible bitmap font of signed distance fields from a font file')
//   .option('-f, --output-type <format>', 'font file format: xml(default) | json', 'xml')
//   .option('-o, --filename <atlas_path>', 'filename of font textures (defaut: font-face) font filename always set to font-face name')
//   .option('-s, --font-size <fontSize>', 'font size for generated textures (default: 42)')
//   .option('-i, --charset-file <charset>', 'user-specified charactors from text-file')
//   .option('-m, --texture-size <w,h>', 'user-specified charactors from text-file', (v) => {return v.split(',')})
//   .option('-p, --texture-padding <n>', 'padding between glyphs (default: 1)')
//   .option('-r, --distance-range <n>', 'distance range for SDF (default: 4)')
//   .option('-t, --field-type <type>', 'msdf(default) | sdf | psdf | svg')
//   .option('-d, --round-decimal <digit>', 'rounded digits of the output font file. (Defaut: 0)', 0)
//   .option('-v, --vector', 'generate svg vector file for debuging')
//   .option('-u, --reuse <file.cfg>', 'save/create config file for reusing settings')
//   .option('    --tolerance <value>', 'use point tolerance to filter problematic vector shape (Defaut: 0)', 0)
//   .option('    --smart-size', 'shrink atlas to the smallest possible square (Default: false)', false)
//   .option('    --pot', 'atlas size shall be power of 2 (Default: false)', false)
//   .option('    --square', 'atlas size shall be square (Default: false)', false)
//   .action(function(file){
//     fontFile = file;
//   }).parse(process.argv);

const opt = yargs.argv;
opt.fontFile = opt._[0];
utils.roundAllValue(opt); // Parse all number from string
const keys = Object.keys(opt)
const padding = longestLength(keys) + 2;
console.log("\nUsing following settings");
console.log("========================================");
keys.forEach(key => {
  console.log(pad(key, padding) + ": " + opt[key]);
});
console.log("========================================");

if (typeof opt.fontFile === 'undefined') {
  console.error('No font file specified, aborting.... use -h for help');
  process.exit(1);
}
fs.readFile(opt.charsetFile || '', 'utf8', (error, data) => {
  if (error) {
    console.warn('No valid charset file loaded, fallback to ASC-II');
  }
  if (data) opt.charset = data;
  
  generateBMFont(opt.fontFile, opt, (error, textures, font) => {
    if (error) throw error;
    textures.forEach((texture, index) => {
      if (opt.vector) {
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
        fs.writeFile(`${texture.filename}.svg`, content , (err) => {
          if (err) throw err;
          console.log('wrote svg[', index, ']         : ', `${texture.filename}.svg`);
        });
      } 
      fs.writeFile(`${texture.filename}.png`, texture.texture, (err) => {
        if (err) throw err;
        console.log('wrote spritesheet[', index, '] : ', `${texture.filename}.png`);
      });
    });
    fs.writeFile(font.filename, font.data, (err) => {
      if (err) throw err;
      console.log('wrote font file        : ', font.filename);
    });
    if(opt.reuse !== false) {
      fs.writeFile(`${textures[0].filename}.cfg`, JSON.stringify(font.settings, null, '\t'), (err) => {
        if (err) throw err;
        console.log('wrote cfg file         : ', `${textures[0].filename}.cfg`);
      });
    }
  });
});

/**
 * Pad `str` to `width`.
 *
 * @param {String} str
 * @param {Number} width
 * @return {String}
 * @api private
 */
function pad(str, width) {
  var len = Math.max(0, width - str.length);
  return str + Array(len + 1).join(' ');
}

/**
 * Return the largest length of string array.
 *
 * @param {Array.<String>} arr
 * @return {Number}
 * @api private
 */

function longestLength(arr) {
  return arr.reduce((max, element) => {
    return Math.max(max, element.length);
  }, 0);
};