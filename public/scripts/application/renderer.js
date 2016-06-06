// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Private members

  var _context = null;
  var _canvas = null;
  var _width = null;
  var _height = null;

  var _cube_vertices_buffer = null;
  var _cube_vertices_texture_coord_buffer = null;
  var _cube_vertices_normal_buffer = null;
  var _cube_vertices_index_buffer = null;

  var _cube_image;
  var _cube_texture;
  var _cube_rotation = 0.03;

  var _shader = null;

  var _perspective_matrix = null;
  var _model_view_matrix = null;

  // Private methods

  var _initialize = function(canvas){
    // Get context
    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl");
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);
    // Initialize matrices
    _model_view_matrix = mat4.create();
    // Translations
    var translation = vec3.create();
    vec3.set(translation, 0, 0, -10);
    mat4.translate(_model_view_matrix, _model_view_matrix, translation);
    // Resize viewport
    _resize();
    _clear();
    // Initialize systems
    _registerShader();
    _initBuffers();
    _initTextures();
  };

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
    _perspective_matrix = mat4.perspective(mat4.create(), 100, _width/_height, 0.1, 100.0);
  }

  var _tick = function(){
    // Clear background
    _clear();
    // Update matrices
    mat4.rotate(_model_view_matrix, _model_view_matrix, _cube_rotation, [-0.6, 0.3, 1]);
    // Update shaders
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_buffer);
    _context.vertexAttribPointer(_shader.attributes.aVertexPosition, 3, _context.FLOAT, false, 0, 0);
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_texture_coord_buffer);
    _context.vertexAttribPointer(_shader.attributes.aTextureCoord, 2, _context.FLOAT, false, 0, 0);
    _context.bindBuffer(_context.ARRAY_BUFFER, _cube_vertices_normal_buffer);
    _context.vertexAttribPointer(_shader.attributes.aVertexNormal, 3, _context.FLOAT, false, 0, 0);
    _context.activeTexture(_context.TEXTURE0);
    _context.bindTexture(_context.TEXTURE_2D, _cube_texture);
    _context.uniform1i(_shader.uniforms.uSampler, 0);
    _context.bindBuffer(_context.ELEMENT_ARRAY_BUFFER, _cube_vertices_index_buffer);
    // Set up transformations
    _context.uniformMatrix4fv(_shader.uniforms.uPMatrix, false, _perspective_matrix);
    _context.uniformMatrix4fv(_shader.uniforms.uMVMatrix, false, _model_view_matrix);
    var _normal_matrix = mat4.create();
    mat4.invert(_normal_matrix, _model_view_matrix);
    mat4.transpose(_normal_matrix, _normal_matrix);
    _context.uniformMatrix4fv(_shader.uniforms.uNormalMatrix, false, new Float32Array(_normal_matrix));
    // Draw
    _context.drawElements(_context.TRIANGLES, 36, _context.UNSIGNED_SHORT, 0);
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 1.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Buffer

  var _initBuffers = function(){
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

  var _initTextures = function() {
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

  var _registerShader = function(){
    // Vertex shader
    var vertexShader = _context.createShader(_context.VERTEX_SHADER);
    _context.shaderSource(vertexShader, _shader.vertexSource);
    _context.compileShader(vertexShader);
    // Fragment shader
    var fragmentShader = _context.createShader(_context.FRAGMENT_SHADER);
    _context.shaderSource(fragmentShader, _shader.fragmentSource);
    _context.compileShader(fragmentShader);
    // Shader program
    _shader.program = _context.createProgram();
    _context.attachShader(_shader.program, vertexShader);
    _context.attachShader(_shader.program, fragmentShader);
    _context.linkProgram(_shader.program);
    _context.useProgram(_shader.program);
    // Bind attributes
    _shader.attributes.aVertexPosition = _context.getAttribLocation(_shader.program, "aVertexPosition");
    _context.enableVertexAttribArray(_shader.attributes.aVertexPosition);
    _shader.attributes.aTextureCoord = _context.getAttribLocation(_shader.program, "aTextureCoord");
    _context.enableVertexAttribArray(_shader.attributes.aTextureCoord);
    _shader.attributes.aVertexNormal = _context.getAttribLocation(_shader.program, "aVertexNormal");
    _context.enableVertexAttribArray(_shader.attributes.aVertexNormal);
    // Bind uniforms
    _shader.uniforms.uMVMatrix = _context.getUniformLocation(_shader.program, "uMVMatrix");
    _shader.uniforms.uPMatrix = _context.getUniformLocation(_shader.program, "uPMatrix");
    _shader.uniforms.uNormalMatrix = _context.getUniformLocation(_shader.program, "uNormalMatrix");
    _shader.uniforms.uSampler = _context.getUniformLocation(_shader.program, "uSampler");
  }

  // Data bindings

  var _updateBackgroundColor = function(color){
    this.params.colors.background = color;
  }

  var _addShader = function(shader){
    _shader = shader;
  }

  // Public

  var renderer = {

    // Public members

    params : {
      colors: {
        background: {r: 0.2, g: 0.2, b: 0.2},
        particles: {r: 0.9, g: 0.9, b: 0.9}
      }
    },

    // Public methods

    initialize : _initialize,
    resize : _resize,
    tick : _tick,
    clear : _clear,
    addShader : _addShader,
    updateBackgroundColor : _updateBackgroundColor
  };

  application.renderer = renderer;
}();
