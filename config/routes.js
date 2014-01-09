// controllers
var home = require('home');
var utils = require('bam.utils');

// define routes for the Book API
module.exports = function (app, passport) {
	// empty homepage
	app.get('/', home.all);
	app.get('/write', home.write);
	app.get('/authors', home.authors);

}
