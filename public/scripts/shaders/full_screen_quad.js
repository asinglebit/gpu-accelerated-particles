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
    attribute highp vec3 a_vertex_position;
    varying highp vec2 v_uv;
    const vec2 scale = vec2(0.5, 0.5);
    void main(void) {
      gl_Position = vec4(a_vertex_position, 1.0);
      v_uv = a_vertex_position.xy * scale + scale;
    }
    `,
    fragmentSource : `
    varying highp vec2 v_uv;
    uniform sampler2D u_sampler;
    void main(void) {
      highp vec4 texelColor = texture2D(u_sampler, vec2(v_uv.s, v_uv.t));
      gl_FragColor = vec4(texelColor.rgba);
    }
    `,
    attributes: {
      a_vertex_position : {}
    },
    uniforms: {
      u_sampler : {}
    }
  };

  application.renderer.add_shader(shader);

}();
