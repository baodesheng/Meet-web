/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-22
 * Time: 下午2:54
 * To change this template use File | Settings | File Templates.
 */

var http = require("http");
var HTTP_CODE = require("../Config/constant").HTTP_CODE;

/*
var AuthConfig = {
    HOST     : 'a.liba.net',// API host
    USER     : 'test',// API帐号
    PASSWORD : '123456'
};
 */

 var AuthConfig = {
 HOST     : 'a.liba.com',// API host
 USER     : 'mobile',// API帐号
 PASSWORD : 'gOyRUmshIss27periLrinse'
 };

// API 配置
exports.agent = "iOS";
exports.ip = "10.1.94.142";
exports.redirectUri = "http://www.liba.com";

// 获取 Base Auth
function getBaseAuth() {
    var tok = AuthConfig.USER + ':' + AuthConfig.PASSWORD;
    var hash = new Buffer(tok).toString('base64');
    return "Basic " + hash;
};

// 获取 GET request options
function getGetReqOptions(path) {
    var options = {
        host: AuthConfig.HOST,
        port: 80,
        method: "GET",
        headers: {Authorization: getBaseAuth()},
        path: path
    };
    return options;
};

// 获取 POST request options
function getPostReqOptions(path, len) {
    var options = {
        host: AuthConfig.HOST,
        port: 80,
        method: "POST",
        headers :{
            Authorization: getBaseAuth(),
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': len
        },
        path: path
    };
    return options;
}

// 获取 PUT request options
function getPutReqOptions(path, len) {
    var options = {
        host: AuthConfig.HOST,
        port: 80,
        method: "PUT",
        headers :{
            Authorization: getBaseAuth(),
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': len
        },
        path: path
    };
    return options;
}

// 获取 DELETE request options
function getDeleteReqOptions(path, len) {
    var options = {
        host: AuthConfig.HOST,
        port: 80,
        method: "DELETE",
        headers: {
            Authorization: getBaseAuth(),
            'Accept-Type' : 'application/json',
            'Content-Length': 0
        },
        path: path
    };
    return options;
}

// 处理 DELETE 请求
exports.handleDelReq = function(path, next) {
    var options = getDeleteReqOptions(path);
    http.get(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk){
            data += chunk;
        });
        res.on('end',function(){
            console.log("handle-Del-Req, status code is:"+res.statusCode+", data is:"+data);
            next(res.statusCode, data);
        });
    }).on('error', function(e) {
            console.log("handle-Del-Req error: " + e.message);
            next(HTTP_CODE.ERROR_SERVER, null);
        });
};

// 处理 GET 请求
exports.handleGetReq = function(path, next) {
    var options = getGetReqOptions(path);
    http.get(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk){
            data += chunk;
        });
        res.on('end',function(){
            console.log("handle-Get-Req, status code is:"+res.statusCode+", data is:"+data);
            next(res.statusCode, data);
        });
    }).on('error', function(e) {
            console.log("handle-Get-Req error: " + e.message);
            next(HTTP_CODE.ERROR_SERVER, null);
        });
};

// 处理 POST 请求
exports.handlePostReq = function(path, paramStr, next) {
    var options = getPostReqOptions(path, paramStr.length);
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk){
            data += chunk;
        });
        res.on('end',function(){
            console.log("handle-Post-Req, status code is:"+res.statusCode+", data is:"+data);
            next(res.statusCode, data);
        });
    }).on('error', function(e) {
            console.log("handle-Post-Req error: " + e.message);
            next(HTTP_CODE.ERROR_SERVER, null);
        });
    req.write(paramStr);
    req.end();
}

// 处理 PUT 请求
exports.handlePutReq = function(path, paramStr, next) {
    var options = getPutReqOptions(path, paramStr.length);
    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        var data = '';
        res.on('data', function (chunk){
            data += chunk;
        });
        res.on('end',function(){
            console.log("handle-Put-Req, status code is:"+res.statusCode+", data is:"+data);
            next(res.statusCode, data);
        });
    }).on('error', function(e) {
            console.log("handle-Put-Req error: " + e.message);
            next(HTTP_CODE.ERROR_SERVER, null);
        });
    req.write(paramStr);
    req.end();
}