// Requirements

var Config = require('./app/config');
var Express = require('express');

// Application config

var app = Express();
app.use(Express.static(__dirname + Config.web));

// Routes

app.use('/', require('./app/routes')(__dirname + Config.web));

// Start server

app.listen(Config.port);
console.log('Listening on port ' + Config.port);

module.exports = app;
