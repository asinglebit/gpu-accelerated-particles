// Framework

var application = application || (function () {

  'use strict';

  // Private space

  var K_ROTATE = 0.01;
  var K_PAN = 0.01;
  var K_ZOOM = 0.01;

  var _canvas = null;
  var _gui = null;
  var _mouse = {x: 0, y: 0, dx: 0, dy: 0, buttons: new Array(4)};
  var _control_cam = false;

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

    // Initialize the renderer module

    _canvas = document.getElementById(canvas);
    application.renderer.initialize(_canvas);

    // Resize event

    window.addEventListener('resize', function(event){
      application.renderer.resize();
    });

    // Initialize

    _initializeGUI();
    _mouse_init();
    _keyboard_init();
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
      clear: function() {
        application.renderer.clear();
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

    _mouse_update();
    application.renderer.tick();

    // Setup the next frame

    requestAnimationFrame(tick);
  }

  // Controls

  var _keyboard_init = function() {

    // Reset camera

    Mousetrap.bind("shift+r", function() {
      application.renderer.resetCamera();
    });

    // Control mode

    Mousetrap.bind("alt", function() {
      _control_cam = true;
      return false;
    }, "keydown");
    Mousetrap.bind("alt", function() {
      _control_cam = false;
      return false;
    }, "keyup");;
  };

  var _mouse_init = function() {

    // Disable the context menu

    _canvas.oncontextmenu = function() { return false; };

    // On mouse move

    _canvas.addEventListener("mousemove", function(event) {
      _mouse.dx = event.pageX - _mouse.x;
      _mouse.dy = event.pageY - _mouse.y;
      _mouse.x = event.pageX;
      _mouse.y = event.pageY;
      event.preventDefault();
    });

    // On mouse down

    _canvas.addEventListener("mousedown", function(event) {
      _mouse.buttons[event.which] = true;
      event.preventDefault();
    });

    // On mouse up

    _canvas.addEventListener("mouseup", function(event) {
      _mouse.buttons[event.which] = false;
      event.preventDefault();
    });
  };

  var _mouse_update = function() {

    // Update camera

    if (_control_cam) {
      if (_mouse.buttons[1]) {
        application.renderer.rotateCamera(K_ROTATE * _mouse.dx, K_ROTATE * _mouse.dy);
      }
      else if (_mouse.buttons[2]) {
        application.renderer.panCamera(K_PAN * _mouse.dx, -K_PAN * _mouse.dy);
      }
      else if (_mouse.buttons[3]) {
        application.renderer.zoomCamera(K_ZOOM * _mouse.dy);
      }
    }
    _mouse.dx = 0.0;
    _mouse.dy = 0.0;
  };

  // Public space

  return {

    // Initialize the application

    initialize: function (canvas) {
      _initialize(canvas);
    }

  };

})();
