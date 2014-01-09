var mongoose = require('mongoose');
var utils = require('bam.utils');


var Schema = mongoose.Schema;

var AllSchema = new Schema({
	aid: String,
	meta:{},
})

exports.all = mongoose.model('all', AllSchema);


