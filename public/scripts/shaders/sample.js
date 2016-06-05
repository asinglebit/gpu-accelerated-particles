// Simple shader

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("fragment_shader.js : No 'application' module found! Be sure to load it up first!");
    return;
  };
  if (typeof application.renderer == "undefined") {
    console.log("fragment_shader.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  var shader = {
    name : 'sample',
    vertexSource : `
    attribute vec3 aVertexPosition;
    attribute vec4 aVertexColor;
    uniform mat4 uMVMatrix;
    uniform mat4 uPMatrix;
    varying lowp vec4 vColor;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vColor = aVertexColor;
    }
    `,
    fragmentSource : `
    varying lowp vec4 vColor;
    void main(void) {
      gl_FragColor = vColor;
    }
    `,
    attributes: {
      aVertexPosition : {},
      aVertexColor : {}
    },
    uniforms: {
      uMVMatrix : { value : null},
      uPMatrix : { value : null}
    }
  };

  application.renderer.addShader(shader);

}();
