// Particles initialization shader

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("particles_init.js : No 'application' module found! Be sure to load it up first!");
    return;
  };
  if (typeof application.renderer == "undefined") {
    console.log("particles_init.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  var shader = {
    name : 'particles_init',
    vertexSource : `
    precision highp float;

    attribute vec3 a_vertex_position;

    void main() {
      gl_Position = vec4(a_vertex_position, 1.0);
    }
    `,
    fragmentSource : `
    #extension GL_EXT_draw_buffers : require

    precision highp float;

    uniform vec2 u_resolution;

    float rand(vec2 seed) {
      return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec3 position = vec3(uv.x - 0.5, uv.y - 0.5, rand(uv) - 0.5);
      vec3 velocity = vec3(-2.0, 1.3, 2.0);
      gl_FragData[0] = vec4(position, 1.0);
      gl_FragData[1] = vec4(velocity, 1.0);
    }
    `,
    attributes: {
      a_vertex_position: {}
    },
    uniforms: {
      u_resolution: {}
    }
  };

  application.renderer.add_shader(shader);

}();
