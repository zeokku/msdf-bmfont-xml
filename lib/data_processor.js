"use strict";

const js2xmlparser = require('js2xmlparser');
const js2xmlOption = { format: { doubleQuotes: true } };

/**
 * Round all number value in a javascript object at given decimal
 * 
 * @param {any} obj - Javascript object to be rounded 
 * @param {number} [decimal=0] - Round at this decimal 
 */
function roundAllValue (obj, decimal = 0) {
  Object.keys(obj).forEach(key => {
    if (typeof(obj[key]) === "object" && obj[key] !== null) {
      roundAllValue (obj[key], decimal);
    } else if(isNumeric(obj[key])) {
      obj[key] = roundNumber(obj[key], decimal);
    }
  });
}
exports.roundAllValue = roundAllValue;

/**
 * Round a given value at desire decimal
 * 
 * @param {number} num 
 * @param {number} scale 
 */
function roundNumber(num, scale) {
  if(!("" + num).includes("e")) {
    return +(Math.round(num + "e+" + scale)  + "e-" + scale);
  } else {
    const arr = ("" + num).split("e");
    let sig = ""
    if(+arr[1] + scale > 0) {
      sig = "+";
    }
    return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
  }
}
exports.roundNumber = roundNumber;

/**
 * Stringify javascript object to BMFont compatible json or xml
 * 
 * @param {Object} data - Java object data 
 * @param {string} outputType - Type of output "xml"(default) "json"
 * 
 */
function stringify(data, outputType) {
  if (outputType === "json") {
    return toJSON(data);
  } else {
    return toBMFontXML(data);
  }
}
exports.stringify = stringify;

function toJSON(data) {
  return JSON.stringify(data);
}

function toBMFontXML(data) {
  let xmlData = {};
  
  // Reorganize data structure
  // Definition: http://www.angelcode.com/products/bmfont/doc/file_format.html

  // info section
  xmlData.info = {};
  xmlData.info['@'] = data.info;
  xmlData.info['@'].padding = stringifyArray(data.info.padding, ',');
  xmlData.info['@'].spacing = stringifyArray(data.info.spacing, ',');
  // xmlData.info['@'].charset = stringifyArray(data.info.charset);
  xmlData.info['@'].charset = ""; 

  // common section
  xmlData.common = {};
  xmlData.common['@'] = data.common;

  // pages section, page shall be inserted later in module function callback
  xmlData.pages = {};
  xmlData.pages.page = []; 
  data.pages.forEach((p, i) => {
    let page = {};
    page['@'] = {id: i, file: p};
    xmlData.pages.page.push(page);
  });

  // chars section
  xmlData.chars = {'@': {}};
  xmlData.chars['@'].count = data.chars.length;
  xmlData.chars.char = [];
  data.chars.forEach(c =>{
    let char = {};
    char['@'] = c;
    xmlData.chars.char.push(char);
  });

  // kernings section
  xmlData.kernings = {'@': {}};
  xmlData.kernings['@'].count = data.kernings.length;
  xmlData.kernings.kerning = [];
  data.kernings.forEach(k => {
    let kerning = {};
    kerning['@'] = k;
    xmlData.kernings.kerning.push(kerning);
  });
  
  return js2xmlparser.parse("font", xmlData, js2xmlOption);
}

function stringifyArray(array, seperator = "") {
  let result = "";
  let lastIndex = array.length - 1;
  array.forEach((element, index) => {
    result += element;
    if (index !== lastIndex){
      result += seperator;
    }
  });
  return result;
}

function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

