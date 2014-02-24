/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 下午1:55
 * To change this template use File | Settings | File Templates.
 */

var cache = require("memory-cache");
/**
 * 登录验证
 * 针对用户操作请求
 * @param request
 * @param next
 */
exports.checkLogin = function checkLogin(request, next) {
    var sid = this.getSessionId(request);
    if (sid) {
        // 1.先看内存中是否有对应SESSION
        console.log("checkLogin $$$ sid=>"+sid);
        var session = cache.get(sid);
        console.log("checkLogin - session:"+session);
        if (session) {
            console.log("session is valid, user "+session.userId+" is login");
            next(true);
        } else {
            // 2.若无则截断请求
            console.log("not login");
            next(false);
        }
    } else {
        console.log("sid is null ");
        next(false);
    }
};

//  ----- Session -----

/**
 * 获取SessionId
 * @param request
 * @return {String}
 */
exports.getSessionId = function getSessionId(request) {
    var sid = "";
    var cookie = request.headers.cookie || "";
    if (cookie) {
        console.log("getSessionId $$$ cookie is:"+cookie);
        var cookieArr = cookie.split(";");
        var cookieLen = cookieArr.length;
        for (var i=0;i<cookieLen;i++) {
            var oneCookie =  cookieArr[i].trim();
            var oneCookieArr = oneCookie.split("=");
            if (oneCookieArr.length == 2) {
                var oneKey = oneCookieArr[0] || "";
                var oneValue = oneCookieArr[1] || "";
                if ("sid" == oneKey && oneValue) {
                    sid = oneValue;
                    break;
                }
            }
        }
    }
    return sid;
};

/**
 * 获取Session
 * @param request
 * @return {String}
 */
exports.getSession = function getSession(request) {
    var session;
    var sid = this.getSessionId(request);
    if (sid) {
        console.log("getSession $$$ sid=>"+sid);
        session =  cache.get(sid);
    }
    return session;
};

/**
 * 放置Session
 * @param response
 * @param session
 * @param next
 */
exports.setSession = function setSession(response, session, next) {
    var outTime = 30 * 60;
    var sid = session.sessionHash || "";
    console.log("set Session :"+sid);
    if (sid) {
        cache.put(sid, session, outTime*1000);//cache单位是“微秒”
        response.setHeader("Set-Cookie", "sid="+sid+";max-age="+outTime);//max-age单位是“秒”
        next(true);
    } else {
        next(false);
    }
};

/**
 * 销毁Session
 * @param request
 * @param response
 * @param next
 */
exports.removeSession = function removeSession(request, response, next) {
    var sid = this.getSessionId(request);
    if (sid) {
        console.log("removeSession $$$ sid=>"+sid);
        cache.del(sid);
        response.setHeader("Set-Cookie", "sid="+sid+";max-age=1");//max-age单位是“秒”
        next();
    } else {
        next();
    }
};