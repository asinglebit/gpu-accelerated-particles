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

    this.pos = [0.0, 0.0, 1.0];
    this.target = [0.0, 0.0, 0.0];
    this.up = [0.0, 1.0, 0.0];
    this.right  = [1.0, 0.0, 0.0];

    this.viewMat = mat4.create();
    this.projMat = mat4.create();
    this.viewProjMat = mat4.create();
  };

  camera.prototype.update = function() {
    mat4.lookAt(this.viewMat, this.pos, this.target, this.up);
    mat4.perspective(this.projMat, this.fov*2.0, this.aspect, this.near, this.far);
    mat4.mul(this.viewProjMat, this.projMat, this.viewMat);
  };

  // Public

  application.camera = camera;

}();
