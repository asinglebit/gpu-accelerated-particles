// Simple shader

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
    name : 'sample',
    vertexSource : `
    attribute highp vec3 aVertexNormal;
    attribute highp vec3 aVertexPosition;
    attribute highp vec2 aTextureCoord;
    uniform highp mat4 uNormalMatrix;
    uniform highp mat4 uMVMatrix;
    uniform highp mat4 uPMatrix;
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    void main(void) {
      gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
      vTextureCoord = aTextureCoord;
      highp vec3 ambientLight = vec3(0.6, 0.6, 0.6);
      highp vec3 directionalLightColor = vec3(0.5, 0.5, 0.75);
      highp vec3 directionalVector = vec3(0.85, 0.8, 0.75);
      highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);
      highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
      vLighting = ambientLight + (directionalLightColor * directional);
    }
    `,
    fragmentSource : `
    varying highp vec2 vTextureCoord;
    varying highp vec3 vLighting;
    uniform sampler2D uSampler;
    void main(void) {
      highp vec4 texelColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
      gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
    }
    `,
    attributes: {
      aVertexPosition : {},
      aTextureCoord : {},
      aVertexNormal : {}
    },
    uniforms: {
      uMVMatrix : { value : null},
      uPMatrix : { value : null},
      uNormalMatrix : { value : null},
      uSampler : { value : null}
    }
  };

  application.renderer.add_shader(shader);

}();
