// Audio

void function(){

  'use strict';

  // Check application availability

  if (typeof application == "undefined") {
    console.log("audio.js : No 'application' module found! Be sure to load it up first!");
    return;
  };

  // Globals

  var _started = false;

  // Private members

  var _context = null;
  var _source = null;
  var _muffle = null;

  // Private methods

  var _initialize = function(){

    // Initialize context

    _context = new (window.AudioContext || window.webkitAudio_context)();
    _source = _context.createBufferSource();
    _get_source(function(source){
      _muffle = _context.createBiquadFilter();
      _context.decodeAudioData(source, function(buffer) {
        _source.buffer = buffer;
        _source.loop = true;
        _source.connect(_muffle);
        _muffle.connect(_context.destination);
        _muffle.type = 0;
        _muffle.frequency.value = 2000;
      });
    });
  };

  // Get source

  var _get_source = function(callback){
    var request = new XMLHttpRequest();
    request.open('GET', './audio/audio.mp3', true);
    request.responseType = 'arraybuffer';
    request.onload = function() {
      callback(request.response);
    };
    request.send();
  };

  // Controls

  var _play = function(){
    if (!_started){
      _started = true;
      _source.start(0);
    };
  };

  var _set_muffle = function(value){
    _muffle.frequency.value = value;
  };

  // Public

  var audio = {

    // Public methods

    initialize : _initialize,
    set_muffle : _set_muffle,
    play : _play

  };

  application.audio = audio;
}();
