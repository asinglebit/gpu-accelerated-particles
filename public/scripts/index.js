void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("index.js : No 'application' found! Be sure to load it up first!");
    return;
  };

  // Bootstrap

  document.addEventListener("DOMContentLoaded", function(event) {
    application.initialize('viewport');
  });
  
}();
