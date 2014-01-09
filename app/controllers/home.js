var mongoose = require('mongoose');
var models = require('../models/book');
var _ = require('underscore');
var fs = require('fs');
var marked = require('marked');

var config = require('../../config.js');
var utils = require('bam.utils');

var init = require('bam.init');

// we can do things at start !

//init.load();
//init.dbToFile();

/*

	API Controllers

*/

////////////////////////////////////////////////////////////////////////
// main page
exports.index = function (req, res) {
	// we will serve the README.md files, nothing more
	fs.readFile(__dirname+'/../../README.md', 'utf8', function (err,data) {
		if (err) return console.log(err);
		else {
			res.render('home', {
				readme: marked(data)
			})
		}
	});
}
////////////////////////////////////////////////////////////////////////
exports.all = function (req, res) {
	models.all.find().lean().exec(function(er, docs) {
		if (er !== null) {console.log("no book");}
		else {
			// suppose we are fecthing a unique element: the whole book
			console.log("documents:"+docs.length);
			docs = _.map(docs, function(d) {
				return utils.extractAuthors(d.meta);
			})
			res.json(docs);
		}
	});
};
exports.write = function (req, res) {
	init.dbToFile();
	return res.json({status:"launched"});
};
////////////////////////////////////////////////////////////////////////
// authors
exports.authors = function (req, res) {
	init.getAuthors(function(perdates) {
		//return res.json({authors:authors});
		res.render('authors', {
			dates:perdates
		})
	});
}

