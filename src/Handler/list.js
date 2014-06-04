// 特别故事书活动第2季的报名名单
var Handler = require("./handler");
var WebUtil = require("../Util/web");
var EJS = require("../Config/path").EJS;
var STATIC = require("../Config/path").STATIC;
var RECORD = require('../Service/record');
var MESSAGE = require("../Config/constant").MESSAGE;

exports.list = function(request, response) {
    if ('GET' == request.method) {
        var main = function() {
            var next = function(msg, rs) {
                if (MESSAGE.SUCCESS == msg) {
                    if (rs && rs instanceof Array && rs.length > 0) {
                        var loadData = {items:rs};
                        WebUtil.loadPage(EJS.PRINT_LIST, loadData, response);
                    } else {
                        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                    }
                } else {
                    WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                }
            };

            RECORD.getArtivityPrint(next);
        };

        Handler.preHandleGetReq(request, response, main);
    } else {
        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
    }
};