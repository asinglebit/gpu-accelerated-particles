// Fragment Shader

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
    type : 'fragment',
    name : 'sample',
    source : `
    void main(void) {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
    `
  };

  application.renderer.shaders.push(shader);

}();
