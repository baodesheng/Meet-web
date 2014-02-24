/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */

var http = require("http");
var url = require("url");

function start(route) {
    function onRequest(request, response) {
        // 解析request url
        var pathName = url.parse(request.url).pathname;
        console.log("Server On Request for ===>>> " + pathName + " received.");

        route(pathName, request, response);
    }

    var hostStr = "127.0.0.1";
    http.createServer(onRequest).listen(8887, hostStr);//
    console.log("Meet Web Server on " + hostStr + ":8887 has started.");
}

exports.start = start;