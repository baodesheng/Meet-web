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
    var sql = "select id, author, author_id, avatar, title, image, '' AS content, type, status, DATE_FORMAT(update_time,'%Y-%m-%d %H:%i:%s') as publish_time, DATE_FORMAT(create_time,'%Y-%m-%d') as create_time "
    + " from " + TABLE_NAME_LR_ARTICLE + " where id=" + params.articleId;
    if (!params.a || isNaN(params.a) || params.a != -1) {
        sql += " and status<>4 ";
    }
    console.log("getArticleById:"+sql);
    DBUtil.select(sql, next);
}

exports.getCreamByTopicId = getCreamByTopicId;
exports.getSectionByCreamId = getSectionByCreamId;
exports.getItemBySectionId = getItemBySectionId;
exports.getItemByCreamId = getItemByCreamId;
exports.getArticleById = getArticleById;

exports.getArticleContentById = getArticleContentById;
