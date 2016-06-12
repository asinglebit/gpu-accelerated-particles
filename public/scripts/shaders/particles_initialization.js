// Particles initialization shader

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
    name : 'particles_initialization',
    vertexSource : `
    attribute highp vec3 a_vertex_position;
    void main(void) {
      gl_Position = vec4(a_vertex_position, 1.0);
    }
    `,
    fragmentSource : `
    #extension GL_EXT_draw_buffers : require
    precision highp float;
    const vec2 resolution = vec2(1024,1024);
    float rand(vec2 seed) {
      return fract(sin(dot(seed.xy,vec2(12.9898,78.233))) * 43758.5453);
    }
    void main() {
      vec2 uv = gl_FragCoord.xy/resolution.xy;
      vec4 pos = vec4(uv.x, uv.y, rand(uv), 1.0);
      gl_FragData[0] = pos;
    }
    `,
    attributes: {
      a_vertex_position : {}
    },
    uniforms: {
    }
  };

  application.renderer.add_shader(shader);

}();
