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

    hexademical_to_rgb : function(hexademical){
      hexademical = parseInt('0x' + hexademical.substring(1));
      var r = hexademical >> 16;
      var g = hexademical >> 8 & 0xFF;
      var b = hexademical & 0xFF;
      return [r, g, b];
    },
    rgb_to_hexademical : function(r, g, b){
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    destructure_rgb_color : function(color){
      return {
        r : color[0] / 255.0,
        g : color[1] / 255.0,
        b : color[2] / 255.0
      }
    }
  };

  application.utilities = utilities;

}();
