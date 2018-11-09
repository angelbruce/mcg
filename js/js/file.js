(function($){
	$.fn.upfile = function (options) {
		options = options || {}
		var opts = {
			accept:'image/gif, image/jpeg,image/png',
			val:'',
			uploadUrl:''
		}

		opts = $.extend(opts,options);
		$(this).each(function(index,element){
			var ele = $(element);
			ele.attr('jtype','upfile')
			var cont = $("<div class='upfile' />").appendTo(ele);
			var img = $("<img />").appendTo(cont);
			if(opts.val) {
				ele.attr('data-value',opts.val);
				img.attr("src",opts.val);
			} else {
				img.css('display','none');
			}

			var file = $("<input type='file' style='display:none;' />");
			var hand = file.get(0);
			file.attr('accept',opts.accept);
			file.appendTo(cont);
			var the = $(this);
			file.change(function(){
				var fd = new FormData();
				fd.append(ele.attr('id'),hand.files[0]);
				var theImg = img;
				$.ajax({
					url:opts.uploadUrl,
					type:'POST',
					data:fd,
					contentType:false,
					processData:false,
					success:function(m) {
						theImg.attr(src,m.thumb);
						the.attr('data-value',m.src);
						the.data('upfile-data',m)
					}
				})
			});
			ele.click(function(){
				hand.click();
			});
		});

		return $(this);
	}
	
	var val  = $.fn.val;
	$.fn.val = function() {
		if($(this).attr('jtype') === 'upfile') {
			if(arguments.length == 0) return $(this).attr('data-value');
			else {
				$(this).attr('data-value', arguments[0]);
				$(this).find("div img").attr('src',arguments[0]).show();
			}
		}

		return val.apply($(this),arguments);
	}
})(jQuery);
