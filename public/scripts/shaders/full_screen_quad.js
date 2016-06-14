// Full screen quad shader

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("full_screen_quad.js : No 'application' module found! Be sure to load it up first!");
    return;
  };
  if (typeof application.renderer == "undefined") {
    console.log("full_screen_quad.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  var shader = {
    name : 'full_screen_quad',
    vertexSource : `
    precision highp float;

    attribute vec3 a_vertex_position;
    varying vec2 v_uv;
    const vec2 scale = vec2(0.5, 0.5);

    void main(void) {
      gl_Position = vec4(a_vertex_position, 1.0);
      v_uv = a_vertex_position.xy * scale + scale;
    }
    `,
    fragmentSource : `
    precision highp float;

    varying vec2 v_uv;
    uniform sampler2D u_sampler;
    uniform vec2 u_resolution;
    void main(void) {
      gl_FragColor = texture2D(u_sampler, vec2(v_uv.s, v_uv.t));
    }
    `,
    attributes: {
      a_vertex_position : {}
    },
    uniforms: {
      u_resolution: {},
      u_sampler : {}
    }
  };

  application.renderer.add_shader(shader);

}();
