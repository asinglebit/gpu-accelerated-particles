// Full screen quad shader

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
    name : 'full_screen_quad',
    vertexSource : `
    attribute vec2 aVertexPosition;
    varying vec2 vTexCoords;
    const vec2 scale = vec2(0.5, 0.5);
    void main()
    {
        vTexCoords  = aVertexPosition * scale + scale;
        gl_Position = vec4(aVertexPosition, 0.0, 1.0);
    }
    `,
    fragmentSource : `
    uniform sampler2D uSampler;
    varying vec2 vTexCoords;
    void main()
    {
        gl_FragColor = texture2D(uSampler, vTexCoords);
    }
    `,
    attributes: {
      aVertexPosition : {}
    },
    uniforms: {
      uSampler : { value : null}
    }
  };

  application.renderer.add_shader(shader);

}();
