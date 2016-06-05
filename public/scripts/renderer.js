// Renderer

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("renderer.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  var renderer = {

    // Members

    context : null,
    params : {
      colors: {
        background: {r: 0.2, g: 0.2, b: 0.2},
        particles: {r: 0.9, g: 0.9, b: 0.9}
      }
    },

    // Methods

    clear : function(){

      // References

      var background_color = renderer.params.colors.background;

      // Clear background

      renderer.context.clearColor(background_color.r, background_color.g, background_color.b, 1.0);
      renderer.context.clear(renderer.context.COLOR_BUFFER_BIT);
    }
  };

  application.renderer = renderer;

}();
