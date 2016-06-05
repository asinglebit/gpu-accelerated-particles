// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  var _context = null;
  var _canvas = null;
  var _width = null;
  var _height = null;
  var _shaders = [];

  // Methods

  var _initialize = function(canvas){
    _canvas = document.getElementById(canvas);
    _width = _canvas.offsetWidth;
    _height = _canvas.offsetHeight;
    _context = _canvas.getContext("webgl");
    _context.viewport(0, 0, _canvas.width, _canvas.height);
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);
  };

  var _tick = function(){
    _clear();
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  var renderer = {

    // Members

    params : {
      colors: {
        background: {r: 0.2, g: 0.2, b: 0.2},
        particles: {r: 0.9, g: 0.9, b: 0.9}
      }
    },

    // Methods

    initialize : _initialize,
    tick : _tick,
    clear : _clear,

    updateBackgroundColor : function(color){
      this.params.colors.background = color;
    }
  };

  application.renderer = renderer;
}();
