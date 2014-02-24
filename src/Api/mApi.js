/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 12-12-10
 * Time: 下午1:07
 * To change this template use File | Settings | File Templates.
 */

var http = require("http");
var url = require("url");
var crypto = require('crypto');
var querystring = require('querystring');
var uuid = require("node-uuid");
var date = require("../Util/date");
//var rest = require("restler");

var apiHost = "m.liba.com";
var apiPath = "/new/index.php";

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
    var md51 = crypto.createHash('md5');
    md51.update(loginInfo.password);
    loginInfo.password = md51.digest('hex');
    var validParams = getValidParamsWithSessionHash('');
    var opts = {
        action : 'login_without_sessionhash',
        sessionhash : '',
        nonce : validParams.nonce,
        signature : validParams.signature,
        username : loginInfo.username,
        password : loginInfo.password
    };
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
            var code = obj.return.code;
            var message = obj.return.message;
            if (code && String(code) == "1") {
                var returnData = obj.return.data;
                var userId = returnData.userid;
                var avatar_path = returnData.avatar_path;
                var sessionHash = returnData.sessionhash;
                console.log("liba uid:"+userId+" avatar:"+avatar_path+" sh:"+sessionHash);
                next(200, {"userId": userId, "avatar": avatar_path, "sessionHash": sessionHash});
            } else {
                next(401, message);
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