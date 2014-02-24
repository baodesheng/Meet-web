/*!
 * cxScroll 1.0.1
 * http://code.ciaoca.com/
 * https://github.com/ciaoca/cxScroll
 * E-mail: ciaoca@gmail.com
 * Released under the MIT license
 * Date: 2013-08-27
 */
(function($){
	$.fn.cxScroll=function(settings){
		if(!this.length){return;};
		settings=$.extend({},$.cxScroll.defaults,settings);

		var obj=this;
		var scroller={};
		scroller.fn={};

		scroller.box=obj.find(".box");
		scroller.list=scroller.box.find(".list");
		scroller.items=scroller.list.find("li");
		scroller.itemSum=scroller.items.length;

		if(scroller.itemSum<=1){return;};

		scroller.plusBtn=obj.find(".plus");
		scroller.minusBtn=obj.find(".minus");
		scroller.itemWidth=scroller.items.outerWidth();
		scroller.itemHeight=scroller.items.outerHeight();

		if(settings.direction=="left"||settings.direction=="right"){
			if(scroller.itemWidth*scroller.itemSum<=scroller.box.outerWidth()){return;};
			scroller.plusVal="left";
			scroller.minusVal="right";
			scroller.moveVal=scroller.itemWidth;
		}else{
			if(scroller.itemHeight*scroller.itemSum<=scroller.box.outerHeight()){return;};
			scroller.plusVal="top";
			scroller.minusVal="bottom";
			scroller.moveVal=scroller.itemHeight;
		};

		// 鍏冪礌锛氬乏鍙虫搷浣滄寜閽�
		if(settings.plus&&!scroller.plusBtn.length){
			scroller.plusBtn=$("<a></a>",{"class":"plus"}).appendTo(obj);
		};
		if(settings.minus&&!scroller.minusBtn.length){
			scroller.minusBtn=$("<a></a>",{"class":"minus"}).appendTo(obj);
		};

		// 鍏冪礌锛氬悗琛�
		scroller.list.append(scroller.list.html());

		// 鏂规硶锛氬紑濮�
		scroller.fn.on=function(){
			if(!settings.auto){return;};
			scroller.fn.off();

			scroller.run=setTimeout(function(){
				scroller.fn.goto(settings.direction);
			},settings.time);
		};

		// 鏂规硶锛氬仠姝�
		scroller.fn.off=function(){
			if(typeof(scroller.run)!=="undefined"){clearTimeout(scroller.run);};
		};

		// 鏂规硶锛氬鍔犳帶鍒�
		scroller.fn.addControl=function(){
			if(settings.plus&&scroller.minusBtn.length){
				scroller.plusBtn.bind("click",function(){
					scroller.fn.goto(scroller.plusVal);
				});
			};
			if(settings.minus&&scroller.minusBtn.length){
				scroller.minusBtn.bind("click",function(){
					scroller.fn.goto(scroller.minusVal);
				});
			};
		};

		// 鏂规硶锛氳В闄ゆ帶鍒�
		scroller.fn.removeControl=function(){
			if(scroller.plusBtn.length){scroller.plusBtn.unbind("click");};
			if(scroller.minusBtn.length){scroller.minusBtn.unbind("click");};
		};

		// 鏂规硶锛氭粴鍔�
		scroller.fn.goto=function(d){
			scroller.fn.off();
			scroller.fn.removeControl();
			scroller.box.stop(true);

			var _max;	// _max	婊氬姩鐨勬渶澶ч檺搴�
			var _dis;	// _dis	婊氬姩鐨勮窛绂�

			switch(d){
			case "left":
			case "top":
				_max=0;
				if(d=="left"){
					if(parseInt(scroller.box.scrollLeft(),10)==0){
						scroller.box.scrollLeft(scroller.itemSum*scroller.moveVal);
					};
					_dis=scroller.box.scrollLeft()-(scroller.moveVal*settings.step);
					if(_dis<_max){_dis=_max};
					scroller.box.animate({"scrollLeft":_dis},settings.speed,function(){
						if(parseInt(scroller.box.scrollLeft(),10)<=_max){
							scroller.box.scrollLeft(0);
						};
						scroller.fn.addControl();
					});
				}else{
					if(parseInt(scroller.box.scrollTop(),10)==0){
						scroller.box.scrollTop(scroller.itemSum*scroller.moveVal);
					};
					_dis=scroller.box.scrollTop()-(scroller.moveVal*settings.step);
					if(_dis<_max){_dis=_max};
					scroller.box.animate({"scrollTop":_dis},settings.speed,function(){
						if(parseInt(scroller.box.scrollTop(),10)<=_max){
							scroller.box.scrollTop(0);
						};
						scroller.fn.addControl();
					});
				};
				break;
			case "right":
			case "bottom":
				_max=scroller.itemSum*scroller.moveVal;
				if(d=="right"){
					_dis=scroller.box.scrollLeft()+(scroller.moveVal*settings.step);
					if(_dis>_max){_dis=_max};
					scroller.box.animate({"scrollLeft":_dis},settings.speed,function(){
						if(parseInt(scroller.box.scrollLeft(),10)>=_max){
							scroller.box.scrollLeft(0);
						};
					});
				}else{
					_dis=scroller.box.scrollTop()+(scroller.moveVal*settings.step);
					if(_dis>_max){_dis=_max};
					scroller.box.animate({"scrollTop":_dis},settings.speed,function(){
						if(parseInt(scroller.box.scrollTop(),10)>=_max){
							scroller.box.scrollTop(0);
						};
					});
				};
				break;
			};
			scroller.box.queue(function(){
				scroller.fn.addControl();
				scroller.fn.on();
				$(this).dequeue();
			});
		};

		// 浜嬩欢锛氶紶鏍囩Щ鍏ュ仠姝�紝绉诲嚭寮€濮�
		if(settings.auto){
			obj.hover(function(){
				settings.auto=false;
				scroller.fn.off();
			},function(){
				settings.auto=true;
				scroller.fn.on();
			});
		};

		scroller.fn.addControl();
		scroller.fn.on();
	};

	// 榛樿鍊�
	$.cxScroll={defaults:{
		direction:"right",	// 婊氬姩鏂瑰悜
		step:1,				// 婊氬姩姝ラ暱
		speed:800,			// 婊氬姩閫熷害
		time:4000,			// 鑷姩婊氬姩闂撮殧鏃堕棿
		auto:true,			// 鏄惁鑷姩婊氬姩
		plus:true,			// 鏄惁浣跨敤 plus 鎸夐挳
		minus:true			// 鏄惁浣跨敤 minus 鎸夐挳
	}};
})(jQuery);