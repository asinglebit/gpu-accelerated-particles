// Audio

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("audio.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Globals

  // Private members

  var _audio = null;

  // Private methods

  var _initialize = function(){
    _audio = new Audio('./audio/audio.mp3');
    _audio.play();
    _audio.addEventListener('timeupdate', function(){
      var buffer = .44
      if(this.currentTime > this.duration - buffer){
        this.currentTime = 0
        this.play()
      }
    }, false);
  }

  // Public

  var audio = {

    // Public methods

    initialize : _initialize

  };

  application.audio = audio;
}();
