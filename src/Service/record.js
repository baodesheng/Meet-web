/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-15
 * Time: 下午2:56
 * To change this template use File | Settings | File Templates.
 */

var DBUtil = require("../DB/util");
var http = require('http');

//  表名
var TABLE_NAME_CREAM = "liba_cream";
var TABLE_NAME_SECTION = "cream_section";
var TABLE_NAME_ITEM = "section_item";
var TABLE_NAME_LR_ARTICLE = "lr_article";
var TABLE_NAME_LR_SHARECODE = 'lr_sharecode';
var TABLE_NAME_LR_PRINT = 'lr_activity_print';

function getCreamByTopicId(params, next) {
    var sql = "select id, author, title, image, type, topic_id, DATE_FORMAT(update_time,'%Y.%m.%d') as publish_time from " + TABLE_NAME_CREAM ;
    sql += " where topic_id=" + params.topicId;
    console.log("getCreamByTopicId sql:"+sql);
    DBUtil.select(sql, next);
}

function getSectionByCreamId(params, next) {
    var sql = "SELECT count(i.item_index) as itemCount,s.sec_index, s.title, s.id FROM " + TABLE_NAME_SECTION + " s, " + TABLE_NAME_ITEM + " i"
    sql += " WHERE s.cream_id=" + params.creamId + " and s.id=i.section_id group by s.sec_index";
    console.log("getSectionByCreamId sql:"+sql);
    DBUtil.select(sql, next);
}

function getItemBySectionId(params, next) {
    var sql = "select id, detail, image_url, item_index from " + TABLE_NAME_ITEM ;
    sql += " where section_id=" + params.sectionId + " order by item_index ";
    console.log("getItemBySectionId sql:"+sql);
    DBUtil.select(sql, next);
}

function getItemByCreamId(params, next) {
    var sql = "SELECT i.detail, i.image_url, s.sec_index, i.item_index FROM cream_section s, section_item i ";
    sql += " WHERE s.cream_id=" + params.creamId + " and s.id=i.section_id order by s.sec_index, i.item_index";
    console.log("getItemByCreamId sql:"+sql);
    DBUtil.select(sql, next);
}

function getArticleContentById(id, version, next) {
    var url = 'http://127.0.0.1:1338/article/' + id + '/content?appVersion=' + version;
    console.log('getArticleContentById ' + url);
    http.get(url,function (res) {
        var data = '';
        if (res.statusCode == 200) {
            res.on('data', function (chunk) {
                data += chunk;
            });
            res.on('end', function () {
                next(data);
            });
        } else {
            next('');
        }
    }).on('error', function (error) {
            console.log(url + '\t' + error.message);
            next('');
        });
}

/**
 * 根据 ID 获取文章
 * @param params
 * @param next
 */
function getArticleById(params, next) {
    var sql = "select id, token, author, author_id, avatar, title, image, '' AS content, type, status, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as publish_time, DATE_FORMAT(create_time,'%Y-%m-%d') as create_time "
    + " from " + TABLE_NAME_LR_ARTICLE + " where id=" + params.articleId;
    if (!params.a || isNaN(params.a) || params.a != -1) {
        sql += " and status<>4 ";
    }
    console.log("getArticleById:"+sql);
    DBUtil.select(sql, next);
}

exports.getArticleByToken = function(params, next) {
    var sql = "select id, token, author, author_id, avatar, title, image, '' AS content, type, status, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as publish_time, DATE_FORMAT(create_time,'%Y-%m-%d') as create_time "
        + " from " + TABLE_NAME_LR_ARTICLE + " where token='" + params.token + "'";
    if (!params.a || isNaN(params.a) || params.a != -1) {
        sql += " and status<>4 ";
    }
    console.log("getArticleByToken:"+sql);
    DBUtil.select(sql, next);
}


exports.getArticleShareCode = function(code, next) {
    var now = new Date();
    var timeLimit = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate() + ' '
                  + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
    var sql = "SELECT * FROM " + TABLE_NAME_LR_SHARECODE + " "
            + "WHERE code='" + code + "' "
            + "AND status=0 "
            + "AND expire_time>'" + timeLimit + "' LIMIT 1";

    console.log('getArticleShareCode: ' + sql);
    DBUtil.select(sql, next);
}

/**
 * 新增打印活动报名信息
 * @param params
 * @param next
 */
function addPrintInfo(params, next) {
    var rowData = {
        user_name: params.userName,
        record_name: params.recordName,
        real_name: params.realName,
        address: params.address,
        tel: params.tel,
        update_time: new Date()
    };
    DBUtil.insert(TABLE_NAME_LR_PRINT, rowData, next);
}

/**
 * 新增打印活动报名信息
 * @param params
 * @param next
 */
function addPrint2Info(params, next) {
    var rowData = {
        user_name: params.userName,
        record_name: params.recordName,
        real_name: params.realName,
        address: params.address,
        tel: params.tel,
        name_type: params.nameType,
        update_time: new Date()
    };
    DBUtil.insert(TABLE_NAME_LR_PRINT, rowData, next);
}

/**
 * 根据 作者ID 获取文章列表
 * @param params
 * @param next
 */
function getArticlesByAuthorId(params, next) {
    var sql = "select a.id, a.token, a.author, a.author_id, a.avatar, a.title, a.image, '' AS content, a.type, a.status, DATE_FORMAT(a.update_time,'%Y-%m-%d %H:%i:%s') as publish_time, DATE_FORMAT(a.create_time,'%Y-%m-%d') as create_time, COUNT(b.id) AS page "
        + " from " + TABLE_NAME_LR_ARTICLE + " a LEFT JOIN lr_cell b ON (a.id=b.article_id) where a.author_id=" + params.authorId;
    if (!params.a || isNaN(params.a) || params.a != -1) {
        sql += " and a.status<>4 ";
    }

    sql += " GROUP BY a.id";

    console.log("getArticlesByAuthorId:"+sql);
    DBUtil.select(sql, next);
}

exports.getArticlesByAuthor = function(params, next) {
    var sql = "select a.id, a.token, a.author, a.author_id, a.avatar, a.title, a.image, '' AS content, a.type, a.status, DATE_FORMAT(a.update_time,'%Y-%m-%d %H:%i:%s') as publish_time, DATE_FORMAT(a.create_time,'%Y-%m-%d') as create_time, COUNT(b.id) AS page "
        + " from " + TABLE_NAME_LR_ARTICLE + " a LEFT JOIN lr_cell b ON (a.id=b.article_id) where a.author='" + params.userName + "'";
    if (!params.a || isNaN(params.a) || params.a != -1) {
        sql += " and a.status<>4 ";
    }

    sql += " GROUP BY a.id";

    console.log("getArticlesByAuthor:"+sql);
    DBUtil.select(sql, next);
}

exports.getArtivityPrint = function(next) {
    var sql = "SELECT user_name, record_name, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as update_time FROM lr_activity_print ORDER BY id DESC";
    DBUtil.select(sql, next);
};

exports.getCreamByTopicId = getCreamByTopicId;
exports.getSectionByCreamId = getSectionByCreamId;
exports.getItemBySectionId = getItemBySectionId;
exports.getItemByCreamId = getItemByCreamId;
exports.getArticleById = getArticleById;

exports.getArticleContentById = getArticleContentById;

exports.addPrintInfo = addPrintInfo;
exports.addPrint2Info = addPrint2Info;
exports.getArticlesByAuthorId = getArticlesByAuthorId;