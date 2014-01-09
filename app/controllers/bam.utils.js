/*

	Home made Utilities

	Constants

*/

var $ = require('jquery');
var _ = require('underscore');
var fs = require('fs');
var colors = require('colors');

var utils = {};

var colors = require('colors');

colors.setTheme({
  silly: 'rainbow',
  input: 'grey',
  verbose: 'cyan',
  prompt: 'grey',
  info: 'green',
  data: 'grey',
  help: 'cyan',
  warn: 'yellow',
  debug: 'blue',
  error: 'red'
});

utils.log = function(str,format) {
  if(!format) var format = "info";
  console.log(colors[format](str));
}


utils.writeArrayToCsv = function(array,fileToSave) {
  var separator = ';';
  // heavy first loop to have all the keys
  var keys = {};
  _.each(array, function(a) {
    _.each(_.keys(a), function(k) {
      keys[k] = "yeah!";
    });
  });
  keys = _.keys(keys);

  //var header = JSON.stringify(keys);
  //header = header.slice(1,header.length-1);
  var header = keys.join(separator);
  var content = header + "\n";

  _.each(array, function(o) {
    var line = "";
    _.each(keys, function(k) {
      if(o.hasOwnProperty(k)) {
        var lstr = o[k] ? o[k].replace(/;/g,',').replace(/[\n\r]+/g,' ') : "";
      } else {
        var lstr = "";
      }
      line += lstr + separator;
    });
    content += line.slice(0,line.length-1) + "\n"; 
  });
  fs.writeFile(fileToSave, content , function(err) {
    if(err) {
        utils.log(err,"error");
    } else {
        utils.log("file saved: "+fileToSave,"help");
    }
  });
};

utils.serialize = function(obj) {
	var str = [];
	for(var p in obj)
	str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
	return str.join("&");
};

var desaccent = function(str) {
	return str
		.replace(/[ÙÛÜÚùûüú]/,"u")
		.replace(/[ÓÖÔÒóòôö]/,"o")
		.replace(/[ÎÏÌÍîïìí]/,"i")
		.replace(/[ÉÈËÊéêèë]/,"e")
		.replace(/[ÄÁÀÂäàáâ]/,"a")
};
var getName = function(p) {
	var conc = p.firstname ? p.firstname:"";
	conc += p.middlename ? " "+p.middlename:"";
	conc += p.lastname ? " "+p.lastname:"";
	conc += p.qualifier ? " "+p.qualifier:"";
	conc = desaccent(conc.toLowerCase());
	return conc.replace(/\s+nyt/,"").trim();
};

var blackList = ["the associated press","reuters","nobyline","the new york times","dealbook","the editorial board"];

utils.extractTheAuthors = function(meta) {
	var d = meta.byline;
	if(d) {
		// from byline
		var byline = d.original ? desaccent(d.original)
			.replace(": Malcolm W. Browne reports on science for The New York Times. He made his third trip to Antarctica last December","")
			.replace(": William Safire is a columnist for The Times","")
			.replace("assistant professor of environmental sciences at Barnard","")
			.replace("scientists at Columbia's Lamont-Doherty Earth Observatory and department of earth and environmental engineering,","")
			.replace(/\s+/g," ")
			.replace("[cC]ompiled ","")
			.replace(/By |by /,"")
			.replace(/\s\(nyt\)/g,"")
			.replace(/\(.*\)/g,"")
			.toLowerCase()
			.replace("special to the new york times","")
			.replace("a.&#160","")
			.replace("a.&nbsp","")
			.split(";")[0]
			.split("|")[0].trim() : "nobyline";
		var aAuthors = byline.split(/, and +| +and +| *, */);
		blAuthors = [];
		_.map(aAuthors, function(a){
			if(a.length>2) blAuthors.push(a);
		});

		// from Persons
		var pAuthors = [];
		if(d.person) {
			_.each(d.person, function(p) {
				if(getName(p).length>2)
					pAuthors.push(getName(p));
			});
		} else {
			pAuthors = [];
		}

		// now check the 2 different arrays
		if(pAuthors.length!=blAuthors.length) {
			return pAuthors.length<blAuthors.length ? blAuthors : pAuthors;
		} else {
			var diff = false;
			_.each(pAuthors, function(e,k){
				diff = pAuthors[k]==blAuthors[k] ? diff : true;
			});
			if(diff) {
				if(pAuthors.length==1) {
					// test if inclusion
					if(pAuthors[0].indexOf(blAuthors[0])!=-1)
						return pAuthors;
					if(blAuthors[0].indexOf(pAuthors[0])!=-1)
						return blAuthors;
				}
				console.log("-"+pAuthors.join("|")+"=="+blAuthors.join("|")+"-");
				//return ["error"];
				return blAuthors;
			} else {
				return pAuthors;
			}
		}
	} else {
		return [];
	}
};

utils.extractAuthors = function(meta) {
	var authors = utils.extractTheAuthors(meta);
	return filtered = _.difference(authors,blackList);
};

module.exports = utils;


