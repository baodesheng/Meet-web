/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 下午2:09
 * To change this template use File | Settings | File Templates.
 */

var LoginSecurity = require("./login");

/**
 * 检查角色权限
 * @param request
 * @param requireRole
 * @param next
 */
exports.checkPermission = function(request, requireRole, next) {
    var userInfo =  LoginSecurity.getSession(request);
    if (userInfo) {
        //  检查 (角色值越高，权限越大)
        if (userInfo.role >= requireRole) {
            next(true);
        } else {
            next(false);
        }
    } else {
        next(false);
    }
};