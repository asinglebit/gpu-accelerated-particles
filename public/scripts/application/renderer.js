// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Globals

  var CAMERA_FAR_PLANE = 100000000.0;
  var CAMERA_NEAR_PLANE = 0.1;
  var CAMERA_FOV = 100;

  var PARTICLE_BUFFER_DIMENSIONS = 3000;
  var PARTICLE_BUFFER_TEXTURE_COUNT = 2;
  var PARTICLE_COUNT = PARTICLE_BUFFER_DIMENSIONS * PARTICLE_BUFFER_DIMENSIONS;

  var DEFAULT_GRAVITY = [0.0, 0.0, 0.0];

  // Private members

  var _canvas = null;
  var _context = null;
  var _extensions = null;
  var _width = null;
  var _height = null;
  var _camera = null;
  var _paused = true;

  var _shaders = [];
  var _frame_buffers = {
    render_buffer : {},
    particle_buffer_0 : {},
    particle_buffer_1 : {}
  };
  var _buffers = {
    particle_uvs: {size: 2, count: PARTICLE_COUNT, data: null},
    full_screen_quad: {size: 3, count: 6, data: new Float32Array([-1.0, -1.0,  0.0, 1.0,  1.0,  0.0, -1.0,  1.0,  0.0, -1.0, -1.0,  0.0, 1.0, -1.0,  0.0, 1.0,  1.0,  0.0, ])}
  };

  var _gravity = DEFAULT_GRAVITY;

  // Private methods

  var _initialize = function(canvas){
    _init_viewport(canvas);
    _init_shaders();
    _fill_buffers();
    _init_buffers();
    _init_frame_buffers();
    _init_particles();
    _loading_complete();
  };

  var _init_viewport = function(canvas){

    // Initialize context

    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl");
    _context.clearColor(0.0, 0.0, 0.0, 0.0);
    _context.disable(_context.DEPTH_TEST);
    _context.depthMask(false);
    _context.enable(_context.BLEND);
    _context.blendFunc(_context.SRC_ALPHA, _context.ONE);

    // Initialize extensions

    _extensions = {
      mrt : _context.getExtension('WEBGL_draw_buffers'),
      float_textures : _context.getExtension('OES_texture_float')
    }

    // Initialize camera

    _camera = new application.constructors.camera(CAMERA_FOV, CAMERA_NEAR_PLANE, CAMERA_FAR_PLANE, window.innerWidth / window.innerHeight);

    // Initialize viewport

    _resize();
    _clear();
    _loading();
  }

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
    _camera.aspect = _width / _height;
    _camera.update();
    _delete_render_buffer();
    _init_render_buffer();
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
    if (!_paused) _move_particles();
    _draw_particles();
    _draw_full_screen_quad();
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 0.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Frame buffers

  var _init_frame_buffers = function(){
    _init_particle_buffer(_frame_buffers.particle_buffer_0);
    _init_particle_buffer(_frame_buffers.particle_buffer_1);
    _init_render_buffer();
  }

  // Particle buffer

  var _init_particle_buffer = function(particle_buffer){
    particle_buffer.textures = [];
    particle_buffer.frame_buffer = _context.createFramebuffer();
    _context.bindFramebuffer(_context.FRAMEBUFFER, particle_buffer.frame_buffer);
    var mrt = [];
    for (var i = 0; i < PARTICLE_BUFFER_TEXTURE_COUNT; ++i) {
      particle_buffer.textures.push(_context.createTexture());
      _context.bindTexture(_context.TEXTURE_2D, particle_buffer.textures[i]);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.NEAREST);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.NEAREST);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, _context.CLAMP_TO_EDGE);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, _context.CLAMP_TO_EDGE);
      _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, PARTICLE_BUFFER_DIMENSIONS, PARTICLE_BUFFER_DIMENSIONS, 0, _context.RGBA, _context.FLOAT, null);
      _context.bindTexture(_context.TEXTURE_2D, null);
      mrt[i] = _extensions.mrt['COLOR_ATTACHMENT' + i + '_WEBGL'];
      _context.framebufferTexture2D(_context.FRAMEBUFFER, mrt[i], _context.TEXTURE_2D, particle_buffer.textures[i], 0);
    }
    _extensions.mrt.drawBuffersWEBGL(mrt);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
  }

  // Render buffer

  var _init_render_buffer = function(){
    _frame_buffers.render_buffer.texture = _context.createTexture();
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.render_buffer.texture);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.NEAREST);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.NEAREST);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_S, _context.CLAMP_TO_EDGE);
    _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_WRAP_T, _context.CLAMP_TO_EDGE);
    _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, _width, _height, 0, _context.RGBA, _context.FLOAT, null);
    _context.bindTexture(_context.TEXTURE_2D, null);
    _frame_buffers.render_buffer.frame_buffer = _context.createFramebuffer();
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers.render_buffer.frame_buffer);
    _context.framebufferTexture2D(_context.FRAMEBUFFER, _context.COLOR_ATTACHMENT0, _context.TEXTURE_2D, _frame_buffers.render_buffer.texture, 0);
    _context.bindTexture(_context.TEXTURE_2D, null);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
  }

  var _delete_render_buffer = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _context.deleteTexture(_frame_buffers.render_buffer.texture);
    _context.deleteFramebuffer(_frame_buffers.render_buffer.frame_buffer);
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

  // Initialize buffers

  var _fill_buffers = function(){
    var particle_uv = [];
    for (var y = 0; y < PARTICLE_BUFFER_DIMENSIONS; ++y) {
      for (var x = 0; x < PARTICLE_BUFFER_DIMENSIONS; ++x) {
        particle_uv.push(x / PARTICLE_BUFFER_DIMENSIONS);
        particle_uv.push(y / PARTICLE_BUFFER_DIMENSIONS);
      }
    }
    _buffers.particle_uvs.data = new Float32Array(particle_uv);
  }

  var _init_buffers = function(){
    for (var buffer in _buffers) {
      if (_buffers.hasOwnProperty(buffer)) {
        _buffers[buffer].buffer = _context.createBuffer();
        _context.bindBuffer(_context.ARRAY_BUFFER, _buffers[buffer].buffer);
        _context.bufferData(_context.ARRAY_BUFFER, _buffers[buffer].data, _context.STATIC_DRAW);
        _context.bindBuffer(_context.ARRAY_BUFFER, null);
      }
    }
  }

  // Particles

  var _init_particles = function(){
    _gravity = DEFAULT_GRAVITY;
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers.particle_buffer_0.frame_buffer);
    _context.viewport(0, 0, PARTICLE_BUFFER_DIMENSIONS, PARTICLE_BUFFER_DIMENSIONS);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.blendFunc(_context.ONE, _context.ZERO);
    _context.useProgram(_shaders[1].program);
    _context.enableVertexAttribArray(_shaders[1].attributes.a_vertex_position.location);
    _context.bindBuffer(_context.ARRAY_BUFFER, _buffers.full_screen_quad.buffer);
    _context.vertexAttribPointer( _shaders[1].attributes.a_vertex_position.location, _buffers.full_screen_quad.size, _context.FLOAT, false, 0, 0);
    _context.uniform2f(_shaders[1].uniforms.u_resolution.location, PARTICLE_BUFFER_DIMENSIONS, PARTICLE_BUFFER_DIMENSIONS);
    _context.drawArrays(_context.TRIANGLES, 0, _buffers.full_screen_quad.count);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
    _context.disableVertexAttribArray(_shaders[1].attributes.a_vertex_position.location);
    _context.useProgram(null);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
  }

  var _move_particles = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers.particle_buffer_1.frame_buffer);
    _context.viewport(0, 0, PARTICLE_BUFFER_DIMENSIONS, PARTICLE_BUFFER_DIMENSIONS);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.blendFunc(_context.ONE, _context.ZERO);
    _context.useProgram(_shaders[2].program);
    _context.enableVertexAttribArray(_shaders[2].attributes.a_vertex_position.location);
    _context.bindBuffer(_context.ARRAY_BUFFER, _buffers.full_screen_quad.buffer);
    _context.vertexAttribPointer( _shaders[2].attributes.a_vertex_position.location, _buffers.full_screen_quad.size, _context.FLOAT, false, 0, 0);
    _context.uniform2f(_shaders[2].uniforms.u_resolution.location, PARTICLE_BUFFER_DIMENSIONS, PARTICLE_BUFFER_DIMENSIONS);
    _context.uniform3f(_shaders[2].uniforms.u_gravity.location, _gravity[0], _gravity[1], _gravity[2]);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.particle_buffer_0.textures[0]);
    _context.uniform1i(_shaders[2].uniforms.u_sampler_0.location, 0);
    _context.activeTexture(_context.TEXTURE1);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.particle_buffer_0.textures[1]);
    _context.uniform1i(_shaders[2].uniforms.u_sampler_1.location, 1);
    _context.drawArrays(_context.TRIANGLES, 0, _buffers.full_screen_quad.count);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
    _context.disableVertexAttribArray(_shaders[2].attributes.a_vertex_position.location);
    _context.useProgram(null);0
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);

    // Swap buffers

    _frame_buffers.particle_buffer_0 = [_frame_buffers.particle_buffer_1, _frame_buffers.particle_buffer_1 = _frame_buffers.particle_buffer_0][0];
  }

  var _draw_particles = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, _frame_buffers.render_buffer.frame_buffer);
    _context.viewport(0, 0, _width, _height);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.blendFunc(_context.SRC_ALPHA, _context.ONE);
    _context.useProgram(_shaders[3].program);
    _context.enableVertexAttribArray(_shaders[3].attributes.a_uv.location);
    _context.bindBuffer(_context.ARRAY_BUFFER, _buffers.particle_uvs.buffer);
    _context.vertexAttribPointer(_shaders[3].attributes.a_uv.location, _buffers.particle_uvs.size, _context.FLOAT, false, 0, 0);
    _context.uniformMatrix4fv(_shaders[3].uniforms.u_view_projection_matrix.location, false, _camera.view_projection_matrix);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.particle_buffer_0.textures[0]);
    _context.uniform1i(_shaders[3].uniforms.u_sampler_0.location, 0);
    _context.activeTexture(_context.TEXTURE1);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.particle_buffer_0.textures[1]);
    _context.uniform1i(_shaders[3].uniforms.u_sampler_1.location, 1);
    _context.drawArrays(_context.POINTS, 0, _buffers.particle_uvs.count);
    _context.bindTexture(_context.TEXTURE_2D, null);
    _context.bindBuffer(_context.ARRAY_BUFFER, null);
    _context.disableVertexAttribArray(_shaders[3].attributes.a_uv.location);
    _context.useProgram(null);
  }

  // Render

  var _draw_full_screen_quad = function(){
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _context.viewport(0, 0, _width, _height);
    _context.clear(_context.COLOR_BUFFER_BIT);
    _context.useProgram(_shaders[0].program);
    _context.enableVertexAttribArray(_shaders[0].attributes.a_vertex_position.location);
    _context.bindBuffer(_context.ARRAY_BUFFER, _buffers.full_screen_quad.buffer);
    _context.vertexAttribPointer( _shaders[0].attributes.a_vertex_position.location, _buffers.full_screen_quad.size, _context.FLOAT, false, 0, 0);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, _frame_buffers.render_buffer.texture);
    //_context.bindTexture(_context.TEXTURE_2D, _frame_buffers.particle_buffer_1.textures[0]);
    _context.uniform1i(_shaders[0].uniforms.u_sampler.location, 0);
    _context.drawArrays(_context.TRIANGLES, 0, _buffers.full_screen_quad.count);
    _context.disableVertexAttribArray(_shaders[0].attributes.a_vertex_position.location);
  }

  // Data bindings

  var _update_background_color = function(color){
    renderer.params.colors.background = color;
  }

  var _add_shader = function(shader){
    _shaders.push(shader);
  }

  var _gravity_update = function(x, y){

    // Convert to screenspace coordinates

    var u = 2.0 * x / _width - 1.0;
    var v = 2.0 * (1 - y / _height) - 1.0;

    // Setup basic vectors

    var right = vec3.clone(_camera.right);
    var up = vec3.clone(_camera.up);
    var gravity = vec3.create();
    var right_up = vec3.create();

    // Compensate for field of view distortion

    var fov_compensator = Math.tan(_camera.fov);
    vec3.scale(right, right, fov_compensator * _camera.aspect);
    vec3.scale(up, up, fov_compensator);

    // Get normalized camera ray

    vec3.subtract(gravity, _camera.target, _camera.pos);
    vec3.normalize(gravity, gravity);
    vec3.scale(right, right, u);
    vec3.scale(up, up, v);
    vec3.add(right_up, right, up);
    vec3.add(gravity, gravity, right_up);
    vec3.normalize(gravity, gravity);

    // Get intersection with an abstract plane

    var target_vector = vec3.create();
    vec3.subtract(target_vector, _camera.target, _camera.pos);
    var target_distance = vec3.length(target_vector);
    var angle = Math.acos(vec3.dot(gravity, target_vector) / target_distance);
    var scale = target_distance / Math.cos(angle);
    vec3.scale(gravity, gravity, scale);
    vec3.add(gravity, gravity, _camera.pos);

    _gravity = gravity;
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
    simulation_reset : _init_particles,
    gravity_update : _gravity_update,

    // Miscellaneous

    screenshot : _screenshot
  };

  application.renderer = renderer;
}();
