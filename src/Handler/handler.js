/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-25
 * Time: 下午4:40
 * To change this template use File | Settings | File Templates.
 */

var url = require("url");
var queryString = require("querystring");
var MIME = require("../Config/constant").MIME;
var STATIC = require("../Config/path").STATIC;
var DYNAMIC = require("../Config/path").DYNAMIC;
var WebUtil = require("../Util/web");
var Session = require("./session");
var Record = require("./record");
var Article = require("./article");

// ----------- 登录 ------------

//  不需要登录的
exports.NoLoginHandler = {
    "/": index,                                     //  首页
    "/login": Session.login,                        //  登录
    "/show": Article.show,                           //  展示文章
    "/showObject": Record.showObject,               //  OBJECT方式展示文章
    "/article": Record.show
};

//  需要登录的
exports.LoginHandler = {
    "/logout": Session.logout                       //  登出
};

//  需要登录的
exports.AjaxLoginHandler = {

};

// ----------- 权限 ------------

/**
 * 权限角色
 * @type {Object}
 */
exports.Role = {
    ALL: 0,     //  所有人
    EDITOR: 1,  //  编辑
    ADMIN: 2    //  管理员
};

/**
 *  权限配置 针对所有登录后操作都要设置
 * @return {Object}
 * @constructor
 */
exports.PermissionHandler = {
    "/logout": this.Role.ALL
};

/*****************************************************************************/

/**
 * 预备处理 GET 请求
 * @param request
 * @param response
 * @param next
 */
function preHandleGetReq(request, response, next) {
    // 获取参数
    var queryParams = url.parse(request.url, true).query;
    if (queryParams) {
        next(queryParams);
    } else {
        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
    }
}

/**
 * 预备处理 POST 请求
 * @param request
 * @param response
 * @param next
 */
function preHandlePostReq(request, response, next) {
    var bodyStr = "";
    request.setEncoding("utf-8");// 设定编码
    request.on("data", function(data) {
        bodyStr += data;
    });
    request.on("end", function() {
        if (bodyStr) {
            var queryParams = queryString.parse(bodyStr);
            if (queryParams) {
                next(queryParams);
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        } else {
            WebUtil.redirect(STATIC.NOT_FOUND, request, response);
        }
    });
}

/**
 * 预备处理 PUT 请求
 * @param request
 * @param response
 * @param next
 */
function preHandlePutReq(request, response, next) {
    var bodyStr = "";
    request.setEncoding("utf-8");// 设定编码
    request.on("data", function(data) {
        bodyStr += data;
    });
    request.on("end", function() {
        if (bodyStr) {
            var queryParams = queryString.parse(bodyStr);
            if (queryParams) {
                next(queryParams);
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        } else {
            WebUtil.redirect(STATIC.NOT_FOUND, request, response);
        }
    });
}

/**
 * 预备处理 DELETE 请求
 * @param request
 * @param response
 * @param next
 */
function preHandleDelReq(request, response, next) {
    // 获取参数
    var queryParams = url.parse(request.url, true).query;
    if (queryParams) {
        next(queryParams);
    } else {
        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
    }
}

/**
 * 首页 (暂时跳转推荐帖子页面)
 * @param request
 * @param response
 */
function index(request, response) {
    console.log("- handler index request -");
    WebUtil.load(STATIC.INDEX, request, response);
//    WebUtil.redirect(STATIC.INDEX, request, response);
//    WebUtil.redirect(DYNAMIC.RECOMMEND_TOPIC, request, response);
//    WebUtil.loadPage("test/test", request, response);
}

function ajaxResponse(response, code, rs) {
    console.log("- response ajax result -"+rs);
    response.writeHead(code, {"Content-Type": MIME.TXT});
    response.write(rs);
    response.end();
}

exports.preHandleGetReq = preHandleGetReq;
exports.preHandlePostReq = preHandlePostReq;
exports.preHandlePutReq = preHandlePutReq;
exports.preHandleDelReq = preHandleDelReq;
exports.ajaxResponse = ajaxResponse;