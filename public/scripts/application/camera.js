// Camera

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("camera.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  if (typeof application.renderer == "undefined") {
    console.log("camera.js : No 'renderer' module found! Be sure to load it up first!");
    return;
  };

  // Private members

  var camera = function(fov, near, far, aspect) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;

    this.yaw_angle = 0.0;
    this.pitch_angle = 0.0;
    this.radius = 1.0;

    this.pos = [0.0, 0.0, 1.0];
    this.target = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.right  = [1.0, 0.0, 0.0];

    this.view_matrix = mat4.create();
    this.projection_matrix = mat4.create();
    this.view_projection_matrix = mat4.create();
  };

  camera.prototype.update = function() {
    mat4.lookAt(this.view_matrix, this.pos, this.target, this.up);
    mat4.perspective(this.projection_matrix, this.fov*2.0, this.aspect, this.near, this.far);
    mat4.mul(this.view_projection_matrix, this.projection_matrix, this.view_matrix);
  };

  camera.prototype.reset = function() {
    this.yaw_angle = 0.0;
    this.pitch_angle = 0.0;
    this.radius = 1.0;
    this.pos = [0.0, 0.0, this.radius];
    this.target = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.right = [1.0, 0.0, 0.0];
  };

  camera.prototype.rotate = function(x, y) {
    this.yaw_angle += x;
    this.pitch_angle += y;
  };

  camera.prototype.pan = function(x, y) {
    vec3.scaleAndAdd(this.target, this.target, this.right, x);
    vec3.scaleAndAdd(this.target, this.target, this.up, y);
  };

  camera.prototype.zoom = function(value) {
    this.radius -= value;
  };

  camera.prototype.calculate = function() {
    var calcPos = [Math.sin(this.yaw_angle), 0.0, Math.cos(this.yaw_angle)];
    this.right = [calcPos[2], 0.0, -calcPos[0]];
    var pitchRot = mat4.create();
    mat4.rotate(pitchRot, pitchRot, this.pitch_angle, this.right);
    vec3.transformMat4(calcPos, calcPos, pitchRot);
    vec3.scale(calcPos, calcPos, this.radius);
    vec3.add(this.pos, this.target, calcPos);
    vec3.cross(this.up, calcPos, this.right);
    vec3.normalize(this.up, this.up);
  };

  // Public

  application.camera = camera;

}();
