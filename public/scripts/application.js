// Application constructor
function Application(){
  var that = this;

  that.canvas = null;
  that.context = null;
  that.width = null;
  that.height = null;
  that.gui = null;
  that.controls = null;

  that.params = {
    colors: {
      background: {r: 1, g: 1, b: 1}
    }
  };
};

// Initialize
Application.prototype.initialize = function(canvas){
  var that = this;

  // Get canvas
  that.canvas = document.getElementById(canvas);
  that.width = that.canvas.offsetWidth;
  that.height = that.canvas.offsetHeight;
  // Get context
  that.context = that.canvas.getContext("experimental-webgl");
  that.context.viewport(0, 0, canvas.width, canvas.height);
  // Initialize systems
  that.initializeGUI();
};

Application.prototype.tick = function(){
  var that = this;

  requestAnimationFrame(that.tick);
}

// Clear background
Application.prototype.clear = function(){
  var that = this;
  var background_color = that.params.colors.background;

  that.context.clearColor(background_color.r, background_color.g, background_color.b, 1.0);
  that.context.clear(that.context.COLOR_BUFFER_BIT);
}

// Initialize GUI
Application.prototype.initializeGUI = function(){
  var that = this;

  that.controls = {
    background: [255, 255, 255],
    clear: function() {
      that.clear();
    }
  };

  that.gui = new dat.GUI();

  that.gui.addColor(that.controls, "background").onChange(function(value) {
    if (value[0] === "#") value = Utilities.hexademicalToRGB(value);
    that.params.colors.background.r = value[0] / 255.0;
    that.params.colors.background.g = value[1] / 255.0;
    that.params.colors.background.b = value[2] / 255.0;
  });

  that.gui.add(that.controls, "clear");
}
