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

  var _camera = null;

  var _rtt_frame_buffer = null;
  var _rtt_texture = null;

  // TODO: Need to refactor object holding structures

  var _cube_vertices_buffer = null;
  var _cube_vertices_texture_coord_buffer = null;
  var _cube_vertices_normal_buffer = null;
  var _cube_vertices_index_buffer = null;
  var _cube_image;
  var _cube_texture;
  var _cube_model_matrix = null;
  var _cube_model_view_matrix = null;
  var _cube_shader = null;
  var _cube_animated = false;

  // Private methods

  var _initialize = function(canvas){

    // Get context

    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl", { preserveDrawingBuffer:true });
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);

    // Initialize camera

    _camera = new application.constructors.camera(100, 0.1, 100.0, window.innerWidth/window.innerHeight);

    // Initialize matrices

    _cube_model_matrix = mat4.create();
    _cube_model_view_matrix = mat4.create();

    // Resize viewport

    _resize();
    _clear();

    // Initialize systems

    _register_shader();
    _init_buffers();
    _init_textures();
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

    _context.bindFramebuffer(_context.FRAMEBUFFER, _rtt_frame_buffer);
    _clear();
    _draw_cube(_cube_texture);
    _context.bindFramebuffer(_context.FRAMEBUFFER, null);
    _clear();
    _draw_cube(_rtt_texture);
  };

  var _draw_cube = function(texture){

    // Update models matrices

    if (_cube_animated) mat4.rotate(_cube_model_matrix, _cube_model_matrix, 0.03, [-0.4, -0.3, 0.5]);
    mat4.mul(_cube_model_view_matrix, _camera.view_matrix, _cube_model_matrix);
    _camera.update();

    // Update shaders

    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_buffer);
    _context.vertexAttribPointer(_cube_shader.attributes.aVertexPosition, 3, _context.FLOAT, false, 0, 0);
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_texture_coord_buffer);
    _context.vertexAttribPointer(_cube_shader.attributes.aTextureCoord, 2, _context.FLOAT, false, 0, 0);
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_normal_buffer);
    _context.vertexAttribPointer(_cube_shader.attributes.aVertexNormal, 3, _context.FLOAT, false, 0, 0);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, texture);
    _context.uniform1i(_cube_shader.uniforms.uSampler, 0);
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _cube_vertices_index_buffer);

    // Set up transformations

    _context.uniformMatrix4fv(_cube_shader.uniforms.uPMatrix, false, _camera.projection_matrix);
    _context.uniformMatrix4fv(_cube_shader.uniforms.uMVMatrix, false, _cube_model_view_matrix);
    var _normal_matrix = mat4.create();
    mat4.invert(_normal_matrix, _cube_model_view_matrix);
    mat4.transpose(_normal_matrix, _normal_matrix);
    _context.uniformMatrix4fv(_cube_shader.uniforms.uNormalMatrix, false, new Float32Array(_normal_matrix));

    // Draw

    _context.drawElements(_context.TRIANGLES, 36, _context.UNSIGNED_SHORT, 0);
  }

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
    _rtt_frame_buffer.width = 512;
    _rtt_frame_buffer.height = 512;

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

  // Buffer

  var _init_buffers = function(){
    _cube_vertices_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_buffer);
    var vertices = [-1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertices), _context.STATIC_DRAW);
    _cube_vertices_normal_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_normal_buffer);
    var vertexNormals = [0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertexNormals), _context.STATIC_DRAW);
    _cube_vertices_texture_coord_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_texture_coord_buffer);
    var textureCoordinates = [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(textureCoordinates), _context.STATIC_DRAW);
    _cube_vertices_index_buffer = _context.createBuffer();
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _cube_vertices_index_buffer);
    var cubeVertexIndices = [0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23];
    _context.bufferData(_context.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), _context.STATIC_DRAW);
  }

  // Textures

  var _init_textures = function() {
    _cube_texture = _context.createTexture();
    _cube_image = new Image();
    _cube_image.src = "resources/blank.png";
    _cube_image.onload = function() {
      _context.bindTexture(_context.TEXTURE_2D, _cube_texture);
      _context.texImage2D(_context.TEXTURE_2D, 0, _context.RGBA, _context.RGBA, _context.UNSIGNED_BYTE, _cube_image);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MAG_FILTER, _context.LINEAR);
      _context.texParameteri(_context.TEXTURE_2D, _context.TEXTURE_MIN_FILTER, _context.LINEAR_MIPMAP_NEAREST);
      _context.generateMipmap(_context.TEXTURE_2D);
      _context.bindTexture(_context.TEXTURE_2D, null);
    };
  };

  // Shader

  var _register_shader = function(){

    // Vertex shader

    var vertexShader = _context.createShader(_context.VERTEX_SHADER);
    _context.shaderSource(vertexShader, _cube_shader.vertexSource);
    _context.compileShader(vertexShader);

    // Fragment shader

    var fragmentShader = _context.createShader(_context.FRAGMENT_SHADER);
    _context.shaderSource(fragmentShader, _cube_shader.fragmentSource);
    _context.compileShader(fragmentShader);

    // Shader program

    _cube_shader.program = _context.createProgram();
    _context.attachShader(_cube_shader.program, vertexShader);
    _context.attachShader(_cube_shader.program, fragmentShader);
    _context.linkProgram(_cube_shader.program);
    _context.useProgram(_cube_shader.program);

    // Bind attributes

    _cube_shader.attributes.aVertexPosition = _context.getAttribLocation(_cube_shader.program, "aVertexPosition");
    _context.enableVertexAttribArray(_cube_shader.attributes.aVertexPosition);
    _cube_shader.attributes.aTextureCoord = _context.getAttribLocation(_cube_shader.program, "aTextureCoord");
    _context.enableVertexAttribArray(_cube_shader.attributes.aTextureCoord);
    _cube_shader.attributes.aVertexNormal = _context.getAttribLocation(_cube_shader.program, "aVertexNormal");
    _context.enableVertexAttribArray(_cube_shader.attributes.aVertexNormal);

    // Bind uniforms

    _cube_shader.uniforms.uMVMatrix = _context.getUniformLocation(_cube_shader.program, "uMVMatrix");
    _cube_shader.uniforms.uPMatrix = _context.getUniformLocation(_cube_shader.program, "uPMatrix");
    _cube_shader.uniforms.uNormalMatrix = _context.getUniformLocation(_cube_shader.program, "uNormalMatrix");
    _cube_shader.uniforms.uSampler = _context.getUniformLocation(_cube_shader.program, "uSampler");
  }

  // Data bindings

  var _update_background_color = function(color){
    this.params.colors.background = color;
  }

  var _add_shader = function(shader){
    _cube_shader = shader;
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
    simulation_switch : function(){ _cube_animated = !_cube_animated; },

    // Miscellaneous

    screenshot : _screenshot
  };

  application.renderer = renderer;
}();
