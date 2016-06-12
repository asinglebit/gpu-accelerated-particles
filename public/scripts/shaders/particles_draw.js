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
    precision highp float;
    attribute vec2 a_uv;
    uniform highp mat4 u_model_view_matrix;
    uniform highp mat4 u_projection_matrix;
    uniform sampler2D u_sampler;
    void main() {
      gl_PointSize = 2.0;
      gl_Position = u_model_view_matrix * u_projection_matrix * texture2D(u_sampler, a_uv);
    }
    `,
    fragmentSource : `
    precision highp float;
    void main() {
      gl_FragColor = vec4(0.3,0.3,0.3,1);
    }
    `,
    attributes: {
      a_uv : {}
    },
    uniforms: {
      u_model_view_matrix : { value : null},
      u_projection_matrix : { value : null},
      u_sampler : { value : null}
    }
  };

  application.renderer.add_shader(shader);

}();
