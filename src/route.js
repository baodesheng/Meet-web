/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 上午11:14
 * To change this template use File | Settings | File Templates.
 */

var Path = require("path");
var WebUtil = require("./Util/web");
var NoLoginHandler = require("./Handler/handler").NoLoginHandler;
var LoginHandler = require("./Handler/handler").LoginHandler;
var AjaxLoginHandler = require("./Handler/handler").AjaxLoginHandler;
var AjaxResponse = require("./Handler/handler").ajaxResponse;
var PermissionHandler = require("./Handler/handler").PermissionHandler;
var STATIC = require("./Config/path").STATIC;
var DYNAMIC = require("./Config/path").DYNAMIC;
var MESSAGE = require("./Config/constant").MESSAGE;
var LoginSecurity = require("./Security/login");
var PermissionSecurity = require("./Security/permission");

function route(pathname, request, response) {
    var extName = Path.extname(pathname);
    console.log("route extName is:"+extName);

    //  动态请求
    if ("" == extName) {
        // 不需要登录
        if (typeof  NoLoginHandler[pathname] === "function") {
            console.log("Route a request for no login handle " + pathname);
            NoLoginHandler[pathname](request, response);
        }
        // 需要登录
        else if (typeof  LoginHandler[pathname] === "function") {
            console.log("Route a request for require login handle " + pathname);
            var next = function(flag) {
                if (flag) { // 已登录
                    var go = function(flag) {
                        if (flag) {
                            LoginHandler[pathname](request, response);
                        } else { // 权限不通过处理
                            console.log("Refuse request handler found for " + pathname);
                            WebUtil.redirect(STATIC.NO_PERMISSION, request, response);
                        }
                    }
                    //  检查权限
                    PermissionSecurity.checkPermission(request, PermissionHandler[pathname], go);

                } else { // 未登录
                    WebUtil.redirect(DYNAMIC.LOGIN,request, response);
                }
            };
            //  检查登录
            LoginSecurity.checkLogin(request, next);
        }
        // 需要登录 Ajax
        else if (typeof  AjaxLoginHandler[pathname] === "function") {
            console.log("Route a request for require ajax login handle " + pathname);
            var next = function(flag) {
                if (flag) { // 已登录
                    AjaxLoginHandler[pathname](request, response);
                } else { // 未登录
//                    WebUtil.redirect(DYNAMIC.LOGIN,request, response);
                    AjaxResponse(response, 200, MESSAGE.NO_LOGIN);
                }
            };
            //  检查登录
            LoginSecurity.checkLogin(request, next);
        }
        //  无效
        else {
            console.log("No request handler found for " + pathname);
            WebUtil.redirect(STATIC.NOT_FOUNT, request,response);
        }
    }
    //  静态请求
    else {
        console.log("Route a request for static file :"+extName);
        WebUtil.load(pathname, request, response);
    }
}

exports.route = route;