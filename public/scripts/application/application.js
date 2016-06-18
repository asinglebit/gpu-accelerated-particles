// Framework

var application = application || (function () {

  'use strict';

  // Private space

  var K_ROTATE = 0.005;
  var K_PAN = 0.05;
  var K_ZOOM = 0.05;
  var K_ZOOM_WHEEL = 10;

  var _gui = null;
  var _mouse = {x: 0, y: 0, dx: 0, dy: 0, buttons: new Array(4)};
  var _click_mode = false;
  var _current_buffer = 0;
  var _paused = true;

  var _initialize = function(canvas){

    // Check application

    if (typeof application.audio == "undefined") {
      console.log("application.js : No 'audio' module found! Be sure to load it up first!");
      return;
    };
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

    // Initialize modules

    application.audio.initialize();
    application.renderer.initialize(canvas);

    // Resize event

    window.addEventListener('resize', function(event){
      application.renderer.resize();
    });

    // Initialize

    setTimeout(function(){
      _show_ui();
      _mouse_init();
      _keyboard_init();
      _tick();      
      application.audio.play();
    }, 0);
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

    // Reset simulation

    Mousetrap.bind("r", function() {
      application.renderer.simulation_reset();
    });

    // Change rendering buffer

    Mousetrap.bind("b", function() {
      _change_buffer();
    });

    // Control mode

    Mousetrap.bind("ctrl", function() {
      _click_mode = true;
      return false;
    }, "keydown");
    Mousetrap.bind("ctrl", function() {
      _click_mode = false;
      return false;
    }, "keyup");

    // Control mode

    Mousetrap.bind("space", function() {
      _paused = !_paused;
      if (_paused){
        _show_ui();
        application.audio.set_muffle(200);
      } else {
        _hide_ui();
        application.audio.set_muffle(2000);
      }
      application.audio.play();
      application.renderer.pause(_paused);
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
      if (_click_mode){
        switch (event.which){
          case 1:
          application.renderer.gravity_update(_mouse.x, _mouse.y);
          break;
          case 2:
          // Middle click
          break;
          case 3:
          // Right click
          break;
        }
      } else {
        _mouse.buttons[event.which] = true;
      }
      event.preventDefault();
    });

    // On mouse up

    window.addEventListener("mouseup", function(event) {
      if (!_click_mode){
        _mouse.buttons[event.which] = false;
      }
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

    if (_mouse.buttons[1]) {
      application.renderer.camera_rotate(K_ROTATE * _mouse.dx, K_ROTATE * _mouse.dy);
    }
    else if (_mouse.buttons[2]) {
      application.renderer.camera_pan(K_PAN * _mouse.dx, -K_PAN * _mouse.dy);
    }
    else if (_mouse.buttons[3]) {
      application.renderer.camera_zoom(K_ZOOM * _mouse.dy);
    }

    _mouse.dx = 0.0;
    _mouse.dy = 0.0;
  };

  // User interface

  var _hide_ui = function(){
    var logo_holder = document.getElementById('logo-holder');
    logo_holder.className = "";
    var info = document.getElementById('info');
    info.className = "";
  };

  var _show_ui = function(){
    var logo_holder = document.getElementById('logo-holder');
    logo_holder.className = "visible";
    var info = document.getElementById('info');
    info.className = "visible";
  };

  var _change_buffer = function(){
    if (_current_buffer == 2) _current_buffer = 0;
    else ++_current_buffer;
    application.renderer.change_buffer(_current_buffer);
    var buffer_caption = document.getElementById('buffer_caption');
    switch (_current_buffer){
      case 0:
      buffer_caption.innerHTML = "RENDER";
      break;
      case 1:
      buffer_caption.innerHTML = "POSITION";
      break;
      case 2:
      buffer_caption.innerHTML = "VELOCITY";
      break;
    }
    var buffer_caption_holder = document.getElementById('buffer_caption_holder');
    buffer_caption_holder.className = "";
    buffer_caption_holder.style.opacity = 1;
    setTimeout(function(){
      buffer_caption_holder.className = "hidden";
    },100);
  }

  // Public space

  return {

    // Initialize the application

    initialize: function (canvas) {
      _initialize(canvas);
    }

  };

})();
