var request = require('request');
var _ = require('underscore');
var fs = require('fs');
var mkdirp = require('mkdirp');
var moment = require('moment');

var config = require('../../config.js');
var utils = require('bam.utils');
var models = require('../models/book');

var init = {};

var delay = 200;

var nQueries = 0;

init.reqPage = function(q,di,page,callb) {
  var url = "http://api.nytimes.com/svc/search/v2/articlesearch.json";
	var data = {
    "q": q,
    "page":page,
    "begin_date":"19900101",
    "end_date":"20131231",
    // "begin_date":di[0],
    // "end_date":di[1],
    //sort:"newest" | oldest,
    //fq=filter-field:(filter-term)
    //additional-params=values]
    "api-key" : config.apiKey, 
	};
  var options = {
    uri: url,
    qs:  data
  };

  //utils.log("Q:"+q+" | page: "+page);
  utils.log(url+"?"+utils.serialize(options.qs),"help");

  //var wanted = ['q','section_name','abstract','lead_paragraph','keywords','source','web_url','pub_date','section_name','_id','word_count'];

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      try {
        data = JSON.parse(body);
        //console.log(JSON.stringify(data,null,4));

        var docs = data.response.docs;
        var total = data.response.meta.hits;
        utils.log(JSON.stringify(di)+" | total is "+total+" - page: "+page);

        _.map(docs, function(d) {
          d.q = q;
          d.date = moment(d.pub_date).format("YYYYMMDD");
          models.all.update({aid:d._id}, {meta:d,aid:d._id}, {upsert: true}, function() {
            //utils.log("data updated in DB","help");
          });
          return d;//_.pick(d,wanted);
        });
      } catch(err) {
        utils.log("Problem: "+err,"error");
      }

      //var arrayConcated = array.concat(docs);

      if((page+1)*10>total) { // finished !
        console.log(JSON.stringify(di)+" | done for: "+q);
        setTimeout( function() {
          callb();
        },delay);
      } else { // 
        setTimeout( function() {
          init.reqPage(q,di,page+1,callb);
        },delay);
      }

    } else {
      console.log("error:"+error);
    }
  });
};

init.fetchAndStore = function(q,k) {
  if(k<init.dis.length) {
    var di = init.dis[k];
    init.reqPage(q,di,0,function() {
      utils.log("ALL pages fetched !");
      init.fetchAndStore(q,k+1);
    });
  } else {
    utils.log("all time-intervals done"); 
  }
};

init.getAuthors = function(callb) {
  models.all.find().lean().exec(function(er, docs) {
    if (er !== null) {console.log("no book");}
    else {
      // suppose we are fecthing a unique element: the whole book
      var PERDATE = {};
      var MAXCOUNT = 0;

      var articles = _.map(docs,function(d) {
        var t = d.meta;
        var article = {
          name:   t.headline.main,
          url:    t.web_url,
        };

        var aList = utils.extractAuthors(t);
        var month = moment(t.pub_date).format("YYYYMM");

        if(PERDATE.hasOwnProperty(month)) {
          _.map(aList, function(a) {
            if(PERDATE[month].hasOwnProperty(a)) {
              PERDATE[month][a].articles = PERDATE[month][a].articles.concat([article]);
              PERDATE[month][a].count += 1;
              MAXCOUNT = Math.max(MAXCOUNT,PERDATE[month][a].count);
            } else {
              PERDATE[month][a] = {};
              PERDATE[month][a].articles = [article];
              PERDATE[month][a].count = 1;
            }
          });
          PERDATE
        } else {
          PERDATE[month] = {};
          _.map(aList, function(a) {
            PERDATE[month][a] = {};
            PERDATE[month][a].articles = [article];
            PERDATE[month][a].count = 1;
          });
        }
      });

      console.log("max author count is: "+MAXCOUNT);
      
      var arr = [];
      _.map(_.keys(PERDATE), function(d) {
        var keptAuthors = [];
        var auths = _.each(_.keys(PERDATE[d]), function(au) {

          var articles = PERDATE[d][au].articles;
          var count = PERDATE[d][au].count;
          
          if(count>1) keptAuthors.push({
            name: au,
            count: count,
            size: 0.5 + 3*count/MAXCOUNT,
            class: au.replace(/[\s\.]*/g,""),
            articles:articles
          });
        });
        var dat = d.slice(0,4)+"-"+d.slice(4,6)+"-01";
        arr.push({
          date:d,
          datestr:moment(dat).format('YYYY MMM'),
          authors:keptAuthors.sort(function(a,b){return b.count-a.count;})
        });
      });
      callb(arr);
    }
  });
};

init.dbToFile = function() {
  models.all.find().lean().exec(function(er, docs) {
    if (er !== null) {console.log("no book");}
    else {
      var articles = _.map(docs,function(d) {
        var t = d.meta;

        // which is the text we want to analyse?
        // the longest concatenated !
        var contents = [t.snippet,t.lead_paragraph,t.abstract];
        var concated = [];
        _.each(contents, function(c){
          if(concated.indexOf(c)==-1)
            concated.push(c);
        });
        concated = concated.length==0 ? "" : concated.join(" ");

        // authors
        var aList = utils.extractAuthors(t);
        authors = aList.length==0 ? "NC" : aList.join("|");

        return {
          'url':t.web_url,
          'snippet':t.snippet,
          'concated':concated,
          'lead_paragraph':t.lead_paragraph,
          'abstract':t.abstract,
          'source':t.source,
          'headline':t.headline.main,
          'section_name':t.section_name,
          'document_type':t.document_type,
          'type_of_material':t.type_of_material,
          'keywords':_.map(t.keywords, function(w) {
            return w.value;
          }).join('|'),
          'keys':_.map(t.keywords, function(w) {
            return w.value+"("+w.name+")";
          }).join('|'),
          'date':moment(t.pub_date).format("YYYYMMDD"),
          'authors':authors,
        }
      });
      console.log("writing articles: "+articles.length);
      init.writeFile(articles);
      //res.json(docs);
    }
  });
};

init.startFetching = function() {
  var res = [];
  var nMade = 0;

  var queryList = [
    config.query, 
  ];

  //querylist = querylist.slice(0,2);
  init.dis = [];
  for(var y=2013;y<2014;y=y+1) {
    init.dis.push([
      ""+(y)+"1201",
      ""+(y)+"1231",
    ]);
    // for(var m=1;m<12;m=m+1) {
    //   var mm = m<10 ? "0"+m : m;
    //   var mm1 = m+1<10 ? "0"+(m+1) : (m+1);
    //   init.dis.push([
    //     ""+y+mm+"01",
    //     ""+y+mm1+"01",
    //   ]);
    // }
  }
  //init.dis = init.dis.slice(9,init.dis.length);
  console.log(JSON.stringify(init.dis));
  
  init.fetchAndStore(queryList[0],0);
};

init.writeFile = function(res) {
  var fileName = "output";
  var filePath = fileName+".csv";
  utils.writeArrayToCsv(res,"data/"+filePath);
};

module.exports = init;
