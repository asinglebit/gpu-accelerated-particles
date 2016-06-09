// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Private members

  var _canvas = null;
  var _context = null;
  var _width = null;
  var _height = null;

  var _rtt_frame_buffer = null;
  var _rtt_texture = null;

  var _camera = null;
  var _paused = false;

  var _textures = [{ url : "resources/blank.png" }];
  var _shaders = [];
  var _objects = [];

  // Private methods

  var _initialize = function(canvas){

    // Get context

    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true });
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);

    // Initialize camera

    _camera = new application.constructors.camera(100, 0.1, 100.0, window.innerWidth/window.innerHeight);

    // Resize viewport

    _resize();
    _clear();

    // Initialize systems

    _init_textures(_init_objects);
    _init_shaders();

    _init_frame_buffer();
  };

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
    _camera.aspect = _width/_height;
    _camera.update();
  }

  var _tick = function(){

    // Clear background

    _clear();
    _camera.update();

    _context.bindFramebuffer(_context.FRAMEBUFFER, _rtt_frame_buffer);
    _clear();
    for (var i = 0; i < _objects.length; i++) {
      _objects[i].render(_textures[0].texture);
    }
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _clear();
    for (var i = 0; i < _objects.length; i++) {
      _objects[i].render();
    }
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 0.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Frame buffer

  var _init_frame_buffer = function(){
    _rtt_frame_buffer = _context.createFramebuffer();
    _context.bindFramebuffer(_context.FRAMEBUFFER, _rtt_frame_buffer);
    _rtt_frame_buffer.width = _width;
    _rtt_frame_buffer.height = _height;

    _rtt_texture = _context.createTexture();
    _context.bindTexture(_context.TEXTURE_2D, _rtt_texture);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.NEAREST);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.NEAREST);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, _context.CLAMP_TO_EDGE);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, _context.CLAMP_TO_EDGE);
    _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, _rtt_frame_buffer.width, _rtt_frame_buffer.height, 0, _context.RGBA, _context.UNSIGNED_BYTE, null);

    var renderbuffer = _context.createRenderbuffer();
    _context.bindRenderbuffer(_context.RENDERBUFFER, renderbuffer);
    _context.renderbufferStorage(_context.RENDERBUFFER, _context.DEPTH_COMPONENT16, _rtt_frame_buffer.width, _rtt_frame_buffer.height);

    _context.framebufferTexture2D(_context.FRAMEBUFFER, _context.COLOR_ATTACHMENT0, _context.TEXTURE_2D, _rtt_texture, 0);
    _context.framebufferRenderbuffer(_context.FRAMEBUFFER, _context.DEPTH_ATTACHMENT, _context.RENDERBUFFER, renderbuffer);

    _context.bindTexture(_context.TEXTURE_2D, null);
    _context.bindRenderbuffer(_context.RENDERBUFFER, null);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
  }

  // Object constructors

  var _cube = function(x, y, z, texture){
    var cube = {};

    cube.vertices_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertices_buffer);
    var vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertices), _context.STATIC_DRAW);

    cube.vertices_normal_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertices_normal_buffer);
    var vertexNormals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertexNormals), _context.STATIC_DRAW);

    cube.vertices_texture_coord_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertices_texture_coord_buffer);
    var textureCoordinates = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(textureCoordinates), _context.STATIC_DRAW);

    cube.vertices_index_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, cube.vertices_index_buffer);
    var cubeVertexIndices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    _context.bufferData(_context.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), _context.STATIC_DRAW);

    // Initialize matrices

    cube.model_matrix = mat4.create();
    cube.model_view_matrix = mat4.create();
    if (x && y && z){
      mat4.translate(cube.model_matrix, cube.model_matrix, [x, y, z]);
      mat4.mul(cube.model_view_matrix, _camera.view_matrix, cube.model_matrix);
    }

    // Rendering

    cube.render = function(_texture){

      // Update models matrices

      if (_paused) mat4.rotate(cube.model_matrix, cube.model_matrix, 0.03, [-0.4, -0.3, 0.5]);
      mat4.mul(cube.model_view_matrix, _camera.view_matrix, cube.model_matrix);

      // Update shaders

      _context.useProgram(_shaders[0].program);
      _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertices_buffer);
      _context.vertexAttribPointer(_shaders[0].attributes.aVertexPosition.location, 3, _context.FLOAT, false, 0, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertices_texture_coord_buffer);
      _context.vertexAttribPointer(_shaders[0].attributes.aTextureCoord.location, 2, _context.FLOAT, false, 0, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER,cube.vertices_normal_buffer);
      _context.vertexAttribPointer(_shaders[0].attributes.aVertexNormal.location, 3, _context.FLOAT, false, 0, 0);
      _context.activeTexture(_context.TEXTURE0);
      _context.bindTexture(_context.TEXTURE_2D, _texture || texture);
      _context.uniform1i(_shaders[0].uniforms.uSampler.location, 0);
      _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, cube.vertices_index_buffer);

      // Set up transformations

      _context.uniformMatrix4fv(_shaders[0].uniforms.uPMatrix.location, false, _camera.projection_matrix);
      _context.uniformMatrix4fv(_shaders[0].uniforms.uMVMatrix.location, false, cube.model_view_matrix);
      var _normal_matrix = mat4.create();
      mat4.invert(_normal_matrix, cube.model_view_matrix);
      mat4.transpose(_normal_matrix, _normal_matrix);
      _context.uniformMatrix4fv(_shaders[0].uniforms.uNormalMatrix.location, false, new Float32Array(_normal_matrix));

      // Draw

      _context.drawElements(_context.TRIANGLES, 36, _context.UNSIGNED_SHORT, 0);
    }

    return cube;
  }

  // Initialize textures

  var _init_textures = function(callback) {
    for (var i = 0; i < _textures.length; ++i) {
      _textures[i].texture = _context.createTexture();
      var image = new Image();
      image.src = _textures[i].url;
      void function(_i, _image){
        image.onload = function() {
          _context.bindTexture(_context.TEXTURE_2D, _textures[_i].texture);
          _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, _context.RGBA, _context.UNSIGNED_BYTE, _image);
          _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.LINEAR);
          _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.LINEAR_MIPMAP_NEAREST);
          _context.generateMipmap(_context.TEXTURE_2D);
          _context.bindTexture(_context.TEXTURE_2D, null);
          callback();
        };
      }(i, image);
    }
  };

  // Initialize objects

  var _init_objects = function(){
    for (var i = -4; i < 5; ++i){
      if (i == 0) ++i;
      for (var j = -4; j < 5; ++j){
        if (j == 0) ++j;
        for (var k = -4; k < 5; ++k){
          if (k == 0) ++k;
          _objects.push(_cube(j*3, k*3, i*3, _textures[0].texture));
        }
      }
    }
    _objects.unshift(_cube(0, 0, 0, _rtt_texture));
  }

  // Initialize shaders

  var _init_shaders = function(){
    for (var i = 0; i < _shaders.length; ++i) {

      // Vertex and fragment shader

      var vertexShader = _context.createShader(_context.VERTEX_SHADER);
      _context.shaderSource(vertexShader, _shaders[i].vertexSource);
      _context.compileShader(vertexShader);
      var fragmentShader = _context.createShader(_context.FRAGMENT_SHADER);
      _context.shaderSource(fragmentShader, _shaders[i].fragmentSource);
      _context.compileShader(fragmentShader);

      // Shader program

      _shaders[i].program = _context.createProgram();
      _context.attachShader(_shaders[i].program, vertexShader);
      _context.attachShader(_shaders[i].program, fragmentShader);
      _context.linkProgram(_shaders[i].program);

      // Bind attributes and uniforms

      for (var attribute in _shaders[i].attributes) {
        _shaders[i].attributes[attribute].location = _context.getAttribLocation(_shaders[i].program, attribute);
        _context.enableVertexAttribArray(_shaders[i].attributes[attribute].location);
      }
      for (var uniform in _shaders[i].uniforms) {
        _shaders[i].uniforms[uniform].location = _context.getUniformLocation(_shaders[i].program, uniform);
      }
    }
  }

  // Data bindings

  var _update_background_color = function(color){
    this.params.colors.background = color;
  }

  var _add_shader = function(shader){
    _shaders.push(shader);
  }

  // Miscellaneous

  var _screenshot = function(){
    var url = _canvas.toDataURL();
    window.open(url, "screenshot", "width=" + _canvas.width + " height=" + _canvas.height + " scrollbars=no, resizable=no");
  }

  // Public

  var renderer = {

    // Public members

    params : {
      colors: {
        background: {r: 0, g: 0, b: 0}
      }
    },

    // Public methods

    initialize : _initialize,
    resize : _resize,
    tick : _tick,
    clear : _clear,
    add_shader : _add_shader,

    // Controls

    update_background_color : _update_background_color,
    camera_reset : function(){ _camera.reset(); },
    camera_rotate : function(x, y){ _camera.rotate(x, y); },
    camera_pan : function(x, y){ _camera.pan(x, y); },
    camera_zoom : function(value){ _camera.zoom(value); },
    pause : function(){ _paused = !_paused; },

    // Miscellaneous

    screenshot : _screenshot
  };

  application.renderer = renderer;
}();
