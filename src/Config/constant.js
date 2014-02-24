/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 下午3:59
 * To change this template use File | Settings | File Templates.
 */

exports.MIME = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "TXT": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};


exports.HTTP_CODE = {
    SUCCESS: 200,
    ERROR_PARAM: 400,
    NO_PERMISSION: 403,
    NOT_FOUND: 404,
    ERROR_SERVER: 500
};

exports.MESSAGE = {
    EMPTY: "the result is empty",
    FAIL: "fail",
    FAIL_OPENID_REGISTER: "fail openId registr",
    FAIL_GET_SESSION: "fail get session",
    FAIL_GET_THIRD_USERINFO: "fail get third userInfo",
    SUCCESS_UPDATE_SESSION: "success update session",
    SUCCESS_UNBIND: "success unbind",
    SUCCESS_LOGIN: "success login",
    SUCCESS_LOGOUT: "success logout",
    SUCCESS_COMMENT: "success comment",
    SUCCESS: "success",
    ERROR_PARAM: "the params is error",
    NO_PERMISSION: "no access permission",
    NOT_FOUND: "not found handler",
    NO_LOGIN: "no_login",
    ERROR_SERVER: "the server is error"
};