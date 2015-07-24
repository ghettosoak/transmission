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
var delta = 500;
var lastKeypressTime = 0;

$window.load(function(){
	if (

		( window.navigator.platform === 'Mac68K') ||
		( window.navigator.platform === 'MacPPC') ||
		( window.navigator.platform === 'MacIntel')
	){
		$('html').addClass('cmd');
	}


	directionZeroTimer = 0;
	if ( readCookie('credited') !== 'true' || !readCookie('credited') ){
		addDirection(false, true);
		directionZeroTimer = 1000;
	}

	setTimeout(addDirection, directionZeroTimer);
	// addDirection();
	// addDirection();
	// addDirection();
});

$('body').on('click', '.first button', function(e){
	var $that = $(this)
	$that.toggleClass('okaygotit')

	if ($that.hasClass('okaygotit'))
		createCookie('credited', 'true');
	else
		eraseCookie('credited');
});

$('body').on('click', '.credit', function(e){
	addDirection(false, true);
});



function lead(value, target){
	$('.leads_' + target).empty();

    $.ajax({
        url: 'http://suggestqueries.google.com/complete/search?client=firefox&q=' + value,
        dataType:'JSONP',
        type: 'GET',
        // url: 'js/lead_result.json',
        error: function(res) {
        	console.log('OH NOES')
        },
        success: function(results) {

        	render('leads', { leads: results[1] }, function(returned){ 
        		$('.leads_' + target).append(returned);
        	});

        	setTimeout(function(){
	        	$('.direction_' + target).addClass('leading')
        	}, 40);
        }
    });
}

$('body').on('click', '.lead', function(e){
	e.preventDefault()
	var $that = $(this);
	step( $that.html(), $that.parents('.direction').data('number') );
});

function step(value, target){
	console.log(value, target)
	$('.direction_' + target).addClass('loading');
	$.ajax({ 
		url:'https://www.googleapis.com/customsearch/v1?key=AIzaSyBvZPScRDn1MBRzaT72PGrLrmUWGxfzY5Y&cx=010037151022968712165:ppioqj6qrsa&q=' + value,
	    success: function(results) {
	    	console.log(results)

	    	render('steps', results, function(returned){
	    		$('.direction_' + target).find('.steps').append(returned);
	    	});

        	$('.direction_' + target).removeClass('loading').addClass('stepping')
	    },
	    error: function ( jqXHR, textStatus, errorThrown) { },
	});
}

$('body').on('click', '.step', function(e){
	$(this).addClass('visited');
});

$('body').on('click', '.refind', function(e){
	var $that = $(this).prev();

	if ($that.parent('.direction').hasClass('leading')){
		$that.blur();
		addDirection( $that.val() );
	}
});


var map = [];

$(document).on('keyup keydown', function(e){
	var f = e;
	map[f.keyCode] = f.type === 'keydown';
	// console.log(map)
	// console.log(f.keyCode)
	// console.log(f.type)

	var $active = $(document.activeElement)
	// console.log($active)

	if (  // COMMAND / CTRL + ENTER + SHIFT
			(map[13] && map[17] && map[16]) ||
			(map[13] && map[91] && map[16]) ||
			(map[13] && map[93] && map[16])
		){

		f.preventDefault();
		addDirection( $('.direction').first().children('.find').val() );
		map = []; 
	}

	if (  // COMMAND / CTRL + ENTER
			(map[13] && map[17]) ||
			(map[13] && map[91]) ||
			(map[13] && map[93])
		){

		f.preventDefault();
		addDirection();
		map = []; 
	}

	if (map[13]){ // ENTER
		if ($active.prop('tagName') === 'A'){
			f.preventDefault();

			if (!$active.parents('.direction').hasClass('stepping')){
				step( $active.html(), $active.parents('.direction').data('number') );
			}
			else{
				$active.addClass('visited');
				window.open($active.attr('href'), '_blank');
			}

		}
		else if ($active.prop('tagName') === 'INPUT'){


			var thisKeypressTime = new Date();

			if ( thisKeypressTime - lastKeypressTime <= delta ){
				step( $active.val(), $active.data('number') );

				thisKeypressTime = 0;
			}
			else{
				
				lead( $active.val(), $active.data('number') );
			}
			lastKeypressTime = thisKeypressTime;
		}

		map = []; 
	}

	// else 
	if (map[38]){ // UP ARROW
		console.log('UP')

		if ($active.prop('tagName') === 'A'){
			if ( $active.index() === 0 && !$active.parents('.direction').hasClass('stepping') )
				$active.parent().siblings('input').focus();
			else
				$active.prev().focus();

			if ( $active.index() === 0 && $active.parents('.direction').hasClass('stepping') )
				want( $active.parents('.direction') )
		}
	}

	else if (map[40]){ // DOWN ARROW
		console.log('DOWN')
		if ($active.prop('tagName') === 'INPUT'){

			if ( !$active.parents('.direction').hasClass('stepping') ){
				$active.siblings('.leads').children('a').first().focus();
			}
			else{
				$active.siblings('.steps').children('a').first().focus();

				setTimeout(function(){
					$('.direction').first().children('.steps').scrollTop(0);
				}, 20);
			}

		}
		else if ($active.prop('tagName') === 'A'){
			$active.next().focus();
		}
		else{
			$('.direction').first().children('.steps').children('.step').first().focus()
			setTimeout(function(){
				$('.direction').first().children('.steps').scrollTop(0);
			}, 20);
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



$('.add_direction').click(function(){
	addDirection();
});

function addDirection(val, first){
	console.log('ADDING')

	var renderTarget = 'direction';
	if (first) renderTarget = 'first';

	render(renderTarget, {number: ++directionCount, value: val}, function(returned){
		$('body').attr('data-direction-count', directionCount);
		var $returned = $(returned).prependTo('.dimension');

		if (val !== ''){
			$('.direction').first().find('input').focus();
		}

		setTimeout(function(){
			$dimension.addClass('incoming');
		}, 20);

		setTimeout(function(){ 
			$dimension.removeClass('incoming');
			$('.direction').first().addClass('settled');
		}, 500);
	});
}



function want($thisone){

	var $that = $thisone,
		wantVal = $that.attr('data-want');

	$that.attr('data-want', ++wantVal);

	if (wantVal >= 5){
		addDirection( $that.find('.find').val() );
	}
}

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

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function eraseCookie(name) {
	createCookie(name,"",-1);
}







