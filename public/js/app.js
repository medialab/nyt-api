
console.log("loading");

$(document).ready(function () {

	// init tooltips
	$(".author").each(function(e) {
		var t = $(this);

		t.attr("title","<ul>"+t.find("ul").html()+"</ul>");

		t.tipsy({
			html: true,
			//delayOut: 2000,
			trigger: 'manual'
		});

	});

	// on hover
	$(".author").on("click",function(e) {
		
		$(".tipsy").remove();
		
		$(this).tipsy("show");
		
		$('.author').removeClass("active");

		var c = $(this).attr("data-class");
		
		console.log("class: "+c);
		
		$('.'+c).addClass("active");
		
	});

});