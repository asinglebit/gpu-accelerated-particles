// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Private members

  var PARTICLE_COUNT = 1024 * 1024;

  var _canvas = null;
  var _context = null;
  var _extensions = [];
  var _width = null;
  var _height = null;

  var _paused = false;

  var _camera = null;
  var _full_screen_quad = null;
  var _full_screen_quad_frame_buffer = [];
  var _frame_buffers = [];
  var _shaders = [];

  var _particle_pos = [];
  var _particle_uv = [];

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

    _frame_buffers = _init_frame_buffers(1, 1);
    _full_screen_quad_frame_buffer = _init_frame_buffers(1, 1);
    _init_full_screen_quad();
    _init_shaders();
    _generate_particle_uv_data();
    _init_particles();
    _loading_complete();
  };

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
    _camera.aspect = _width/_height;
    _camera.update();
    _delete_frame_buffers(_frame_buffers);
    _frame_buffers = _init_frame_buffers(1, 1);
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
    _draw_particles();
    //_full_screen_quad.render();
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 0.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Initialize objects

  var _generate_particle_uv_data = function(){
    var particle_uv = [];
    for (var y=0; y<1024; ++y) {
      for (var x=0; x<1024; ++x) {
        particle_uv.push(x/1024);
        particle_uv.push(y/1024);
      }
    }
    _particle_uv = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _particle_uv);
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(particle_uv), _context.STATIC_DRAW);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
  }

  var _init_particles = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers[0].frame_buffer);
    _context.viewport(0, 0, 1024, 1024);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.blendFunc(_context.ONE, _context.ZERO);
    _context.useProgram(_shaders[1].program);
    _context.bindBuffer(_context.ARRAY_BUFFER, _full_screen_quad.vertex_buffer);
    _context.vertexAttribPointer(_shaders[1].attributes.a_vertex_position.location, 3, _context.FLOAT, false, 0, 0);
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _full_screen_quad.index_buffer);
    _context.drawElements(_context.TRIANGLES, 6, _context.UNSIGNED_SHORT, 0);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
  }

  var _draw_particles = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _context.viewport(0, 0, _width, _height);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.blendFunc(_context.SRC_ALPHA, _context.ONE);
    _context.useProgram(_shaders[2].program);
    _context.bindBuffer(_context.ARRAY_BUFFER, _particle_uv);
    _context.vertexAttribPointer(_shaders[2].attributes.a_uv.location, 2, _context.FLOAT, false, 0, 0);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers[0].textures[0]);
    _context.uniform1i(_shaders[2].uniforms.u_sampler.location, 0);
    _context.uniformMatrix4fv(_shaders[2].uniforms.u_projection_matrix.location, false, _camera.projection_matrix);
    _context.uniformMatrix4fv(_shaders[2].uniforms.u_model_view_matrix.location, false, _camera.view_matrix);
    _context.drawArrays(_context.POINTS, 0, PARTICLE_COUNT);
    _context.bindTexture(_context.TEXTURE_2D, null);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
  }

  var _init_full_screen_quad = function(){
    _full_screen_quad = {};
    _full_screen_quad.vertex_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _full_screen_quad.vertex_buffer);
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0]), _context.STATIC_DRAW);
    _full_screen_quad.index_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _full_screen_quad.index_buffer);
    _context.bufferData(_context.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), _context.STATIC_DRAW);

    _full_screen_quad.model_matrix = mat4.create();
    _full_screen_quad.model_view_matrix = mat4.create();

    _full_screen_quad.render = function(){
      _context.bindFramebuffer(_context.FRAMEBUFFER, null);
      _context.viewport(0, 0, _width, _height);
      _context.useProgram(_shaders[0].program);
      _context.bindBuffer(_context.ARRAY_BUFFER, _full_screen_quad.vertex_buffer);
      _context.vertexAttribPointer(_shaders[0].attributes.a_vertex_position.location, 3, _context.FLOAT, false, 0, 0);
      _context.activeTexture(_context.TEXTURE0);
      _context.bindTexture(_context.TEXTURE_2D, _full_screen_quad_frame_buffer[0].textures[0]);
      _context.uniform1i(_shaders[0].uniforms.u_sampler.location, 0);
      _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _full_screen_quad.index_buffer);
      _context.drawElements(_context.TRIANGLES, 6, _context.UNSIGNED_SHORT, 0);
      _context.bindBuffer(_context.ARRAY_BUFFER, null);
    }
  }

  // Initialize frame buffer

  var _init_frame_buffers = function(frame_buffer_count, textures_per_frame_buffer_count){
    var frame_buffer_holder = [];
    for (var i = 0; i < frame_buffer_count; ++i){
      frame_buffer_holder.push({
        frame_buffer : _context.createFramebuffer(),
        textures : []
      });

      _context.bindFramebuffer(_context.FRAMEBUFFER, frame_buffer_holder[i].frame_buffer);
      frame_buffer_holder[i].frame_buffer.width = _width;
      frame_buffer_holder[i].frame_buffer.height = _height;

      var multiple_textures = [];
      for (var j = 0; j < textures_per_frame_buffer_count; ++j){
        frame_buffer_holder[i].textures[j] = _context.createTexture();
        _context.bindTexture(_context.TEXTURE_2D, frame_buffer_holder[i].textures[j]);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.NEAREST);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.NEAREST);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, _context.CLAMP_TO_EDGE);
        _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, _context.CLAMP_TO_EDGE);
        _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, frame_buffer_holder[i].frame_buffer.width, frame_buffer_holder[i].frame_buffer.height, 0, _context.RGBA, _context.FLOAT, null);
        _context.bindTexture(_context.TEXTURE_2D, null);
        _context.framebufferTexture2D(_context.FRAMEBUFFER, _context.COLOR_ATTACHMENT0, _context.TEXTURE_2D, frame_buffer_holder[i].textures[j], 0);
        multiple_textures.push(_extensions[1].extension['COLOR_ATTACHMENT' + j + '_WEBGL'])
      }
      _extensions[1].extension.drawBuffersWEBGL(multiple_textures);

      var renderbuffer = _context.createRenderbuffer();
      _context.bindRenderbuffer(_context.RENDERBUFFER, renderbuffer);
      _context.renderbufferStorage(_context.RENDERBUFFER, _context.DEPTH_COMPONENT16, frame_buffer_holder[i].frame_buffer.width, frame_buffer_holder[i].frame_buffer.height);
      _context.framebufferRenderbuffer(_context.FRAMEBUFFER, _context.DEPTH_ATTACHMENT, _context.RENDERBUFFER, renderbuffer);

      _context.bindTexture(_context.TEXTURE_2D, null);
      _context.bindRenderbuffer(_context.RENDERBUFFER, null);
      _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    }

    return frame_buffer_holder;
  }

  var _delete_frame_buffers = function(frame_buffer_holder){
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    for (var i = 0; i < frame_buffer_holder.length; ++i){
      for (var j = 0; j < frame_buffer_holder[i].textures.length; ++j){
        _context.deleteTexture(frame_buffer_holder[i].textures[j]);
      }
      _context.deleteFramebuffer(frame_buffer_holder[i].frame_buffer);
    }
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
