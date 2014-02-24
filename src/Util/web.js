/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 下午1:44
 * To change this template use File | Settings | File Templates.
 */

var url = require("url");
var path = require("path");
var fs = require("fs");
var ejs = require("ejs");

var MIME = require("../Config/constant").MIME;

var WebRootPath = "./WebRoot";
var WebHost_WORK = "meet.liba.com";

function start(request, response) {
    // 获取参数
    var queryParams = url.parse(request.url, true).query;
    var assetName = queryParams.name;// 资源名称
    var assetType = queryParams.type;// 资源类型

    var folderName = "";
    var mime = "";
    if (assetType == "html") {
        folderName = "html";
        mime = "text/html";
    } else if (assetType == "png" || assetType == "jpeg"  || assetType == "gif") {
        folderName = "images";
        mime = "image/"+assetType;
    } else if (assetType == "jpg") {
        folderName = "images";
        mime = "image/jpeg";
    }

    var realPath = "./assets/" + folderName + "/" + assetName + "." + assetType;
    console.log("realPath:"+realPath);

}

function getContentType(pathname) {
    var extName = path.extname(pathname);
    console.log("extName is:"+extName);

    var mimeType = extName.slice(1);
    console.log("mime type is:"+mimeType);

    var contentType = MIME[mimeType];
    console.log("contentType is:"+contentType);

    return contentType;
}

function getRealPath(pathname, contentType) {
    var realPath = "";
    if (contentType) {
        realPath = WebRootPath + pathname;
    }
    console.log("static file real path is:"+realPath);
    return realPath;
}

function load(pathname, request, response) {
    var contentType = getContentType(pathname);
    if (contentType) {
        var realPath = getRealPath(pathname, contentType);
        console.log("realPath:"+realPath);

        path.exists(realPath, function (exists) {
            if (!exists) {
                response.writeHead(404, {'Content-Type': 'text/plain'});
                response.write("This request URL " + realPath + " was not found on this server.");
                response.end();
            } else {
                fs.readFile(realPath, "binary", function(err, file) {
                    if (err) {
                        response.writeHead(500, {'Content-Type': 'text/plain'});
                        response.end(err);
                    } else {
                        response.writeHead(200, {'Content-Type': contentType});
                        response.write(file, "binary");
                        response.end();
                    }
                });
            }
        });
    } else {
        response.writeHead(500, {'Content-Type': 'text/plain'});
        response.end();
    }
}

function redirect(pathname, request, response) {
    var redirectUrl = "http://"+ WebHost_WORK + pathname;
    console.log("redirect to:"+redirectUrl);
    response.writeHead(302, {'Location': redirectUrl});
    response.end();
}

function loadPage(ejsName, data, response) {
    var fileName = WebRootPath + '/' + ejsName + '.ejs';
    // 注意这里的filename，说明调用的ejs名，用于include的判断
    data.filename = fileName;
    var ejsContent = fs.readFileSync(fileName, 'utf8');
    var ret = ejs.render(ejsContent, data);
    response.writeHead(200, {"Content-Type": "text/html"});//plain
    response.write(ret);
    response.end();
}

exports.start = start;
exports.load = load;
exports.redirect = redirect;
exports.loadPage = loadPage;