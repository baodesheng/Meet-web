/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-22
 * Time: 下午2:55
 * To change this template use File | Settings | File Templates.
 */

var querystring = require('querystring');
var Api = require("./api");

var USER_API_PATH = "/v3/user";

/**********************
 * GET HTTP METHODS *
 **********************/

function getUserByUserName(param, next) {
    var path = USER_API_PATH + "?name=" + param.userName;
    Api.handleGetReq(path, next);
}

exports.getUserByUserName = getUserByUserName;