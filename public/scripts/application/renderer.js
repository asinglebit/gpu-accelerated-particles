// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Private members

  var FRAME_BUFFER_COUNT = 1;
  var TEXTURES_PER_FRAME_BUFFER_COUNT = 3;

  var _canvas = null;
  var _context = null;
  var _extensions = [];
  var _width = null;
  var _height = null;

  var _paused = false;

  var _camera = null;
  var _full_screen_quad = null;
  var _frame_buffers = [];

  var _textures = [{ url : "resources/blank.jpg" }];
  var _shaders = [];
  var _objects = [];

  // Private methods

  var _initialize = function(canvas){

    // Get context

    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true });
    //_context = WebGLDebugUtils.makeDebugContext(_canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true }));
    _extensions.push({ name : 'OES_texture_float', extension : _context.getExtension('OES_texture_float') });
    _extensions.push({ name : 'WEBGL_draw_buffers', extension : _context.getExtension('WEBGL_draw_buffers') });
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);

    // Initialize camera

    _camera = new application.constructors.camera(100, 0.1, 100.0, window.innerWidth / window.innerHeight);

    // Resize viewport

    _resize();
    _clear();
    _loading();

    // Initialize systems

    // TODO: Refactor this, its disgusting
    /*_init_textures(function(){
      _init_objects();
      _loading_complete();
    });*/

    _loading_complete();
    _init_frame_buffers();
    _init_full_screen_quad();
    _init_shaders();
  };

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
    _camera.aspect = _width/_height;
    _camera.update();
    _delete_frame_buffers();
    _init_frame_buffers();
  }

  var _loading = function(){
    renderer.tick = _tick_loading;
  }

  var _loading_complete = function(){
    renderer.tick = _tick_ready;
  }

  var _tick_loading = function(){
    _clear();
  };

  var _tick_ready = function(){
    _clear();
    _camera.update();
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers[0].frame_buffer);
    /*_clear();
    for (var i = 0; i < _objects.length; i++) _objects[i].render(_textures[0].texture);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _full_screen_quad.render();*/
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 0.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Initialize objects

  var _object = function(vertices, indices, normals, uvs){
    if (vertices){
      this.vertex_buffer = _context.createBuffer();
      _context.bindBuffer(_context.ARRAY_BUFFER, this.vertex_buffer);
      _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertices), _context.STATIC_DRAW);
    }
    if (indices){
      this.index_buffer = _context.createBuffer();
      _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, this.index_buffer);
      _context.bufferData(_context.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), _context.STATIC_DRAW);
    }
    if (normals){
      this.normal_buffer = _context.createBuffer();
      _context.bindBuffer(_context.ARRAY_BUFFER, this.normal_buffer);
      _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(normals), _context.STATIC_DRAW);
    }
    if (uvs){
      this.uv_buffer = _context.createBuffer();
      _context.bindBuffer(_context.ARRAY_BUFFER, this.uv_buffer);
      _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(uvs), _context.STATIC_DRAW);
    }

    this.model_matrix = mat4.create();
    this.model_view_matrix = mat4.create();
    this.render = function(){};
  }

  var _init_full_screen_quad = function(){
    var vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0];
    var indices = [0, 1, 2, 0, 2, 3];
    _full_screen_quad = new _object(vertices, indices, null, null);

    _full_screen_quad.render = function(){

      // Update shaders

      _context.useProgram(_shaders[0].program);
      _context.bindBuffer(_context.ARRAY_BUFFER, _full_screen_quad.vertex_buffer);
      _context.vertexAttribPointer(_shaders[0].attributes.a_vertex_position.location, 3, _context.FLOAT, false, 0, 0);
      _context.activeTexture(_context.TEXTURE0);
      _context.bindTexture(_context.TEXTURE_2D, _frame_buffers[0].textures[0]);
      _context.uniform1i(_shaders[0].uniforms.u_sampler.location, 0);
      _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _full_screen_quad.index_buffer);

      // Draw

      _context.drawElements(_context.TRIANGLES, 6, _context.UNSIGNED_SHORT, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, null);
    }
  }

  var _cube = function(tx, ty, tz, sx, sy, sz, texture){
    var vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];
    var indices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    var normals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];
    var uvs = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    var cube = new _object(vertices, indices, normals, uvs);

    // Initialize matrices

    mat4.translate(cube.model_matrix, cube.model_matrix, [tx, ty, tz]);
    mat4.mul(cube.model_view_matrix, _camera.view_matrix, cube.model_matrix);
    mat4.scale(cube.model_matrix, cube.model_matrix, [sx, sy, sz]);
    mat4.mul(cube.model_view_matrix, _camera.view_matrix, cube.model_matrix);

    // Rendering

    cube.render = function(_texture){

      // Update models matrices

      if (_paused) mat4.rotate(cube.model_matrix, cube.model_matrix, 0.03, [-0.4, -0.3, 0.5]);
      mat4.mul(cube.model_view_matrix, _camera.view_matrix, cube.model_matrix);

      // Update shaders

      _context.useProgram(_shaders[1].program);
      _context.bindBuffer(_context.ARRAY_BUFFER, cube.vertex_buffer);
      _context.vertexAttribPointer(_shaders[1].attributes.a_vertex_position.location, 3, _context.FLOAT, false, 0, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, cube.uv_buffer);
      _context.vertexAttribPointer(_shaders[1].attributes.a_uv.location, 2, _context.FLOAT, false, 0, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, cube.normal_buffer);
      _context.vertexAttribPointer(_shaders[1].attributes.a_vertex_normal.location, 3, _context.FLOAT, false, 0, 0);
      _context.activeTexture(_context.TEXTURE0);
      _context.bindTexture(_context.TEXTURE_2D, _texture || texture);
      _context.uniform1i(_shaders[1].uniforms.u_sampler.location, 0);
      _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, cube.index_buffer);

      // Set up transformations

      _context.uniformMatrix4fv(_shaders[1].uniforms.u_projection_matrix.location, false, _camera.projection_matrix);
      _context.uniformMatrix4fv(_shaders[1].uniforms.u_model_view_matrix.location, false, cube.model_view_matrix);
      var _normal_matrix = mat4.create();
      mat4.invert(_normal_matrix, cube.model_view_matrix);
      mat4.transpose(_normal_matrix, _normal_matrix);
      _context.uniformMatrix4fv(_shaders[1].uniforms.u_normal_matrix.location, false, new Float32Array(_normal_matrix));

      // Draw

      _context.drawElements(_context.TRIANGLES, 36, _context.UNSIGNED_SHORT, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, null);
    }

    return cube;
  }

  // Initialize frame buffer

  var _init_frame_buffers = function(){
    _frame_buffers.length = 0;
    for (var i = 0; i < FRAME_BUFFER_COUNT; ++i){
      _frame_buffers.push({
        frame_buffer : _context.createFramebuffer(),
        textures : []
      });

      _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers[i].frame_buffer);
      _frame_buffers[i].frame_buffer.width = _width;
      _frame_buffers[i].frame_buffer.height = _height;

      var multiple_textures = [];
      for (var j = 0; j < TEXTURES_PER_FRAME_BUFFER_COUNT; ++j){
        _frame_buffers[i].textures[j] = _context.createTexture();
        _context.bindTexture(_context.TEXTURE_2D, _frame_buffers[i].textures[j]);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.NEAREST);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.NEAREST);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, _context.CLAMP_TO_EDGE);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, _context.CLAMP_TO_EDGE);
        _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, _frame_buffers[i].frame_buffer.width, _frame_buffers[i].frame_buffer.height, 0, _context.RGBA, _context.FLOAT, null);
        _context.bindTexture(_context.TEXTURE_2D, null);
        _context.framebufferTexture2D(_context.FRAMEBUFFER, _context.COLOR_ATTACHMENT0, _context.TEXTURE_2D, _frame_buffers[i].textures[j], 0);
        multiple_textures.push(_extensions[1].extension['COLOR_ATTACHMENT' + j + '_WEBGL'])
      }
      _extensions[1].extension.drawBuffersWEBGL(multiple_textures);

      var renderbuffer = _context.createRenderbuffer();
      _context.bindRenderbuffer(_context.RENDERBUFFER, renderbuffer);
      _context.renderbufferStorage(_context.RENDERBUFFER, _context.DEPTH_COMPONENT16, _frame_buffers[i].frame_buffer.width, _frame_buffers[i].frame_buffer.height);
      _context.framebufferRenderbuffer(_context.FRAMEBUFFER, _context.DEPTH_ATTACHMENT, _context.RENDERBUFFER, renderbuffer);

      _context.bindTexture(_context.TEXTURE_2D, null);
      _context.bindRenderbuffer(_context.RENDERBUFFER, null);
      _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    }
  }

  var _delete_frame_buffers = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    for (var i = 0; i < _frame_buffers.length; ++i){
      for (var j = 0; j < _frame_buffers.textures.length; ++j){
        _context.deleteTexture(_frame_buffers[i].textures[j]);
      }
      _context.deleteFramebuffer(_frame_buffers[i].frame_buffer);
    }
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
    for (var i = -6; i < 7; ++i){
      if (i == 0) ++i;
      for (var j = -6; j < 7; ++j){
        if (j == 0) ++j;
        for (var k = -6; k < 7; ++k){
          if (k == 0) ++k;
          _objects.push(_cube(j*3, k*3, i*3, 1/j, 1/k, 1/i, _textures[0].texture));
        }
      }
    }
    _objects.unshift(_cube(0, 0, 0, 1, 1, 1, _frame_buffers[0].textures[0]));
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
      _context.detachShader(_shaders[i].program, vertexShader);
      _context.detachShader(_shaders[i].program, fragmentShader);
      _context.deleteShader(vertexShader);
      _context.deleteShader(fragmentShader);

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
    tick : _tick_loading,
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
