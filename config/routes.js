// controllers
var home = require('home');
var utils = require('bam.utils');

// define routes for the Book API
module.exports = function (app, passport) {
	// empty homepage
	app.get('/all', home.all);
	app.get('/write', home.write);
	app.get('/launch', home.launch);
	app.get('/authors', home.authors);
}
