/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-8-1
 * Time: 下午5:20
 * To change this template use File | Settings | File Templates.
 */

var mysql = require("mysql");

/********************* 数据库操作 **************************/

//  表名
var TABLE_NAME = "lr_comment";
var TABLE_NAME_MESSSAGE = "lr_message";
var TABLE_NAME_USER = "lr_user";
var FAIL = "fail";
var SUCCESS = "success";

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
 * 导入单个帖子的评论
 * @param params
 * @param next
 */
function importCommentByTopicId(params, next) {
    var sql = "select content,user_id,user_name,avatar_url,topic_id,sec_index,item_index,update_time from " + TABLE_NAME ;
    sql += " where status=0 and topic_id=" + params.topicId;
    if (params.sectionIndex && !isNaN(params.sectionIndex)) {
        sql += " and sec_index=" + params.sectionIndex;
    }
    if (params.itemIndex && !isNaN(params.itemIndex)) {
        sql += " and item_index=" + params.itemIndex;
    }
    sql += " order by update_time desc ";
    console.log("getCommentByTopicId-sql:"+sql);
    var rf = function(msg, rs) {
        next(msg, rs);
    };
    query(sql, rf);
}

/**
 * 导入所有帖子的评论
 * @param params
 * @param next
 */
function importAllComment(params, next) {
    var sql = "select id,content,user_id,user_name,avatar_url,topic_id,sec_index,item_index,update_time from " + TABLE_NAME ;
    sql += " where status=0 ";
    sql += " order by update_time desc ";
    console.log("getAllComment-sql:"+sql);
    var rf = function(msg, rs) {
        next(msg, rs);
    };
    query(sql, rf);
}

function next(msg, rs) {
    if (rs && rs instanceof Array && rs.length > 0) {
        console.log("getAllComment-count:"+rs.length);
        insertComment(rs, 0, rs.length);
    } else {
        console.log("getAllComment-fail");
    }
}

/**
 * 导入评论到信息表
 * @param rs
 * @param i
 * @param total
 */
function insertComment(rs, i, total) {
    var content = unUnicode(rs[i].content);
    var uuid = "" + rs[i].topic_id + "," + rs[i].sec_index + "," + rs[i].item_index;
    console.log("id:" + rs[i].id + ", author:" + rs[i].user_id + " comment topic_id:" + rs[i].topic_id + ", uudi:" + uuid + " content:" + content);

    var rowData = {
        id: rs[i].id,
        content: content,
        user_id: rs[i].user_id,
        goal_id: rs[i].topic_id,
        uuid: uuid,
        type: 1,
        update_time: rs[i].update_time,
        status: 0
    };
    var sql = "INSERT INTO " + TABLE_NAME_MESSSAGE + " SET ?";
    var rf = function(msg, r) {
        console.log(i + " insert comment " + r + " " + msg);
        if (i+1 < total) {
            insertComment(rs, i+1, total);
        } else {
            console.log("insert all comment finish.");
        }
    };
    insert(sql, rowData , rf);
}

/**
 * 转码
 * @param str
 * @return {*}
 */
function unUnicode(str)
{
    return unescape(str.replace(/\\/g, "%"));
}

/********************* 导入发表帖子的用户 **************************/

/**
 * 导入所有发表帖子的用户
 */
function importAllUser() {
    var sql = "select distinct user_id,user_name,avatar_url from " + TABLE_NAME ;
    console.log("getAllUser-sql:"+sql);
    var rf = function(msg, rs) {
        if (rs && rs instanceof Array && rs.length > 0) {
            insertUser(rs, 0, rs.length);
        } else {
            console.log("getAllUser-fail");
        }
    };
    query(sql, rf);
}

/**
 * 导入用户信息到用户表
 * @param rs
 * @param i
 * @param total
 */
function insertUser(rs, i, total) {
    var selectSql = "select user_id from " +  TABLE_NAME_USER + " where user_id=" + rs[i].user_id;

    var selectNext = function(msg, r) {
        if (r && r instanceof Array && r.length > 0) {//已存在的userId则跳过
            insertUser(rs, i+1, total);
        } else {
            var rowData = {
                user_id: rs[i].user_id,
                user_name: rs[i].user_name,
                avatar_url: rs[i].avatar_url,
                update_time: new Date(),
                status: 0
            };
            var sql = "INSERT INTO " + TABLE_NAME_USER + " SET ?";
            var rf = function(msg, r) {
                console.log(i + " insert user " + r.insertId + " " + msg);
                if (i+1 < total) {
                    insertUser(rs, i+1, total);
                } else {
                    console.log("insert user finish.");
                }
            };
            insert(sql, rowData , rf);
        }
    };
    query(selectSql, selectNext);
}

/********************* 执行操作 **************************/
/********************* 涉及数据，请慎重!!! ****************/

// 导入单个帖子的评论 － for test
//importCommentByTopicId({topicId:7380650}, next);

// 导入所有帖子的评论 - 后续定期导入，注意避免评论数据重复，需修改代码
//importAllComment("", next);

// 导入所有发表帖子的用户 - 导入一次，后续不再操作
//importAllUser();
