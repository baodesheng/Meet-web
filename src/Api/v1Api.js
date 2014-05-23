/**
 * Created by yangjun on 14-5-22.
 */

var http = require("http");
var url = require("url");
var crypto = require('crypto');
var querystring = require('querystring');
var uuid = require("node-uuid");
var date = require("../Util/date");
//var rest = require("restler");

var apiHost = "ma.liba.com";
var apiPath = "/v1/session";

function getValidParams() {
    var dateStr = new Date().format('YYYY-MM-dd hh:mm:ss');

    var v1 = uuid.v1();//timestamp
    var v4 = uuid.v4();//random number

    var md51 = crypto.createHash('md5');
    md51.update(dateStr+v1);
    var sessionhash = md51.digest('hex');

    var md52 = crypto.createHash('md5');
    md52.update(v4);
    var nonce = md52.digest('hex');

    var md53 = crypto.createHash('md5');
    md53.update(sessionhash + nonce);
    var signature = md53.digest('hex');

    var params = {
        sessionhash: sessionhash,
        nonce: nonce,
        signature: signature
    }
    return params;
}

function getValidParamsWithSessionHash(sh) {
    var v4 = uuid.v4();//random number
    var md52 = crypto.createHash('md5');
    md52.update(v4);
    var nonce = md52.digest('hex');

    var md53 = crypto.createHash('md5');
    md53.update(sh + nonce);
    var signature = md53.digest('hex');

    var params = {
        sessionhash: sh,
        nonce: nonce,
        signature: signature
    }
    return params;
}

function login(loginInfo, next) {

    var opts = {};
    if (loginInfo.provider == "liba") {
        var md51 = crypto.createHash('md5');
        md51.update(loginInfo.password);
        loginInfo.password = md51.digest('hex');
        opts = {
            provider : loginInfo.provider,
            openId : loginInfo.username,
            pwd : loginInfo.password
        };
    } else if (loginInfo.provider == "douban" || loginInfo.provider == "weibo" || loginInfo.provider == "qq") {
        opts = {
            provider : loginInfo.provider,
            openId : loginInfo.openId,
            name : loginInfo.username
        };
        if (loginInfo.provider == "qq") {
            opts.avatarUrl = loginInfo.avatarUrl;
        }
    }
    var opts_str = querystring.stringify(opts);
    var options = {
        host: apiHost,
        port: 80,
        path: apiPath,
        method: "POST",
        headers :{
            'Content-Type' : 'application/x-www-form-urlencoded',
            'Content-Length': opts_str.length
        }
    };

    var req = http.request(options, function(res) {
        res.setEncoding('utf8');
        console.log("Got-json response: " + res.statusCode);
        var data = '';

        res.on('data', function (chunk){
            data += chunk;
        });

        res.on('end',function(){
            console.log(data);
            var obj = JSON.parse(data);
            if (obj.user) {
                next(200, obj);
            } else {
                next(401, "error");
            }

        });

    }).on('error', function(e) {
        next(500 , "Server is busy.");
        console.log("Got-json error: " + e.message);
    });
    req.write(opts_str);
    req.end();
}



function getAvatarUrl(userId) {
    var avatarUrl = "http://avatars.liba.com/default/d_head.png";
    if(userId){
        var pathStr = "1"+userId;
        var path = "";
        for(var i = 0 ; i < pathStr.length;i++){
            path = path + pathStr.substr(i,1);
            if(i%2 == 1){
                path = path + "/";
            }
        }
        avatarUrl = "http://avatars.liba.com/" + path + userId +".gif";
    }
    return avatarUrl;
}

exports.login = login;