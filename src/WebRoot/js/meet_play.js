// JavaScript Document


jQuery(function($){
		
	liba = {
		now: 0,
		list: $('.content li'),
		size: $('.content li').size(),
		img: $('.content .img img'),
		mask: $('.mask'),
		tool: $('#toolBox'),
		media: document.getElementById('media'),
		ww: $(window).width(),
		wh: $(window).height()
	};
	
	// 预处理
	$('.main').css({'margin-top': (liba.wh - $('.main').height()) * 0.5 + 'px'});
	$(window).resize(function(){
		$('.main').css({'margin-top': ($(window).height() - $('.main').height()) * 0.5 + 'px'});
	});
	
	// 进度条
	liba.progress = function(n, t){
		liba.tool.find('.bar_now').animate({width : n + '%'}, t,'linear');
	}
	
	// 播放主进程
	liba.play = function(n){
		if(n == 0){
			$('body').removeClass('load');
			$('.mask').click();
			liba.media.play();
		};
		var o = liba.list.eq(n);
		liba.list.fadeOut(1000).eq(n).fadeIn(2000, function(){
			var o = $(this).find('.box_text');
			var h = o.height();
			var l = (h + $(window).height() * 0.5) / 36;
			liba.mask.fadeIn(1000, function(){
				liba.progress((n + 1) / liba.size * 100, 1000 * l + 5000);
				o.animate({top: -h + 'px'}, 1000 * l, 'linear', function(){
					liba.now++;
					liba.mask.fadeOut(1000, function(){
						if(liba.now < liba.size){
							liba.play(liba.now);
						};
					});
				});
			});
		});
	};
	
	// 顶部控制栏
	liba.show_tool = (function(){
		$('.mask').click(function(){
			if(liba.tool.is('.show')){
				return false;
			}else{
				liba.tool.addClass('show').show( function(){
					setTimeout(function(){
						liba.tool.hide( function(){
							$(this).removeClass('show');
						});
					}, 5000);
				});
			};
		});
		liba.tool.find('.btn').click(function(){
			if($(this).is('.btn_stop')){
				$(this).removeClass('btn_stop').addClass('btn_play');
				liba.media.pause();
				liba.list.pause();
				liba.list.find('.box_text').pause();
				liba.tool.find('.bar_now').pause();
				return false;
			};
			if($(this).is('.btn_play')){
				$(this).removeClass('btn_play').addClass('btn_stop');
				liba.media.play();
				liba.list.resume();
				liba.list.find('.box_text').resume();
				liba.tool.find('.bar_now').resume();
				return false;
			};
			if($(this).is('.btn_voice')){
				$(this).removeClass('btn_voice').addClass('btn_mute');
				liba.media.pause();
				//liba.media.muted = true;
				return false;
			};
			if($(this).is('.btn_mute')){
				$(this).removeClass('btn_mute').addClass('btn_voice');
				liba.media.play();
				//liba.media.muted = false;
				return false;
			};
		});
	})();
	
	// 加载
	liba.imgNow = 0;
	liba.img.load(function(){
		if(liba.imgNow == 0){
			if(!!navigator.userAgent.match(/(i[^;]+\;(U;)? CPU.+Mac OS X)/) || navigator.userAgent.match(/Android/i)){
				$('body').removeClass('load');
				$('.ios_start').show().click(function(){
					liba.play(liba.now);
					$(this).hide();
				});
			}else{
				setTimeout(function(){liba.play(liba.now);}, 800);
			};
		};
		if(liba.imgNow < liba.size){
			liba.imgLoad(++liba.imgNow);
		};
	});
	liba.imgLoad = (function(n){
		$('.content .img:eq(' + n + ') img').attr('src', $('.content .img:eq(' + n + ') img').attr('queue_src'));
	});
	liba.imgLoad(liba.imgNow);

});
