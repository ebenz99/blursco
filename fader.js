$(window).scroll(example);

function example(){
	($(".headblock")).css("opacity", 1 - (($(document)).scrollTop()) / 250);
}