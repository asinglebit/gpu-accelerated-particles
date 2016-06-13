// Particles movement shader

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("particles_move.js : No 'application' module found! Be sure to load it up first!");
    return;
  };
  if (typeof application.renderer == "undefined") {
    console.log("particles_move.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  var shader = {
    name : 'particles_move',
    vertexSource : `
    precision highp float;
    attribute vec3 a_vertex_position;

    void main() {
      gl_Position = vec4(a_vertex_position, 1.0);
    }
    `,
    fragmentSource : `
    precision highp float;
    uniform vec2 u_resolution;
    uniform sampler2D u_sampler_0;

    void main() {
      vec2 uv = gl_FragCoord.xy/u_resolution.xy;
      highp vec4 pos = texture2D(u_sampler_0, uv);
      highp vec4 new_pos = pos + vec4(0.001, 0.001, 0.001, 0);
      gl_FragData[0] = new_pos;
    }
    `,
    attributes: {
      a_vertex_position: {}
    },
    uniforms: {
      u_resolution: {},
      u_sampler_0: {}
    }
  };

  application.renderer.add_shader(shader);

}();
