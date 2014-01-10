var settings = {
	
	years: [1990,2013],

	query: '"global warming" OR "climate change"', // limited to 100 pages !

	authorBlacklist: ["the associated press","reuters","nobyline","the new york times","dealbook","the editorial board"],

	apiKey: "nyt API Key",

	delay: 300, //ms between each call
	
};

module.exports = settings;