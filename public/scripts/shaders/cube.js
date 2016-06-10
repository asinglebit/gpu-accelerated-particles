// Cube shader

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
    name : 'cube',
    vertexSource : `
    attribute highp vec3 a_vertex_normal;
    attribute highp vec3 a_vertex_position;
    attribute highp vec2 a_uv;
    uniform highp mat4 u_normal_matrix;
    uniform highp mat4 u_model_view_matrix;
    uniform highp mat4 u_projection_matrix;
    varying highp vec2 v_uv;
    varying highp vec3 v_lighting;
    void main(void) {
      gl_Position = u_projection_matrix * u_model_view_matrix * vec4(a_vertex_position, 1.0);
      v_uv = a_uv;
      highp vec3 ambient_light_color = vec3(0.6, 0.6, 0.6);
      highp vec3 directional_light_color = vec3(0.5, 0.5, 0.75);
      highp vec3 directional_light_vector = vec3(0.85, 0.8, 0.75);
      highp vec4 transformed_normal = u_normal_matrix * vec4(a_vertex_normal, 1.0);
      highp float directional = max(dot(transformed_normal.xyz, directional_light_vector), 0.0);
      v_lighting = ambient_light_color + (directional_light_color * directional);
    }
    `,
    fragmentSource : `
    varying highp vec2 v_uv;
    varying highp vec3 v_lighting;
    uniform sampler2D u_sampler;
    void main(void) {
      highp vec4 texel_color = texture2D(u_sampler, vec2(v_uv.s, v_uv.t));
      gl_FragColor = vec4(texel_color.rgb * v_lighting, texel_color.a);
    }
    `,
    attributes: {
      a_vertex_position : {},
      a_uv : {},
      a_vertex_normal : {}
    },
    uniforms: {
      u_model_view_matrix : { value : null},
      u_projection_matrix : { value : null},
      u_normal_matrix : { value : null},
      u_sampler : { value : null}
    }
  };

  application.renderer.add_shader(shader);

}();
