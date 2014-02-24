// ActionScript Document
// liba read js
// chentiantian 2013.1.31
$(function(){
	$(".input-login").focus(function(){
		var $this=$(this);
		$this.siblings("label").remove();
	});	
	$(".edit-bd li:first").find(".topic-floor").show();
	$(".editor-title").click(function(){
		$this=$(this);	
		$li=$this.parent("li").siblings();
		$this.siblings(".topic-floor").show();
		$li.find(".topic-floor").hide();
	});
	$(".input-cate").live("focus",function(){
		var $this=$(this);
		var $em=$this.siblings("em");
		$em.hide();
	});
	$(".category-name em").live("click",function(){
		var $input=$(this).siblings(".input-cate");
		$input.focus();
	});
	$(".btn-cate").live("click",function(){
		var $this=$(this);								 
		var $inputCate=$(this).siblings(".input-cate");
		var $val=$inputCate.val();
		if($val!=""){
            var $parent=$this.parent(".category-name").parent(".topic-floor");
            var itemId = $parent.attr("itemId");
            if (!isNaN(itemId)) {
                var url = "/addSection?itemId="+itemId+"&title="+$val;
                $.get(url, function(data) {
                    if (data == "success") {
                        $this.val("修改");
                        $inputCate.val($val);
                        //alert('d was performed.');
                    }
                });
            }


		}
	});
	//删除目录
	$(".J-dele-cate").live("click",function(){
		var $this=$(this);
		var $parent=$this.parent(".category-name");
		if(confirm("确定要删除该目录吗？")){
			$parent.slideUp('slow',function(){$parent.remove();});
		}
	});
	//增加目录
	$(".J-catalog").click(function(){
		var $this=$(this);
		var $parent=$this.parent(".topic-floor");
		var $html="<div class='category-name'><em>请输入目录标题</em><input type='text' value='' name='' class='input-cate'/><input type='button' value='确定' class='btn-cate'/><a href='javascript:;' class='J-dele-cate'>删除目录</a></div>";
		$parent.prepend($html);
	});
	//编辑文字
	$(".J-editor").click(function(){
        var $this=$(this);
        var $txt = $this.siblings(".floor-txt");
        var status = $this.attr("status");
        if ("editing" == status) {
            $this.attr("status", null);
            $this.text("编辑");

            var detail = $(".J-input-editor").val();
            var tempDetail = detail.replace(/\r?\n/g, "<br>");
            var itemId = $this.parent(".topic-floor").attr("itemId");
            if (!isNaN(itemId)) {
                //alert("delete floor -> "+itemId);
                var url = "/updateItem?itemId="+itemId+"&detail="+tempDetail;
                $.get(url, function(data) {
                    if (data == "success") {
                        $txt.find(".topic-text").attr("detail",detail);
                        $txt.find(".topic-text").html(tempDetail);
                        $(".float-layer").hide();
                    }
                });
            }
        } else {
            $this.attr("status", "editing");
            $this.text("保存");

            //var $text=$txt.find(".topic-text").text();
            var $detail=$txt.find(".topic-text").attr("detail");
            var $left=$txt.offset().left-12;
            var $top=$txt.offset().top;
            var $height=$txt.height();
            $(".J-input-editor").height($height);
            $(".float-layer").css("left",$left);
            $(".float-layer").css("top",$top);
            $(".J-input-editor").val($detail);
            $(".float-layer").show();
            $(".J-input-editor").focus();
            $(".J-input-editor").select();
        }

	});
	//编辑浮动层
    /*
	$(".float-layer").hover(
		function(){
			$('body').unbind('mousedown');
		},
		function(){
			$('body').bind('mousedown', function(){
                $(".float-layer").hide();

		    });
	    });
	*/
	$(".J-delete").click(function(){
		var $this=$(this);	
		var $parent=$this.parent(".topic-floor");
		if(confirm("^_^确定要删除该楼层吗？")){
            var itemId = $parent.attr("itemId");
            if (!isNaN(itemId)) {
                //alert("delete floor -> "+itemId);
                var url = "/deleteItem?itemId="+itemId;
                $.get(url, function(data) {
                    if (data == "success") {
                        $parent.slideUp('slow',function(){$parent.remove();});
                        //alert('d was performed.');
                    }
                });
            }
		}								  
	});
    // cover
    $(".coverR").click(function(){
        var $this=$(this);
        var imgVal = $this.attr("img");
        var topicId = $this.attr("topicId");
        if (!isNaN(topicId) && imgVal) {
            var url = "/setArticleCover?topicId="+topicId+"&image="+imgVal;
            $.get(url, function(data) {
                if (data == "success") {
                    $(".submit-audit").attr("img", imgVal);
                    alert('设置成功');
                }
            });
        }
    });
    ///submitAudit
    $(".submit-audit").click(function(){
        var $this=$(this);
        var img = $this.attr("img");
        if (img) {
            if(confirm("确定要提交审核吗？")){
                var topicId = $this.attr("topicId");
                if (!isNaN(topicId)) {
                    //alert("delete floor -> "+itemId);
                    var url = "/auditStatus?status=1&topicId="+topicId;
                    $.get(url, function(data) {
                        if (!isNaN(data) && parseInt(data) > 0) {
                            alert('提交审核成功');
                            location.href = "/list?status=1";
                        } else {
                            alert('提交审核失败');
                        }
                    });
                }
            }
        } else {
            alert("请先设置封面");
        }

    });
    // rejectAudit
    $("#rejectAudit").click(function(){
        var $this=$(this);
        if(confirm("确定要打回修改吗？")){
            var topicId = $this.attr("topicId");
            if (!isNaN(topicId)) {
                 var url = "/auditStatus?status=0&topicId="+topicId;
                location.href = url;
            }
        }
    });
    // passAudit
    $("#passAudit").click(function(){
        var $this=$(this);
        if(confirm("确定要通过审核吗？")){
            var topicId = $this.attr("topicId");
            if (!isNaN(topicId)) {
                var url = "/auditStatus?status=2&topicId="+topicId;
                location.href = url;
            }
        }
    });
    //publishArticle
    $("#publishArticle").click(function(){
        var $this=$(this);
        if(confirm("确定要发布文章吗？")){
            var topicId = $this.attr("topicId");
            if (!isNaN(topicId)) {
                //alert("delete floor -> "+itemId);
                var url = "/publishArticle?topicId="+topicId;
                $.get(url, function(data) {
                 if (!isNaN(data) && parseInt(data) > 0) {
                     alert('发布成功');
                     location.href = "/list";
                 } else {
                     alert('发布失败');
                 }
                });
            }
        }
    });
    // del article
    $(".delArticle").click(function(){
        var $this=$(this);
        if(confirm("确定要删除文章吗？")){
            var topicId = $this.attr("topicId");
            if (!isNaN(topicId)) {
                //alert("delete floor -> "+itemId);
                var url = "/deleteArticle?topicId="+topicId;
                $.get(url, function(data) {
                    if (data == "success") {
                        alert('删除成功');
                        location.href = "/list";
                    } else {
                        alert('删除失败');
                    }
                });
            }
        }
    });

    //  passApply
    $(".passApply").click(function(){
        var $this=$(this);
        if(confirm("确定要通过吗？")){
            var userId = $this.attr("userId");
            if (!isNaN(userId)) {
                var url = "/passApply?userId="+userId;
//                alert("pass apply -> "+url);
                location.href = url;
            }
        }
    });

    /*
    //  reject Apply
    $(".rejectApply").click(function(){
        var $this=$(this);
        if(confirm("确定要拒绝吗？")){
            var userId = $this.attr("userId");
            if (!isNaN(userId)) {
                //alert("delete floor -> "+itemId);
                var url = "/rejectApply?userId="+userId;
                $.get(url, function(data) {
                    if (data == "success") {
                        alert('拒绝成功');
                        location.href = "/userList";
                    } else {
                        alert('拒绝失败');
                    }
                });
            }
        }
    });
    */

    //
    $(".addRecommendTopic").click(function(){
        var $this=$(this);
        if(confirm("确定要增加这篇推荐帖子吗？")){
            var topicId = $this.attr("topicId");
            var forumType = $this.attr("forumType");
            if (!isNaN(topicId)) {
                //alert("delete floor -> "+itemId);
                var url = "/postArticle?topicId="+topicId+"&type="+forumType;
                $.get(url, function(data) {
                    if (data == "success") {
                        alert('增加成功');
                        location.href = "/list";
                    } else {
                        alert('增加失败');
                    }
                });
            }
        }
    });
})