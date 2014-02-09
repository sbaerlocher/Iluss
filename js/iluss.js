$(function() {
	
	var GlobalHeightWinodw = $( window ).height();

	var SliderHeight = function() {

	$('.cell img').css('height', (GlobalHeightWinodw - $('header').height()) * 0.8 + 'px');
	$('#album-intro .wrap').css('height', (GlobalHeightWinodw - $('header').height()) * 0.8 + 'px');
	
	}
	
	SliderHeight()
	
	if ($('#site-title img').length) {
		$('#site-title img').on('load', function() {
			$('#lane').css('top', $('header').height() + 'px');

		});
	}

	$('#albums').css({
		top: ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height()+ 30 + 'px'
	});

	$('#text').css({
		top: ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height()+ 30 + 'px'
	});

	$('#lane').css({
		top: ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height()+ 30 + 'px',
		width: '99999px' // prevents jumpiness when defining width after images load
	});

	window.addEventListener( 'orientationchange', function() {
		window.setTimeout(function() {
			$('#lane').css( 'top', ( $('header').css('display') === 'none' || $('header').css('visibility') === 'hidden' ) ? '0px' : $('header').height() + 'px' );
		},500)
		return false;
	});

	var imgsLoaded = [],
		totalImgs = $('#lane img').length,
		totalWidth = 0,
		imgViewing = 0,
		imgOffsets = [],
		firstRun = true,
		allImagesLoaded = false;

	if ($.support.pjax) {
		$(document).on('click', '#lane a', function() {
			if (!$('body').hasClass('k-source-album')) {
				if ($('#lane').length) {
					var self = $(this);

					// Write the album title or remove it
					if ( $(this).closest('#lane').length > 0 ) {
						$('#site-title h2').html( '/&nbsp;' + $(this).text().trim());
					} else {
						$('#site-title h2').html('');
					}
					//
					

					$.pjax({
						url: self.attr('href'),
						container: '#lane'
					});
					
					return false;
				}
			}
		});
	}

	$(document).on('pjax:complete', function() {
	
		if ($('#album-intro').length > 0) {
			$('#site-title h2').html( '/&nbsp;' + $('#album-intro h1').text().trim());
			$("a[title|='Albums']").addClass( "k-nav-current" );
		}
		
		window.scrollTo(0,0);
		imgsLoaded = [];
		totalImgs = $('#lane img').length;
		totalWidth = 0;
		imgViewing = 0;
		imgOffsets = [];
		firstRun = true;
		allImagesLoaded = false;
		$K.ready();
		setupLaneHandler();
		SliderHeight();
	

	});

	var scrollTo = function() {

		if ( imgViewing >= totalImgs ) {
			imgViewing = ( totalImgs - 1 );
		} else if ( imgViewing < 0 ) {
			imgViewing = 0;
		}

		var newLeftPos = $('#lane img:eq(' + imgViewing + ')').closest('.cell').offset().left;

		if (imgViewing === 0 && $('#album-intro').length) {
			newLeftPos = 0;
		}

		$('html,body').stop().animate({
			scrollLeft: ( newLeftPos - 80 )
		}, 400, function(x, t, b, c, d) {
			var s=1.70158;var p=0;var a=c;
			if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
			if (a < Math.abs(c)) { a=c; var s=p/4; }
			else var s = p/(2*Math.PI) * Math.asin (c/a);
			if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
			return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
		});

	}

	var updateLaneWidth = function(width) {
		var width = 0,
			offset = ( $('#album-intro').length <= 0 ) ? 0 : $('#album-intro').outerWidth(true); // Adjust for albums which have a text box at the beginning
		$('#lane img').each(function() {
			width += $(this).closest('.cell').outerWidth(true);

		});
		$('#lane').css( 'width', (width+offset) + 'px' );
	}

	var setupLaneHandler = function() {
		window.setTimeout(function() {
			$('#lane img')
				.css('cursor','pointer')
				.on('click', function() {
					if ( !($('body').hasClass('k-source-album') || $('body').hasClass('k-source-favorites')) ) { return true; }
					var _index = (!$('#album-intro').length) ? $(this).closest('.cell').index()+1 : $(this).closest('.cell').index();
					if ( _index <= imgViewing ) {
						imgViewing--;
					} else if ( _index > imgViewing ) {
						imgViewing++;
					}
					scrollTo();

					return false;
				})
				.each(function(i,img) {
					if ( !this.complete ) {
						$(this).on('load', function() {
							if ( i === ($('#lane img').length-1) ) {
								updateLaneWidth();
							}
						});
					} else {
						if ( i === ($('#lane img').length-1) ) { updateLaneWidth(); }
					}
				});
				$(window).trigger('resize');
		},1); // Do not use 0 here
	}

	setupLaneHandler();

	$(window).on('k-infinite-loaded', function() {
		window.setTimeout(function() {
			setupLaneHandler();
		},1);
	});

	var checkLane = function() {
		(!$('#lane .cell').length) ? $('#next,#prev').hide() && $('#lane').width('auto') : $('#next,#prev').show();
	}

	$(window).on('k-pjax-end', checkLane);
	$(window).on('k-infinite-loaded', function() {
		totalImgs = $('.cell').length;
	});
	checkLane();

	$(document).scroll(function() {
		$('#lane img').each(function(i,img) {
			if ( $(this).closest('.cell').offset().left > $(window).scrollLeft() ) {
				imgViewing = i;
				return false;
			}
		});
	});

	$('#next,#prev').on('click', function() {
		imgViewing += ( $(this).attr('id') === 'next' ) ? 1 : -1;
		scrollTo();
		return false;
	});

	$('body').on('mousewheel', function(event, delta, deltaX, deltaY) {
       imgViewing += ( $(this).attr('id') === 'next' ) ? delta : -deltaY;
       scrollTo();
	});


});