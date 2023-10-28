/*Speech Bubbles Tooltip (Initial: Dec 8th, 2010)
* This notice must stay intact for usage 
* Author: Dynamic Drive at http://www.dynamicdrive.com/
* Visit http://www.dynamicdrive.com/ for full source code
*/

var speechbubbles_tooltip={

	loadcontent:function($, selector, options, callback){
		var ajaxfriendlyurl=options.url.replace(/^http:\/\/[^\/]+\//i, "http://"+window.location.hostname+"/") 
		$.ajax({
			url: ajaxfriendlyurl, //path to external content
			async: true,
			dataType: 'html',
			error:function(ajaxrequest){
				alert('Error fetching Ajax content.<br />Server Response: '+ajaxrequest.responseText)
			},
			success:function(content){
				$(document.body).append(content)
				callback(selector)
				$(content).remove()
			}
		})

	},

	buildtooltip:function($, setting){
	var speechtext=(setting.speechid)? $('div#'+setting.speechid).html() : setting.speechtext
	if (speechtext){
		$speech=$('<div class="speechbubbles">'+speechtext+'</div>').appendTo(document.body)
		$speech.addClass('speechbubbles').append('<div class="speechbubbles-arrow-border"></div>\n<div class="speechbubbles-arrow"></div>')
		$speech.data('$arrowparts', $speech.find('div.speechbubbles-arrow, div.speechbubbles-arrow-border')) //store ref to the two arrow DIVs within tooltip
		var arrowheight=(window.XMLHttpRequest)? $speech.data('$arrowparts').eq(0).outerHeight() : 10
		$speech.data('measure', {w:$speech.outerWidth(), h:$speech.outerHeight()+arrowheight, arroww:$speech.data('$arrowparts').eq(0).outerWidth()}) //cache tooltip dimensions
		$speech.css({display:'none', visibility:'visible'})
		setting.$speech=$speech //remember ref to tooltip
	}
	return setting.$speech
	},
	

	positiontip:function($, $anchor, s, e){
		var $speech=s.$speech
		var $offset=$anchor.offset()
		var windowmeasure={w:$(window).width(), h:$(window).height(), left:$(document).scrollLeft(), top:$(document).scrollTop()} //get various window measurements
		var anchormeasure={w:$anchor.outerWidth(), h:$anchor.outerHeight(), left:$offset.left, top:$offset.top} //get various anchor link measurements
		var speechmeasure={w:$speech.data('measure').w, h:$speech.data('measure').h} //get tooltip measurements
		var x=anchormeasure.left
		var y=anchormeasure.top+anchormeasure.h
		x=(x+speechmeasure.w>windowmeasure.left+windowmeasure.w-3)? x-speechmeasure.w+anchormeasure.w-5 : x //right align tooltip if no space to the right of the anchor
		y=(y+speechmeasure.h>windowmeasure.top+windowmeasure.h)? y-speechmeasure.h-anchormeasure.h-10 : y+10 //top align tooltip if no space to the bottom of the anchor
		var isrightaligned=x!=anchormeasure.left //Boolean to indicate if tooltip is right aligned
		var istopaligned=y!=anchormeasure.top+anchormeasure.h+10 //Boolean to indicate if tooltip is top aligned
		$speech.removeClass('downversion').addClass(istopaligned? 'downversion' : '') //add CSS "downversion" class to tooltip if arrow should be pointing down
		var arrowpos=(isrightaligned)? speechmeasure.w-(anchormeasure.left+anchormeasure.w-e.pageX)-25 : e.pageX-anchormeasure.left-25 //25 is to move arrow 25px to the left so it's not obscured by cursor
		if (arrowpos>speechmeasure.w-25) //if arrow exceeds the width of the tooltip
			arrowpos=speechmeasure.w-40 //move it to the left of the cursor
		else{
			arrowpos=(isrightaligned)? Math.max(anchormeasure.left-x+10, arrowpos) : Math.max(15, arrowpos) //make sure arrow doesn't appear too far to the left of the tooltip
		}
		$speech.data('$arrowparts').css('left', arrowpos)
		var speechcss_before={opacity:0, left:x, top:(istopaligned)? y-speechmeasure.h-10 : y+speechmeasure.h+10}
		var speechcss_after={opacity:1, top:y+10}
		if (document.all && !window.msPerformance){ //detect IE8 and below
			delete speechcss_before.opacity //remove opacity property, as IE8- does not animate this property well with CSS triangles present
			delete speechcss_after.opacity
		}
		$speech.css(speechcss_before).show().animate(speechcss_after)
	},


	init: function ($, $anchor, options) {
		var s = { speechtext: $anchor.attr('title'), speechid: $anchor.attr('rel') };
		$.extend(s, options);
		if (this.buildtooltip($, s)) {
			if (s.speechtext) //if title attribute of anchor is defined
				$anchor.attr('title', ""); //disable it
	
			var closeTooltip = function () {
				s.hidetimer = setTimeout(function () {
					s.$speech.stop(true, true).hide();
				}, 200);
			};
	
			$anchor.mouseenter(function (e) {
				if (s.$speech.queue().length == 0) {
					clearTimeout(s.hidetimer);
					speechbubbles_tooltip.positiontip($, $anchor, s, e);
				}
			}).mouseleave(function (e) {
				closeTooltip();
			});
	
			s.$speech.mouseenter(function () {
				// Clear the hide timer when the mouse enters the tooltip.
				clearTimeout(s.hidetimer);
			}).mouseleave(function () {
				closeTooltip();
			});
		}
	}
	
	

}


jQuery.fn.speechbubble=function(options){
	var $=jQuery
	function processanchor(selector){
		return selector.each(function(){ //return jQuery obj
			var $anchor=$(this)
				speechbubbles_tooltip.init($, $anchor, options)
		})
	}
	if (options && options.url)
		speechbubbles_tooltip.loadcontent($, this, options, processanchor)
	else
		processanchor(this)
};