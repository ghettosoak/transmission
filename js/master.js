(function(a){function b(){}for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){a[d]=a[d]||b;}})
(function(){try{console.log();return window.console;}catch(a){return (window.console={});}}());

//jquery v1.8.0 is included in this mess. Copyright 2012 jQuery Foundation and other contributors.
//like something you see, but can't read this unholy mess? drop me a line at (mif)[at](awe)[minus](schaffhausen)[dot](com)

var $window = $(window);
var $body = $('body');
var $master = $('#master');
var $dimension = $('.dimension');
var directionCount = 0;
var windowDimension = 0;
var wwidth = $window.width();

// $.ajax({
// 	url:'http://suggestqueries.google.com/complete/search?client=firefox&q=hello',
//     success: function(results) {
//     	console.log(results)
//     },
//     error: function ( jqXHR, textStatus, errorThrown) { 
//     },
//     dataType:'JSONP' 
// });

function map_range(value, low1, high1, low2, high2) {
    return (low2 + (high2 - low2) * (value - low1) / (high1 - low1)).toFixed(2);
}

var handlebarsCache = {};
var render = function (template, data, callback) {
	// thanks, nodz! :D
    if (handlebarsCache[template] !== undefined) {
        callback(handlebarsCache[template](data));
    }
    else {
        $.ajax({
            url: 'inc/'+template+'.mustache',
            success: function(rawTemplate) {
                handlebarsCache[template] = Handlebars.compile(rawTemplate);
                callback(handlebarsCache[template](data));
            },
            error: function ( jqXHR, textStatus, errorThrown) {
                throw new Error(errorThrown);
            },
            dataType: 'text'
        });
    }
};

function searchInit(target){

	$(target).selectize({
	    valueField: 'name',
	    labelField: 'name',
	    searchField: 'name', 
	    create: false,
	    render: {
	        option: function(item, escape) {
	            return '<div>' + item.name + '</div>';
	        }
	    },
	    load: function(query, callback) {
	    	console.log(query)
	        if (!query.length) return callback();
	        $.ajax({
	            url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + query,
	            dataType:'JSONP',
	            type: 'GET',
	            error: function() {
	                callback();
	            },
	            success: function(res) {
	                var payload = [{name: query}];
	                for (var i in res[1]){
	                	payload.push( {name: res[1][i]} )
	                }
	                callback(payload);
	            },
	        });
	    },
	    onDropdownOpen: function($dropdown){
	    	$dropdown.parents('.direction').addClass('typing')
	    },
	    onDropdownClose: function($dropdown){
	    	$dropdown.parents('.direction').removeClass('typing')
	    },
	    onItemAdd: function(value, $item){
	    	$item.parents('.direction').removeClass('typing')
	    	search(value, $item.parents('.direction'))
	    },
	    onInitialize: function(){

	    	if ( $master.scrollLeft() !== 0){
		    	$master.animate({
		    		scrollLeft: 0  
		    	}, 500, 'easeInOutExpo', function(){
		    		$('.direction').first().find('input').focus();
		    	});
			}
			else{
		    	setTimeout(function(){
		    		$('.direction').first().find('input').focus();
		    	}, 50);
			}
	    }
	});
}

function search(value, $target){
	$.ajax({ 
		url:'https://www.googleapis.com/customsearch/v1?key=AIzaSyBvZPScRDn1MBRzaT72PGrLrmUWGxfzY5Y&cx=010037151022968712165:ppioqj6qrsa&q=' + value,
	    success: function(results) {
	    	render('results', results, function(returned){
	    		$target.find('.steps').append(returned);
	    	});
	    },
	    error: function ( jqXHR, textStatus, errorThrown) { },
	});
}

var map = [];

$(document).on('keyup keydown', function(e){
	var f = e;
	map[f.keyCode] = f.type === 'keydown';
	console.log(map)
	console.log(f.keyCode)

	var $active = $(document.activeElement)

	if (  // COMMAND / CTRL + ENTER
			// (map[13] && map[17]) ||
			(map[13] && map[91])
		){
		f.preventDefault();
		map[13] = map[91] = false;
		addDirection();
	}

	if (map[13]){ // ENTER
		if ($active.prop('tagName') === 'A'){
			f.preventDefault();

			map[13] = false;


			window.open($active.attr('href'), '_blank');
		}
	}

	// else 
	if (map[38]){ // UP ARROW
		if ($active.prop('tagName') === 'A'){
			// if ($active.index() === 0)
			// 	$active.parent().prev('.selectize-control').find('.selectize-input').click();
			// else
				$active.prev().focus();
		}
	}

	else if (map[40]){ // DOWN ARROW
		if ($active.prop('tagName') === 'INPUT'){
			$active.parents('.selectize-control').next().children('a').first().focus();
		}
		else if ($active.prop('tagName') === 'A'){
			$active.next().focus();
		}
	}

	else if (map[9] && map[16]){ // SHIFT + TAB
		f.preventDefault();
		$active.parents('.direction').prev().find('.steps a').first().focus();
	}

	else if (map[9]){ // TAB
		f.preventDefault();
		$active.parents('.direction').next().find('.steps a').first().focus();
	}
});

// $master.mousewheel(function(e, delta) {
// 	// e.preventDefault();

// 	// if (
// 	// 	(windowDimension >= 0) && 
// 	// 	(windowDimension <= (directionCount * 500) - (wwidth - 70))
// 	// ){
// 		if (delta < 0)
// 			windowDimension += 25;
// 		else
// 			windowDimension -= 25;
		
		
// 	// }


// 	// else 
// 	if (windowDimension < 0)
// 		windowDimension = 0
// 	else if (windowDimension > (directionCount * 500) - (wwidth - 70))
// 		windowDimension = (directionCount * 500) - (wwidth - 70)


// 	// this.scrollLeft = windowDimension;

// 	vastCtrl(windowDimension); 

// });

$('.add_direction').click(addDirection);

function addDirection(){
	console.log('ADDING')
	render('direction', {}, function(returned){
		$('body').attr('data-direction-count', ++directionCount);
		// var $returned = $(returned).prependTo('.dimension');
		var $returned = $(returned).insertAfter('.add_direction');
		searchInit( $returned.find('.find') );

		$dimension.addClass('incoming')
		setTimeout(function(){ 
			$dimension.removeClass('incoming')
			$('.direction').first().addClass('settled')
		}, 500);
	});
}

addDirection();
// addDirection();
// addDirection();
// addDirection();


function vastCtrl(where){
	// console.log(where)

	// console.log(where / $window.width())

	var go = map_range(
		where,
		0,
		((directionCount * 500) - (wwidth - 70)),
		0,
		100
	)

	console.log(go)
	console.log(wwidth)

	$master.css('background-position', go + '% 50%');
}
















