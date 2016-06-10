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
    attribute highp vec3 a_vertex_position;
    attribute highp vec2 a_uv;
    varying highp vec2 v_uv;
    void main(void) {
      gl_Position = vec4(a_vertex_position, 1.0);
      v_uv = a_uv;
    }
    `,
    fragmentSource : `
    varying highp vec2 v_uv;
    uniform sampler2D u_sampler;
    void main(void) {
      highp vec4 texelColor = texture2D(u_sampler, vec2(v_uv.s, v_uv.t));
      gl_FragColor = vec4(texelColor.r*0.9, texelColor.r*0.3, texelColor.r*0.3, texelColor.a);
    }
    `,
    attributes: {
      a_vertex_position : {},
      a_uv : {}
    },
    uniforms: {
      u_sampler : { value : null}
    }
  };

  application.renderer.add_shader(shader);

}();
