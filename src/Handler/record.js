/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-14
 * Time: 下午4:54
 * To change this template use File | Settings | File Templates.
 */

var Handler = require("./handler");
var HTTP_CODE = require("../Config/constant").HTTP_CODE;
var MESSAGE = require("../Config/constant").MESSAGE;
var EJS = require("../Config/path").EJS;
var STATIC = require("../Config/path").STATIC;
var WebUtil = require("../Util/web");
var AvatarUtil = require("../Util/Avatar");
var Record = require("../Service/record");
var User = require("../V3/user");
var Result = require('../Util/Result');

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

                                                            WebUtil.loadPage(EJS.SHOW, loadData, response);
                                                        }
                                                    }
                                                    User.getUserByUserName({userName:author}, userNext);
                                                } else {
                                                    userObj.avatar = AvatarUtil.getAvatarUrl("");
                                                    loadData.user = userObj;
                                                    userObj.signature = "";
                                                    WebUtil.loadPage(EJS.SHOW, loadData, response);
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
                                WebUtil.loadPage(EJS.SHOW, loadData, response);
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

/**
 * 以Object组件形式嵌入到LIBA帖子里
 * @param request
 * @param response
 */
function showObject(request, response) {
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
                                                WebUtil.loadPage(EJS.SHOW_OBJECT, loadData, response);
                                            }
                                        } else {

                                        }
                                    }
                                    Record.getItemByCreamId({creamId:creamId}, itemNext)
                                }
                            } else {

                            }
                        }
                        Record.getSectionByCreamId({creamId:creamId}, sectionNext);
//                            Handler.success(response, HTTP_CODE.SUCCESS, Result.make(RS_CODE.SUCCESS, MESSAGE.SUCCESS, rs));
                    } else {
                        Handler.success(response, HTTP_CODE.SUCCESS, Result.make(RS_CODE.SUCCESS, MESSAGE.EMPTY));
                    }
                } else {
                    Handler.fail(response, HTTP_CODE.ERROR_SERVER, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_SERVER));
                }
            };
            if (queryParams.topicId && !isNaN(queryParams.topicId)) {
                Record.getCreamByTopicId(queryParams, next);
            } else {
//                    Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
            }
        }
        Handler.preHandleGetReq(request, response, main);
    }
}

/**
 * 打印活动
 * @param request
 * @param response
 */
function print(request, response) {
    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
    }
    // POST
    else if ("POST" == reqMethod) {
        var main = function(queryParams) {
            var next = function(msg, rs){
                if (MESSAGE.SUCCESS == msg) {
                    WebUtil.redirect(STATIC.PRINT_SUCCESS, request, response);
                } else {
                    Handler.fail(response, HTTP_CODE.ERROR_SERVER, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_SERVER));
                }
            };

            //
            if (queryParams.userName && queryParams.recordName && queryParams.realName && queryParams.address && queryParams.tel) {
                Record.addPrintInfo(queryParams, next);
            } else {
                Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
            }
        };
        Handler.preHandlePostReq(request, response, main);
    }
}

/**
 * 罗列用户的纪录片列表
 * @param request
 * @param response
 */
function list(request, response) {
    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        var main = function(queryParams) {
            var next = function(msg, rs){
                if (MESSAGE.SUCCESS == msg) {
                    if (rs && rs instanceof Array && rs.length > 0) {
                        var loadData = {};
                        loadData.rs = rs;
                        loadData.page = 123;
                        loadData.userName = queryParams.userName;
                        WebUtil.loadPage(EJS.STORY_BOOK_LIST, loadData, response);
                    } else {
                        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                    }
                } else {
                    WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                }
            };

            //
            if (queryParams.authorId && !isNaN(queryParams.authorId)) {
                Record.getArticlesByAuthorId(queryParams, next);
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        };
        Handler.preHandleGetReq(request, response, main);

    }
    // POST
    else if ("POST" == reqMethod) {
        Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
    }
}

/**
 * 打印活动2
 * @param request
 * @param response
 */
function print2(request, response) {
    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
    }
    // POST
    else if ("POST" == reqMethod) {
        var main = function(queryParams) {
            var next = function(msg, rs){
                if (MESSAGE.SUCCESS == msg) {
                    WebUtil.redirect(STATIC.PRINT2_SUCCESS, request, response);
                } else {
                    Handler.fail(response, HTTP_CODE.ERROR_SERVER, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_SERVER));
                }
            };

            //
            if (queryParams.userName && queryParams.recordName && queryParams.realName && queryParams.address && queryParams.tel) {
                Record.addPrintInfo(queryParams, next);
            } else {
                Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
            }
        };
        Handler.preHandlePostReq(request, response, main);
    }
}

/**
 * 打印活动2
 * @param request
 * @param response
 */
function toInfo(request, response) {
    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
    }
    // POST
    else if ("POST" == reqMethod) {
        var main = function(queryParams) {
            if (queryParams.userName && queryParams.recordName) {
                WebUtil.loadPage(EJS.STORY_BOOK_INFO, queryParams, response);
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        };
        Handler.preHandlePostReq(request, response, main);
    }
}

/**
 * 打印活动
 * @param request
 * @param response
 */
function info(request, response) {
    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
    }
    // POST
    else if ("POST" == reqMethod) {
        var main = function(queryParams) {
            var next = function(msg, rs){
                if (MESSAGE.SUCCESS == msg) {
                    WebUtil.redirect(STATIC.PRINT2_SUCCESS, request, response);
                } else {
                    Handler.fail(response, HTTP_CODE.ERROR_SERVER, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_SERVER));
                }
            };

            //
            if (queryParams.userName && queryParams.recordName && queryParams.realName
                && queryParams.address && queryParams.tel) {
                if (!queryParams.nameType || isNaN(queryParams.nameType) ) {
                    queryParams.nameType = 0;
                }
                Record.addPrint2Info(queryParams, next);
            } else {
                Handler.fail(response, HTTP_CODE.ERROR_PARAM, Result.make(RS_CODE.FAIL, MESSAGE.ERROR_PARAM));
            }
        };
        Handler.preHandlePostReq(request, response, main);
    }
}

exports.show = show;
exports.showObject = showObject;
exports.print = print;
exports.list = list;
exports.print2 = print2;
exports.toInfo = toInfo;
exports.info = info;