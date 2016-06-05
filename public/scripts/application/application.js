// Framework

var application = application || (function () {

  'use strict';

  // Private space

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
    // Initialize renderer
    application.renderer.initialize(canvas);
    // Resize event
    window.addEventListener('resize', function(event){
      application.renderer.resize();
    });
    // Initialize GUI
    _initializeGUI();
    // Start rendering
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
      value = application.utilities.destructureRGBColor(value);
      application.renderer.updateBackgroundColor(value);
    });
    _gui.add(controls, "clear");
  };

  var _tick = function tick(){
    // Actions
    application.renderer.tick();
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
