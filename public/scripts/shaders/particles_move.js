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
    #extension GL_EXT_draw_buffers : require

    precision highp float;

    uniform vec2 u_resolution;
    uniform sampler2D u_sampler_0;
    uniform sampler2D u_sampler_1;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution.xy;
      vec3 position = texture2D(u_sampler_0, uv).rgb;
      vec3 velocity = texture2D(u_sampler_1, uv).rgb;

      vec3 velocity_vector = vec3(0.0, 0.1, 0.0) - position;
      float velocity_vector_length = length(velocity_vector);
      vec3 acceleration = (velocity_vector/velocity_vector_length) * 5.0 / velocity_vector_length;

      position += 1.0 * velocity * 0.02;
      velocity = velocity + acceleration * 0.02;

      gl_FragData[0] = vec4(position, 1.0);
      gl_FragData[1] = vec4(velocity, 1.0);
    }
    `,
    attributes: {
      a_vertex_position: {}
    },
    uniforms: {
      u_resolution: {},
      u_sampler_0: {},
      u_sampler_1: {}
    }
  };

  application.renderer.add_shader(shader);

}();
