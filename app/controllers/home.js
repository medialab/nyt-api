var mongoose = require('mongoose');
var models = require('../models/book');
var _ = require('underscore');
var fs = require('fs');
var marked = require('marked');

var config = require('../../config.js');
var utils = require('bam.utils');

var init = require('bam.init');

// we can also do things at start !

//init.startFetching();
//init.dbToFile();

/*

	API Controllers

*/

////////////////////////////////////////////////////////////////////////
exports.all = function (req, res) {
	models.all.find().lean().exec(function(er, docs) {
		if (er !== null) {console.log("no book");}
		else {
			// suppose we are fecthing a unique element: the whole book
			console.log("documents:"+docs.length);
			res.json(docs);
		}
	});
};
////////////////////////////////////////////////////////////////////////
exports.write = function (req, res) {
	init.dbToFile();
	return res.json({status:"launched"});
};
////////////////////////////////////////////////////////////////////////
exports.launch = function (req, res) {
	init.startFetching();
	return res.json({status:"launched"});
};
////////////////////////////////////////////////////////////////////////
exports.authors = function (req, res) {
	init.getAuthors(function(perdates) {
		//return res.json({authors:authors});
		res.render('authors', {
			dates:perdates
		})
	});
}

