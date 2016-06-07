// Framework

var application = application || (function () {

  'use strict';

  // Private space

  var K_ROTATE = 0.005;
  var K_PAN = 0.005;
  var K_ZOOM = 0.005;
  var K_ZOOM_WHEEL = 0.5;

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

    _initialize_request_animation_frame();

    // Initialize the renderer module

    application.renderer.initialize(canvas);

    // Resize event

    window.addEventListener('resize', function(event){
      application.renderer.resize();
    });

    // Initialize

    _initialize_gui();
    _mouse_init();
    _keyboard_init();
    _tick();
  };

  var _initialize_request_animation_frame = function(){
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

  var _initialize_gui = function(){

    // References

    var background_color = application.renderer.params.colors.background;
    var particles_color = application.renderer.params.colors.particles;

    // Controls

    var controls = {
      background: [background_color.r * 255, background_color.g * 255, background_color.b * 255],
      screenshot: function() {
        application.renderer.screenshot();
      }
    };

    // Setup GUI

    _gui = new dat.GUI();
    _gui.addColor(controls, "background").onChange(function(value) {
      if (value[0] === "#") value = application.utilities.hexademical_to_rgb(value);
      value = application.utilities.destructure_rgb_color(value);
      application.renderer.update_background_color(value);
    });
    _gui.add(controls, "screenshot");
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

    Mousetrap.bind("z", function() {
      application.renderer.camera_reset();
    });

    // Control mode

    Mousetrap.bind("alt", function() {
      _control_cam = true;
      return false;
    }, "keydown");
    Mousetrap.bind("alt", function() {
      _control_cam = false;
      return false;
    }, "keyup");

    // Control mode

    Mousetrap.bind("space", function() {
      application.renderer.simulation_switch();
      return false;
    });
  };

  var _mouse_init = function() {

    // Disable the context menu

    window.oncontextmenu = function() { return false; };

    // On mouse move

    window.addEventListener("mousemove", function(event) {
      _mouse.dx = event.pageX - _mouse.x;
      _mouse.dy = event.pageY - _mouse.y;
      _mouse.x = event.pageX;
      _mouse.y = event.pageY;
      event.preventDefault();
    });

    // On mouse down

    window.addEventListener("mousedown", function(event) {
      _mouse.buttons[event.which] = true;
      event.preventDefault();
    });

    // On mouse up

    window.addEventListener("mouseup", function(event) {
      _mouse.buttons[event.which] = false;
      event.preventDefault();
    });

    // On mouse wheel

    var mouse_wheel = function(event) {
      var delta = 0;
      if (!event) event = window.event;
      if (event.wheelDelta) {
        delta = event.wheelDelta / 120;
      } else if (event.detail) {
        delta = -event.detail / 3;
      }
      if (delta) {
        if (delta < 0) application.renderer.camera_zoom(-K_ZOOM_WHEEL);
        else application.renderer.camera_zoom(K_ZOOM_WHEEL);
      }
      if (event.preventDefault) event.preventDefault();
      event.returnValue = false;
    }

    if (window.addEventListener) window.addEventListener('DOMMouseScroll', mouse_wheel, true);
    window.onmousewheel = document.onmousewheel = mouse_wheel;
  };

  var _mouse_update = function() {

    // Update camera

    if (_control_cam) {
      if (_mouse.buttons[1]) {
        application.renderer.camera_rotate(K_ROTATE * _mouse.dx, K_ROTATE * _mouse.dy);
      }
      else if (_mouse.buttons[2]) {
        application.renderer.camera_pan(K_PAN * _mouse.dx, -K_PAN * _mouse.dy);
      }
      else if (_mouse.buttons[3]) {
        application.renderer.camera_zoom(K_ZOOM * _mouse.dy);
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
