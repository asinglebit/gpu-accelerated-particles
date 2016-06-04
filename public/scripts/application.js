// Application constructor
function Application(){
  this.canvas = null;
  this.context = null;
  this.width = null;
  this.height = null;
};

// Initialize
Application.prototype.initialize = function(canvas){
  // Get canvas
  this.canvas = document.getElementById(canvas);
  this.width = this.canvas.offsetWidth;
  this.height = this.canvas.offsetHeight;
  // Get context
  this.context = this.canvas.getContext("experimental-webgl");
  this.context.viewport(0, 0, canvas.width, canvas.height);
};

// Clear background
Application.prototype.clear = function(){
  var context = this.context;
  context.clearColor(0.0, 0.0, 0.0, 1.0);
  context.clear(context.COLOR_BUFFER_BIT);
}
