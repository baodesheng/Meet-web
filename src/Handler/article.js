var Handler = require("./handler");
var MESSAGE = require("../Config/constant").MESSAGE;
var EJS = require("../Config/path").EJS;
var STATIC = require("../Config/path").STATIC;
var WebUtil = require("../Util/web");
var AvatarUtil = require("../Util/Avatar");
var Record = require("../Service/record");
var User = require("../V3/user");

/**
 * 展示文章
 * @param request
 * @param response
 */
function show(request, response) {
    var reqMethod = request.method;
    var loadData = {};
    // GET
    if ("GET" == reqMethod) {
        var main = function(queryParams) {
            var next = function(msg, rs){
                if (MESSAGE.SUCCESS == msg) {
                    if (rs && rs instanceof Array && rs.length > 0) {
                        var creamData = rs[0];
                        loadData.creamData = creamData;
                        var creamId = creamData.id;
                        var author = creamData.author;

                        var sectionNext = function(msg1, rs1) {
                            if (MESSAGE.SUCCESS == msg1) {
                                if (rs1 && rs1 instanceof Array && rs1.length > 0) {
                                    loadData.sectionData = rs1;
                                    var itemNext = function(msg2, rs2) {
                                        if (MESSAGE.SUCCESS == msg2) {
                                            if (rs2 && rs2 instanceof Array && rs2.length > 0) {
                                                loadData.itemData = rs2;

                                                var userObj = {};
                                                if (author && queryParams.topicId > -10000000) {
                                                    var userNext = function(code,r) {
                                                        if (200 == code) {
                                                            console.log("user => "+r);
                                                            var rObj = JSON.parse(r);
                                                            userObj.avatar = AvatarUtil.getAvatarUrl(rObj.id);
                                                            console.log("user avatar:"+ userObj.avatar);
                                                            userObj.signature = rObj.signature ? rs.signature : "";
                                                            loadData.user = userObj;

                                                            WebUtil.loadPage(EJS.ARTICLE, loadData, response);
                                                        }
                                                    }
                                                    User.getUserByUserName({userName:author}, userNext);
                                                } else {
                                                    userObj.avatar = AvatarUtil.getAvatarUrl("");
                                                    loadData.user = userObj;
                                                    userObj.signature = "";
                                                    WebUtil.loadPage(EJS.ARTICLE, loadData, response);
                                                }
                                            } else {
                                                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                                            }
                                        } else {
                                            WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                                        }
                                    }
                                    Record.getItemByCreamId({creamId:creamId}, itemNext)
                                } else {
                                    WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                                }
                            } else {
                                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                            }
                        }
                        Record.getSectionByCreamId({creamId:creamId}, sectionNext);
                    } else {
                        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                    }
                } else {
                    WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                }
            };

            var articleNext = function(msg, rs) {
                console.log("get article msg:"+msg);
                if (MESSAGE.SUCCESS == msg) {
                    loadData.isIOS = isIOS(request.headers['user-agent']);

                    if (rs && rs instanceof Array && rs.length > 0) {
                        console.log("article rs:"+rs.length);
                        var article = rs[0];
                        loadData.creamData = {
                            author: article.author,
                            title: article.title,
                            image: article.image,
                            publish_time: article.publish_time
                        };
                        loadData.user = {
                            avatar: article.avatar
                        };

                        //新版本用250, 旧版本用211
                        Record.getArticleContentById(article.id, 250, function(content) {
                            article.content = content.replace(/[\r\n]/g, "");
                            console.log("article content:"+article.content);

                            var contentArr = JSON.parse(article.content);
                            if (contentArr && contentArr instanceof Array && contentArr.length > 0) {

                                loadData.sectionData = [];
                                loadData.itemData = contentArr;

                                console.log("load article content ");
                                WebUtil.loadPage(EJS.ARTICLE, loadData, response);
                            } else {
                                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                            }
                        });
                    } else {
                        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                    }
                } else {
                    WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                }
            };

            if (queryParams.topicId && !isNaN(queryParams.topicId)) {
                if (queryParams.userId && !isNaN(queryParams.userId)) {
                    loadData.userId = queryParams.userId;
                } else {
                    loadData.userId = 0;
                }

                queryParams.articleId = Math.abs(queryParams.topicId);
                Record.getArticleById(queryParams, articleNext);
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        }
        Handler.preHandleGetReq(request, response, main);
    }
}

function isIOS(agent) {
    console.log(agent);

    var matches = agent.match(/(mac|iphone|ipad)/ig);
    return (matches && matches.length > 0);
}

exports.show = show;