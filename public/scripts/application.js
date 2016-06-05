// Framework

var application = application || (function () {

  'use strict';

  // Private space

  var _canvas = null;
  var _width = null;
  var _height = null;
  var _gui = null;

  var _initialize = function(canvas){

    // Check application availability

    if (typeof application.renderer == "undefined") {
      console.log("application.js : No 'renderer' module found! Be sure to load it up first!");
      return;
    };

    if (typeof application.utilities == "undefined") {
      console.log("application.js : No 'utilities' module found! Be sure to load it up first!");
      return;
    };

    // Setup polyfills

    _initializeRequestAnimationFrame();

    // Get canvas

    _canvas = document.getElementById(canvas);
    _width = canvas.offsetWidth;
    _height = canvas.offsetHeight;

    // Get context

    application.renderer.context = _canvas.getContext("experimental-webgl");
    application.renderer.context.viewport(0, 0, _canvas.width, _canvas.height);

    // Initialize systems

    _initializeGUI();
    _tick();
  };

  var _initializeRequestAnimationFrame = function(){
    if (!window.requestAnimationFrame){
      window.requestAnimationFrame = (function(){
        return window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function(callback, element){
          window.setTimeout(callback, 1000 / 60);
        };
      })();
    };
  }

  var _initializeGUI = function(){

    // References

    var background_color = application.renderer.params.colors.background;
    var particles_color = application.renderer.params.colors.particles;

    // Controls

    var controls = {
      background: [background_color.r * 255, background_color.g * 255, background_color.b * 255],
      particles: [particles_color.r * 255, particles_color.g * 255, particles_color.b * 255],
      clear: function() {
        _clear();
      }
    };

    // Setup GUI

    _gui = new dat.GUI();
    _gui.addColor(controls, "background").onChange(function(value) {
      if (value[0] === "#") value = application.utilities.hexademicalToRGB(value);
      application.renderer.params.colors.background.r = value[0] / 255.0;
      application.renderer.params.colors.background.g = value[1] / 255.0;
      application.renderer.params.colors.background.b = value[2] / 255.0;
    });
    _gui.addColor(controls, "particles").onChange(function(value) {
      if (value[0] === "#") value = application.utilities.hexademicalToRGB(value);
      application.renderer.params.colors.particles.r = value[0] / 255.0;
      application.renderer.params.colors.particles.g = value[1] / 255.0;
      application.renderer.params.colors.particles.b = value[2] / 255.0;
    });
    _gui.add(controls, "clear");
  };

  var _tick = function tick(){

    // Actions

    application.renderer.clear();

    // Setup the next frame

    requestAnimationFrame(tick);
  }

  // Public space

  return {

    // Initialize the application

    initialize: function (canvas) {
      _initialize(canvas);
    }
  };
})();
