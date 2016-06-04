var Utilities = {
  hexademicalToRGB : function(hexademical){
    hexademical = parseInt('0x' + hexademical.substring(1));
    var r = hexademical >> 16;
    var g = hexademical >> 8 & 0xFF;
    var b = hexademical & 0xFF;
    return [r, g, b];
  }
};
