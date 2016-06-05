// Utilities

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("utilities.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  var utilities = {

    // Methods

    hexademicalToRGB : function(hexademical){
      hexademical = parseInt('0x' + hexademical.substring(1));
      var r = hexademical >> 16;
      var g = hexademical >> 8 & 0xFF;
      var b = hexademical & 0xFF;
      return [r, g, b];
    },
    RGBtoHexademical : function(r, g, b){
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  };

  application.utilities = utilities;

}();
