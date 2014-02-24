/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-9-10
 * Time: 下午6:35
 * 此脚本用于把外部文章导入到纪录片2.0的文章数据结构里（主要是作者信息是不存在的）
 */

var mysql = require("mysql");
var UUID = require("node-uuid");
var http = require("http");

/********************* V3_API操作 **************************/

var USER_API_PATH = "/v3/user";

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

// 处理 GET 请求
function handleGetReq(path, next) {
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
            next(500, null);
        });
};

function getUserByUserName(userName, next) {
    var path = USER_API_PATH + "?name=" + userName;
    handleGetReq(path, next);
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

/********************* 数据库操作 **************************/

//  表名
var TABLE_NAME_ARTICLE = "lr_article";
var TABLE_NAME_CREAM = "liba_cream";
var TABLE_NAME_SECTION = "cream_section";
var TABLE_NAME_ITEM = "section_item";
var FAIL = "fail";
var SUCCESS = "success";

var exportCreamId = 0;
var autoCreamId = 0;
var isAutoImport = false;

function createConn() {
    // 本地测试
    var localhostConfig = {
        host     : 'localhost',
        port     : 3306,
        user     : 'root',
        password : '',
        database : "test"
    };
    // 142服务器测试
    var testhostConfig = {
        host     : 'localhost',
        port     : 3306,
        user     : 'root',
        password : 'password',
        database : "test"
    };
    // 生产环境服务器
    var NewProConfig = {
        host     : '10.1.1.105',
        port     : 3306,
        user     : 'root',
        password : 'Adfj89cc/*-+',
        database : "mobile"
    };

    var connection = mysql.createConnection(NewProConfig);
    connection.connect();
    return connection;
}

function insert(sql, rowData, next) {
    var connection = createConn();

    connection.query(sql, rowData, function(error, result) {
        if (error){
            next(FAIL, null);
            throw  error;
        } else {
            next(SUCCESS, result);
        }
    });

    connection.end();
}

function query(sql, next) {
    var connection = createConn();

    connection.query(sql, function(error, rows, fields) {
        if (error){
            next(FAIL, null);
            throw  error;
        } else {
            next(SUCCESS, rows);
        }
    });

    connection.end();
}


/********************* 导入帖子评论 **************************/

/**
 * 转码
 * @param str
 * @return {*}
 */
function unUnicode(str)
{
    return unescape(str.replace(/\\/g, "%"));
}


/**
 * 导入用户信息到用户表
 * @param rs
 * @param i
 * @param total
 */
function insertArticle(rowData) {

    var sql = "INSERT INTO " + TABLE_NAME_ARTICLE + " SET ?";
    var rf = function(msg, r) {
        console.log(" insert article msg:" + msg);
        if (isAutoImport) {
            setTimeout(getCream,10000,{});
        }
    };
    insert(sql, rowData , rf);
}

function isArticleExist(topicId, importNext){
    var articleSql = "select * from " + TABLE_NAME_ARTICLE + " where topic_id=" + topicId;

    var articleNext = function(msg, r){
        if (r && r instanceof Array && r.length > 0) {
            console.log("liba_cream topicId:"+topicId+" 已存在!");
            if (isAutoImport) {
                getCream({});
            }
        } else {
            importNext();
        }
    }

    query(articleSql, articleNext);
}

/**
 * 获取要导入的文章
 */
function getCream(queryParams) {

    var creamNext = function(msg, r){
        if (r && r instanceof Array && r.length > 0) {
            console.log("Article title:"+r[0].title);

            var importNext = function(){
                // 文章类型 0：LIFE生活 1：旅行 2：新家 3：结婚 4：孩子 5：宠物 6：烹饪 7：幸福 8：随记
                var articleType = 0;
                if ("TRAVEL" == r[0].type) {
                    articleType = 1;
                } else if ("HOME" == r[0].type) {
                    articleType = 2;
                } else if ("MARRY" == r[0].type) {
                    articleType = 3;
                }else if ("BABY" == r[0].type) {
                    articleType = 4;
                }else if ("PET" == r[0].type) {
                    articleType = 5;
                }else if ("COOK" == r[0].type) {
                    articleType = 6;
                }else if ("HAPPY" == r[0].type) {
                    articleType = 7;
                }else if ("NOTE" == r[0].type) {
                    articleType = 8;
                }

                var userNext = function(msg, rs) {
                    if (rs && JSON.parse(rs).id && !isNaN(JSON.parse(rs).id)) {
                        var liba_user_id = JSON.parse(rs).id;
                        // 获取头像
                        var avatar = getAvatarUrl(liba_user_id);
                        var articleJSon = {
                            "author": r[0].author,
                            "author_id": liba_user_id,
                            "avatar": avatar,
                            "title": r[0].title,
                            "image": r[0].image,
                            "content": [],
                            "type": articleType,
                            "view_count": 0,
                            "publish_count": 1,
                            "topic_id": r[0].topic_id,
                            "status": 2,//0:初始 1：直播 2:精选 3:保留 4:废弃
                            "create_time": r[0].update_time,
                            "update_time": r[0].update_time
                        };

                        console.log("uuid is:"+UUID.v1());

                        getSection(r[0].id, articleJSon);
                    } else {
                        console.log("导入失败！找不到用户 "+r[0].author);
                    }

                }

                // 获取LIBA用户信息
                getUserByUserName(r[0].author, userNext);
            }

            autoCreamId = r[0].id;
            isArticleExist(r[0].topic_id, importNext);
        } else if (isAutoImport) {
            console.log("Auto import finish!");
        }
    };

    if (queryParams.creamId && !isNaN(queryParams.creamId)) {
        var creamSql = "select * from " + TABLE_NAME_CREAM + " where status=1 and topic_id > 0 and id=" + queryParams.creamId;
        query(creamSql, creamNext);
    } else if (isAutoImport){
        var creamSql = "select * from " + TABLE_NAME_CREAM + " where status=1 and topic_id > 0 and id > " + autoCreamId + " order by id";
        console.log("auto cream sql:"+creamSql);
        query(creamSql, creamNext);
    }
}

function getSection(creamId, articleJSon) {
    var sectionSql = "select * from " + TABLE_NAME_SECTION + " where cream_id=" + creamId + " order by sec_index";
    console.log("sectionSql:"+sectionSql);

    var sectionNext = function(msg, r){
        if (r && r instanceof Array && r.length > 0) {
//            for (var i=0;i< r.length;i++) {
//                console.log("section id:" + r[i].id + " title:"+r[i].title);
//            }
            getItem(r, 0, r.length, articleJSon, new Array());
        }
    }

    query(sectionSql, sectionNext);
}

function get32UUID()
{
//    var uuidStr = UUID.v1().replace(/[-]/g, "");
    var rNum = Math.round(Math.random()*100);
    console.log("rNum str:"+rNum);
    var uuidStr = "uuid" + new Date().getTime() + rNum ;
    console.log("uuid str:"+uuidStr);
    return uuidStr;
}

function getItem(sectionArr, now, total, articleJSon, contentArr) {
    var section = sectionArr[now];

    var sectionJson = {
        id: 0,
        creamId: 0,
        title: section.title ? section.title : "",
        secIndex: now,
        uuid: get32UUID()
    };
    console.log("sectionJson " + now + " :" + JSON.stringify(sectionJson));

    var itemSql = "select * from " + TABLE_NAME_ITEM + " where section_id=" + section.id + " order by item_index";

    var itemNext = function(msg, r){
        if (r && r instanceof Array && r.length > 0) {
            var dealItem = function(items, nowItem, totalItem, itemArr) {
                var item = items[nowItem];
                var itemJson = {
                    uuid: get32UUID(),
                    itemIndex: nowItem
                };
                if (item.image_url) {
                    itemJson.imageUrl = item.image_url;
                }
                if (item.detail) {
                    itemJson.detail = item.detail;
                }
                console.log("item image:" + item.image_url + " detail:" + item.detail);
                itemArr.push(itemJson);
                if (nowItem+1 < totalItem) {
                    dealItem(items, nowItem+1, totalItem, itemArr);
                } else {
                    console.log("finish section! section is:");
                    sectionJson.items = itemArr;
                    contentArr.push(sectionJson);
                    if (now+1 < total ) {
                        getItem(sectionArr, now+1, total, articleJSon, contentArr);
                    } else {
                        articleJSon.content = JSON.stringify(contentArr);
                        console.log("finish all! article is:");
                        console.log(JSON.stringify(articleJSon));
                        insertArticle(articleJSon);
                    }
                }
            }
            dealItem(r, 0, r.length, new Array());
        } else {
            console.log("finish section! section is:");
            sectionJson.items = [];
            contentArr.push(sectionJson);
            if (now+1 < total ) {
                getItem(sectionArr, now+1, total, articleJSon, contentArr);
            } else {
                console.log("finish all! article is:");
            }
        }
    }

    query(itemSql, itemNext);
}

/********************* 执行操作 **************************/
/********************* 涉及数据，请慎重!!! ****************/

// 接受命令行参数
// 第一个参数 creamId
// 第二个参数 avatar
var args = process.argv.slice(2);

if (args && args instanceof Array && args.length > 0) {
    // 只有一个参数
    if (args.length == 1 && !isNaN(args[0])) {
        // 先检查是否已经存在
        var queryParams = {
            creamId: args[0]
        };
        getCream(queryParams);
    }
    // 两个参数
    else if (args.length == 2) {
        var queryParams = {};
        args.forEach(function (arg, i) {
            console.log("param "+i+":"+arg);
            switch (i) {
                case 0: {
                    if (arg && !isNaN(arg)) {
                        queryParams.creamId = arg;
                        console.log("get cream id:"+arg);
                    }
                }
                    break;
                case 1: {
                    if (arg) {
                        if (queryParams.creamId > 0) {
                            queryParams.avatar = arg;
                            getCream(queryParams);
                            console.log("import cream " + queryParams.creamId + " with avatar:" + queryParams.avatar);
                        }
                    } else {
                        console.log("缺少作者头像URL");
                    }
                }
                    break;
                default:
                    break;
            }
        });
    }
}
// 自己查询合适导入的CREAM_ID
else {
    isAutoImport = true;
    autoCreamId = 403;
    getCream({});
    console.log("Auto get to import cream id ...");
}



