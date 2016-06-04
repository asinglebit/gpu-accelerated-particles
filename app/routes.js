var Router = require('express').Router();

module.exports = function(root){

  // Single Page Application

  Router.get('*', function (req, res) {
    res.sendFile(root + '/index.html');
  });

  return Router;
}
