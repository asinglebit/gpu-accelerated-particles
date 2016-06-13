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
    name : 'particles_draw',
    vertexSource : `
    precision highp float;
    attribute vec2 a_uv;
    uniform mat4 u_view_projection_matrix;
    uniform sampler2D u_sampler_0;
    varying vec4 v_color;

    void main() {
      gl_PointSize = 2.0;
      v_color = vec4(0.9, 0.4, 0.2, 0.4);
      gl_Position = u_view_projection_matrix * texture2D(u_sampler_0, a_uv);
    }
    `,
    fragmentSource : `
    precision highp float;
    varying vec4 v_color;

    void main() {
      gl_FragColor = v_color;
    }
    `,
    attributes: {
      a_uv: {}
    },
    uniforms: {
      u_view_projection_matrix: {},
      u_sampler_0: {}
    }
  };

  application.renderer.add_shader(shader);

}();
