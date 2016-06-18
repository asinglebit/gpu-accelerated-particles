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

  var K_EASING = 0.9;

  var HOME_VIEW = {
    YAW_ANGLE : 0.785398,
    PITCH_ANGLE : 0.785398,
    RADIUS : 3
  }

  var camera = function(fov, near, far, aspect) {
    this.fov = fov;
    this.near = near;
    this.far = far;
    this.aspect = aspect;

    this.yaw_angle = HOME_VIEW.YAW_ANGLE;
    this.pitch_angle = HOME_VIEW.PITCH_ANGLE;
    this.radius = HOME_VIEW.RADIUS;
    this.pos = [0.0, 0.0, HOME_VIEW.RADIUS];
    this.target = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.right  = [1.0, 0.0, 0.0];

    this.view_matrix = mat4.create();
    this.projection_matrix = mat4.create();
    this.view_projection_matrix = mat4.create();

    this.delta = {
      rotation : [0, 0],
      pan : [0, 0],
      zoom : 0
    }
  };

  camera.prototype.update = function() {

    // Rotation easing

    if (this.delta.rotation[0] != 0){
      this.yaw_angle += this.delta.rotation[0];
      this.delta.rotation[0] = this.delta.rotation[0] * K_EASING;
      if (Math.abs(this.delta.rotation[0]) < 0.00001) this.delta.rotation[0] = 0;
    }
    if (this.delta.rotation[1] != 0){
      this.pitch_angle += this.delta.rotation[1];
      this.delta.rotation[1] = this.delta.rotation[1] * K_EASING;
      if (Math.abs(this.delta.rotation[1]) < 0.00001) this.delta.rotation[1] = 0;
    }

    // Translation easing

    if (this.delta.pan[0] != 0){
      vec3.scaleAndAdd(this.target, this.target, this.right, this.delta.pan[0] * this.radius);
      this.delta.pan[0] = this.delta.pan[0] * K_EASING;
      if (Math.abs(this.delta.pan[0]) < 0.00001) this.delta.pan[0] = 0;
    }
    if (this.delta.pan[1] != 0){
      vec3.scaleAndAdd(this.target, this.target, this.up, this.delta.pan[1] * this.radius);
      this.delta.pan[1] = this.delta.pan[1] * K_EASING;
      if (Math.abs(this.delta.pan[1]) < 0.00001) this.delta.pan[1] = 0;
    }

    // Zoom easing

    if (this.delta.zoom != 0){
      if (this.radius > this.delta.zoom){
        this.radius -= this.delta.zoom * this.radius;
        this.delta.zoom = this.delta.zoom * K_EASING;
      } else {
        this.radius = 0.1;
        this.delta.zoom = 0;
      }
    }

    // Update variables

    this.calculate();

    // Update matrices

    mat4.lookAt(this.view_matrix, this.pos, this.target, this.up);
    mat4.perspective(this.projection_matrix, this.fov * 2.0, this.aspect, this.near, this.far);
    mat4.mul(this.view_projection_matrix, this.projection_matrix, this.view_matrix);
  };

  camera.prototype.reset = function() {
    this.yaw_angle = HOME_VIEW.YAW_ANGLE;
    this.pitch_angle = HOME_VIEW.PITCH_ANGLE;
    this.radius = HOME_VIEW.RADIUS;
    this.pos = [0.0, 0.0, HOME_VIEW.RADIUS];
    this.target = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.right = [1.0, 0.0, 0.0];
  };

  camera.prototype.rotate = function(x, y) {
    this.delta.rotation[0] = (this.delta.rotation[0] == 0) ? x : this.delta.rotation[0] + x;
    this.delta.rotation[1] = (this.delta.rotation[1] == 0) ? y : this.delta.rotation[1] + y;
  };

  camera.prototype.pan = function(x, y) {
    this.delta.pan[0] = (this.delta.pan[0] == 0) ? x : this.delta.pan[0] + x;
    this.delta.pan[1] = (this.delta.pan[1] == 0) ? y : this.delta.pan[1] + y;
  };

  camera.prototype.zoom = function(value) {
    this.delta.zoom = value;
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

  application.constructors = application.constructors || {};
  application.constructors.camera = camera;

}();
