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
            var articleNext = function(msg, rs) {
                console.log("get article msg:"+msg);
                if (MESSAGE.SUCCESS == msg) {
                    loadData.isIOS = isIOS(request.headers['user-agent']);

                    if (rs && rs instanceof Array && rs.length > 0) {
                        console.log("article rs:"+rs.length);
                        var article = rs[0];
                        loadData.creamData = {
                            topicId: article.id,
                            token: article.token,
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
            } else if (queryParams.token) {
                Record.getArticleByToken(queryParams, articleNext);
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