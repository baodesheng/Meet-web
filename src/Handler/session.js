/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-14
 * Time: 下午4:12
 * To change this template use File | Settings | File Templates.
 */

var https = require("https");
var querystring = require('querystring');
var Handler = require("./handler");
var MESSAGE = require("../Config/constant").MESSAGE;
var DYNAMIC = require("../Config/path").DYNAMIC;
var STATIC = require("../Config/path").STATIC;
var EJS = require("../Config/path").EJS;
var WebUtil = require("../Util/web");
var LoginSecurity = require("../Security/login");
var V1Api = require("../Api/v1Api");

/**
 * 用户登录
 * @param request
 * @param response
 */
function login(request, response) {
    console.log("- handler login request -");

    var reqMethod = request.method;

    var data = {msg:""};

    var next = function(code, data) {
        if (code == 200) {
            console.log("登录成功 userId:"+data.user.id);
            var paramStr = "?authorId=" + data.user.id + "&userName=" + data.user.name;
            WebUtil.redirect(DYNAMIC.STORY_BOOK_LIST + paramStr, request, response);
//            WebUtil.loadPage(EJS.LOGIN, data, response);

        } else {
            data = {msg:"用户名或密码不正确"};
            console.log("用户名或密码不正确");
            WebUtil.redirect(STATIC.STORY_BOOK_LIBA_LOGIN, request, response);
//            WebUtil.loadPage(EJS.LOGIN, data, response);
        }
    };

    // POST
    if ("POST" == reqMethod) {
        var main = function(queryParams) {
            // 响应
            if (queryParams.username && queryParams.password && queryParams.provider) {
                V1Api.login(queryParams, next);
            } else {
                console.log("请输入用户名和密码");
//                data.msg = "请输入用户名和密码";
//                WebUtil.loadPage(EJS.LOGIN, data, response);
                WebUtil.redirect(STATIC.STORY_BOOK_LIBA_LOGIN);
            }
        }
        Handler.preHandlePostReq(request, response, main);
    }

    /*
    if (isPostReqMethod(request)) {
        var bodyStr = "";
        request.setEncoding("utf-8");// 设定编码
        request.on("data", function(data) {
            bodyStr += data;
        });
        request.on("end", function() {
            if (bodyStr) {
                var queryParams = queryString.parse(bodyStr);
                if (queryParams) {

                } else {
                    data.msg = "请输入用户名和密码";
                    WebUtil.loadPage(EJS.LOGIN, data, response);
                }
            } else {
                data.msg = "请输入用户名和密码";
                WebUtil.loadPage(EJS.LOGIN, data, response);
            }
        });
    } else {
        var toLogin = function () {
            WebUtil.loadPage(EJS.LOGIN, data, response);
        };
        LoginSecurity.removeSession(request, response, toLogin);
    }
    */
}

/**
 * 退出登录
 * @param request
 * @param response
 */
function logout(request, response) {
    console.log("- handler logout request -");
    var next = function () {
        WebUtil.redirect(DYNAMIC.LOGIN, request, response);
    };
    LoginSecurity.removeSession(request, response, next);
}

/**
 * 豆瓣返回
 * @param request
 * @param response
 */
function doubanBack(request, response) {
    console.log("- handler douban back request -"+request.url);
    //
//    var next = function () {
//        WebUtil.redirect(DYNAMIC.LOGIN, request, response);
//    };
//    LoginSecurity.removeSession(request, response, next);

    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        var main = function(queryParams) {
            if (queryParams.code) {
//                var redirectUrl = "https://www.douban.com/service/auth2/token?client_id=09f226651ebf98cb1dd6732f5c3eca61&client_secret=a6bfe6e48d2c8300&redirect_uri=http://127.0.0.1:8887/doubanBack&grant_type=authorization_code&%20code="+queryParams.code;
//                console.log("redirect to:"+redirectUrl);
//                response.writeHead(302, {'Location': redirectUrl});
//                response.end();

                var opts = {
                    client_id : '09f226651ebf98cb1dd6732f5c3eca61',
                    client_secret : 'a6bfe6e48d2c8300',
                    redirect_uri : 'http://meet.liba.com/doubanBack',
                    grant_type : 'authorization_code',
                    code: queryParams.code
                };
                var opts_str = querystring.stringify(opts);
                var options = {
                    host: "www.douban.com",
                    port: 443,
                    path: '/service/auth2/token?'+opts_str,
                    method: "POST",
                    headers :{
                        'Content-Type' : 'application/x-www-form-urlencoded',
                        'Content-Length': 0
                    }
                };

                var req = https.request(options, function(res) {
                    res.setEncoding('utf8');
                    console.log("Got-json response: " + res.statusCode);
                    var data = '';

                    res.on('data', function (chunk){
                        data += chunk;
                    });

                    res.on('end',function(){
                        console.log(data);
                        var obj = JSON.parse(data);
                        var userId = obj.douban_user_id;
                        var username = obj.douban_user_name;
                        if (userId && username) {
                           console.log("douban_user_id:"+userId+" username:"+username);
                            var paramObj = {};
                            paramObj.username = username;
                            paramObj.openId = userId;
                            paramObj.provider = "douban";

                            var next = function(code, data) {
                                if (code == 200) {
                                    console.log("登录成功 userId:"+data.user.id);
                                    var paramStr = "?authorId=" + data.user.id + "&userName=" + data.user.name;
                                    WebUtil.redirect(DYNAMIC.STORY_BOOK_LIST + paramStr, request, response);
//            WebUtil.loadPage(EJS.LOGIN, data, response);

                                } else {
                                    data = {msg:"用户名或密码不正确"};
                                    console.log("用户名或密码不正确");
                                    WebUtil.redirect(STATIC.STORY_BOOK_LIBA_LOGIN, request, response);
//            WebUtil.loadPage(EJS.LOGIN, data, response);
                                }
                            };

                            V1Api.login(paramObj, next);
                            //next(200, {"userId": userId, "avatar": avatar_path, "sessionHash": sessionHash});
                        } else {
                            //next(401, message);
                        }

                    });

                }).on('error', function(e) {
                    //next(500 , "Server is busy.");
                    console.log("Got-json error: " + e.message);
                });
//                req.write(opts_str);
                req.end();
            }
        }
        Handler.preHandleGetReq(request, response, main);
    }
    // POST
    else if ("POST" == reqMethod) {

    }
}

/**
 * 新浪返回
 * @param request
 * @param response
 */
function sinaBack(request, response) {
    console.log("- handler weibo back request -"+request.url);
    //
//    var next = function () {
//        WebUtil.redirect(DYNAMIC.LOGIN, request, response);
//    };
//    LoginSecurity.removeSession(request, response, next);

    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        var main = function(queryParams) {
            if (queryParams.code) {

                var getUserInfo = function(access_token, uid){
                    var userInfoUrl = "https://api.weibo.com/2/users/show.json?access_token=" + access_token + "&uid=" + uid;
                    https.get(userInfoUrl, function(res) {
                        res.setEncoding('UTF-8');
                        res.on('data', function (data) {
                            console.log("Got response: " + data);
                            var obj = JSON.parse(data);
                            var userId = obj.id;
                            var username = obj.screen_name;
                            if (uid && username) {
                                console.log("sina_user_id:"+userId+" username:"+username);
                                var paramObj = {};
                                paramObj.username = username;
                                paramObj.openId = userId;
                                paramObj.provider = "weibo";

                                var next = function(code, data) {
                                    if (code == 200) {
                                        console.log("登录成功 userId:"+data.user.id);
                                        var paramStr = "?authorId=" + data.user.id + "&userName=" + data.user.name;
                                        WebUtil.redirect(DYNAMIC.STORY_BOOK_LIST + paramStr, request, response);

                                    } else {
                                        data = {msg:"用户名或密码不正确"};
                                        console.log("用户名或密码不正确");
                                        WebUtil.redirect(STATIC.STORY_BOOK_LIBA_LOGIN, request, response);
                                    }
                                };

                                V1Api.login(paramObj, next);
                            } else {

                            }
                        });
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });


                };

                var getAccessToken = function() {
                    var opts = {
                        client_id : '3883601904',
                        client_secret : '368fb5c2bbcf90242cedb1f02e17d5b6',
                        redirect_uri : 'http://meet.liba.com/sinaBack',
                        grant_type : 'authorization_code',
                        code: queryParams.code
                    };
                    var opts_str = querystring.stringify(opts);
                    var options = {
                        host: "api.weibo.com",
                        port: 443,
                        path: '/oauth2/access_token?'+opts_str,
                        method: "POST",
                        headers :{
                            'Content-Type' : 'application/x-www-form-urlencoded',
                            'Content-Length': 0
                        }
                    };

                    var req = https.request(options, function(res) {
                        res.setEncoding('utf8');
                        console.log("Got-json response: " + res.statusCode);
                        var data = '';

                        res.on('data', function (chunk){
                            data += chunk;
                        });

                        res.on('end',function(){
                            console.log(data);
                            var obj = JSON.parse(data);
                            var userId = obj.uid;
                            var accessToken = obj.access_token;

                            getUserInfo(accessToken, userId);

                        });

                    }).on('error', function(e) {
                        //next(500 , "Server is busy.");
                        console.log("Got-json error: " + e.message);
                    });
//                req.write(opts_str);
                    req.end();
                };

                getAccessToken();
            }
        }
        Handler.preHandleGetReq(request, response, main);
    }
    // POST
    else if ("POST" == reqMethod) {

    }
}

/**
 * QQ返回
 * @param request
 * @param response
 */
function qqBack(request, response) {
    console.log("- handler qq back request -"+request.url);

    var reqMethod = request.method;
    // GET
    if ("GET" == reqMethod) {
        var main = function(queryParams) {
            if (queryParams.code) {

                var getUserInfo = function(access_token, openid){
                    var userInfoUrl = "https://graph.qq.com/user/get_user_info?access_token=" + access_token + "&openid=" + openid + "&oauth_consumer_key=101100001";
                    console.log("userInfoUrl:"+userInfoUrl);
                    https.get(userInfoUrl, function(res) {
                        res.setEncoding('UTF-8');
                        res.on('data', function (data) {
                            console.log("Got response: " + data);
                            var obj = JSON.parse(data);
                            var userId = openid;
                            var username = obj.nickname;
                            var avatarUrl = obj.figureurl_2;
                            if (userId && username) {
                                console.log("qq_user_id:"+userId+" username:"+username);
                                var paramObj = {};
                                paramObj.username = username;
                                paramObj.openId = userId;
                                paramObj.provider = "qq";
                                paramObj.avatarUrl = avatarUrl;

                                var next = function(code, data) {
                                    if (code == 200) {
                                        console.log("登录成功 userId:"+data.user.id);
                                        var paramStr = "?authorId=" + data.user.id + "&userName=" + data.user.name;
                                        WebUtil.redirect(DYNAMIC.STORY_BOOK_LIST + paramStr, request, response);

                                    } else {
                                        data = {msg:"用户名或密码不正确"};
                                        console.log("用户名或密码不正确");
                                        WebUtil.redirect(STATIC.STORY_BOOK_LIBA_LOGIN+"?error", request, response);
                                    }
                                };

                                V1Api.login(paramObj, next);
                            } else {

                            }
                        });
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });
                };

                var getOpenid = function(accessToken) {
                    var openidUrl = "https://graph.qq.com/oauth2.0/me?access_token=" + accessToken;
                    console.log("openidUrl:"+openidUrl);
                    https.get(openidUrl, function(res) {
                        res.setEncoding('UTF-8');
                        res.on('data', function (data) {
                            console.log("Got response: " + data);
                            var openArr = data.split('"');
                            var openid = openArr[7];
                            getUserInfo(accessToken, openid);
                        });
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });
                };

                var getAccessToken = function() {
                    var tokenUrl = "https://graph.qq.com/oauth2.0/token?client_id=101100001&client_secret=3fda25bc13012a080249d8dbb61243ef&redirect_uri=http://meet.liba.com/qqBack&grant_type=authorization_code&code=" + queryParams.code;
                    console.log("tokenUrl:"+tokenUrl);
                    https.get(tokenUrl, function(res) {
                        res.setEncoding('UTF-8');
                        res.on('data', function (data) {
                            console.log("Got response: " + data);
                            var dataArr = data.split("&");
                            var tokenArr = dataArr[0].split("=");
                            var accessToken = tokenArr[1];
                            getOpenid(accessToken);
                        });
                    }).on('error', function(e) {
                        console.log("Got error: " + e.message);
                    });
                };

                getAccessToken();
            }
        }
        Handler.preHandleGetReq(request, response, main);
    }
    // POST
    else if ("POST" == reqMethod) {

    }
}

exports.login = login;
exports.logout = logout;
exports.doubanBack = doubanBack;
exports.sinaBack = sinaBack;
exports.qqBack = qqBack;