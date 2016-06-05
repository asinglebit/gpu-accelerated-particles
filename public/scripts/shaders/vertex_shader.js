// Vertex Shader

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("vertex_shader.js : No 'application' module found! Be sure to load it up first!");
    return;
  };
  if (typeof application.renderer == "undefined") {
    console.log("vertex_shader.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  var shader = {
    type : 'vertex',
    name : 'sample',
    source : `
    attribute vec3 aVertexPosition;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    }
    `
  };

  application.renderer.shaders.push(shader);

}();
