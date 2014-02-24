/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-14
 * Time: 下午4:12
 * To change this template use File | Settings | File Templates.
 */

var Handler = require("./handler");
var MESSAGE = require("../Config/constant").MESSAGE;
var DYNAMIC = require("../Config/path").DYNAMIC;
var EJS = require("../Config/path").EJS;
var WebUtil = require("../Util/web");
var LoginSecurity = require("../Security/login");
var MApi = require("../Api/mApi");

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
            var toRecommend = function(flag){
                if (flag)
                    WebUtil.redirect(DYNAMIC.RECOMMEND_TOPIC, request, response);
                else
                    WebUtil.loadPage(EJS.LOGIN, data, response);
            }
            // 暂时都设为 "所有人" 角色
            data.role = HandlerConfig.Role.ALL;
            LoginSecurity.setSession(response, data, toRecommend);
        } else {
            data = {msg:"用户名或密码不正确"};
            WebUtil.loadPage(EJS.LOGIN, data, response);
        }
    };

    // POST
    if ("POST" == reqMethod) {
        var main = function(queryParams) {
            // 响应
            if (queryParams.username && queryParams.password) {
                MApi.login(queryParams, next);
            } else {
                data.msg = "请输入用户名和密码";
                WebUtil.loadPage(EJS.LOGIN, data, response);
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

exports.login = login;
exports.logout = logout;