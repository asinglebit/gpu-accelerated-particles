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

  var _buffer = null;
  var _shader = null;

  var _perspective_matrix = null;
  var _model_view_matrix = null;

  // Private methods

  var _initialize = function(canvas){
    _canvas = document.getElementById(canvas);
    _context = _canvas.getContext("experimental-webgl");
    _context.enable(_context.DEPTH_TEST);
    _context.depthFunc(_context.LEQUAL);

    _resize();

    _registerShader();
    _initBuffers();
    _clear();
  };

  var _resize = function(){
    _width = _canvas.width  = window.innerWidth;
    _height = _canvas.height = window.innerHeight;
    _context.viewport(0, 0, _width, _height);
  }

  var _tick = function(){
    // Clear background
    _clear();
    // Calculate matrices
    _perspective_matrix = mat4.perspective(mat4.create(), 40, _width/_height, 0.1, 100.0);
    _model_view_matrix = mat4.create();
    // Translations
    var translation = vec3.create();
    vec3.set(translation, 0, 0, -2);
    mat4.translate(_model_view_matrix, _model_view_matrix, translation);
    // Update shaders
    _context.vertexAttribPointer(_shader.attributes.aVertexPosition, 3, _context.FLOAT, false, 0, 0);
    _context.uniformMatrix4fv(_shader.uniforms.uPMatrix, false, _perspective_matrix);
    _context.uniformMatrix4fv(_shader.uniforms.uMVMatrix, false, _model_view_matrix);
    _context.drawArrays(_context.TRIANGLE_STRIP, 0, 4);
  };

  var _clear = function(){
    var background_color = renderer.params.colors.background;
    _context.clearColor(background_color.r, background_color.g, background_color.b, 1.0);
    _context.clearDepth(1.0);
    _context.clear(_context.COLOR_BUFFER_BIT | _context.DEPTH_BUFFER_BIT);
  };

  // Buffer

  var _initBuffers = function(){
    _buffer = _context.createBuffer();
    _context.bindBuffer(_context.ARRAY_BUFFER, _buffer);
    var vertices = [1.0, 1.0, 0.0, -1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1.0, -1.0, 0.0];
    _context.bufferData(_context.ARRAY_BUFFER, new Float32Array(vertices), _context.STATIC_DRAW);
  }

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
    // Bind uniforms
    _shader.uniforms.uMVMatrix = _context.getUniformLocation(_shader.program, "uMVMatrix");
    _shader.uniforms.uPMatrix = _context.getUniformLocation(_shader.program, "uPMatrix");
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
