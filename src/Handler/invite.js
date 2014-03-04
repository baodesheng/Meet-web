var Handler = require("./handler");
var MESSAGE = require("../Config/constant").MESSAGE;
var EJS = require("../Config/path").EJS;
var STATIC = require("../Config/path").STATIC;
var WebUtil = require("../Util/web");
var AvatarUtil = require("../Util/Avatar");
var Record = require("../Service/record");

exports.invite = function(request, response) {
    var loadData = {};

    if ('GET' == request.method) {
        Handler.preHandleGetReq(request, response, function (params) {
            if (params.code && params.code.length == 4) {

                loadData.code = params.code;

                Record.getArticleShareCode(params.code, function (msg, rs) {
                    if (MESSAGE.SUCCESS == msg && rs && (rs instanceof Array) && (rs.length > 0)) {
                        var shareCode = rs[0];
                        var queryParams = {'articleId': shareCode['article_id']};
                        Record.getArticleById(queryParams, function (msg, rs) {
                            if ((MESSAGE.SUCCESS == msg) && rs && (rs instanceof Array) && (rs.length > 0)) {
                                loadData.article = rs[0];
                                WebUtil.loadPage(EJS.INVITE, loadData, response);
                            } else {
                                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                            }
                        });
                    } else {
                        WebUtil.redirect(STATIC.NOT_FOUND, request, response);
                    }
                });
            } else {
                WebUtil.redirect(STATIC.NOT_FOUND, request, response);
            }
        });
    }
};