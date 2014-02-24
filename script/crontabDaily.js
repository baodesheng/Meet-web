/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-11-1
 * Time: 下午4:22
 * To change this template use File | Settings | File Templates.
 * 此脚本用于定时（上午7点和晚上7点）推5篇精选文章（lr_article表status字段3->2）
 */

var mysql = require("mysql");
var http = require("http");
var querystring = require('querystring');

/********************* 数据库操作 **************************/

//  表名
var TABLE_NAME_ARTICLE = "lr_article";
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

/********************* 发布精选 **************************/

/**
 * 获取要推的精选文章
 */
function getDaily() {
    var h = new Date().getHours();
    var pulishNum = 1;
    if (parseInt(h) < 8) pulishNum = 1;//早上7点发1篇
    var creamSql = "select * from " + TABLE_NAME_ARTICLE + " where status=3 order by id limit 0,"+pulishNum;

    var creamNext = function(msg, r){
        if (r && r instanceof Array && r.length > 0) {
            console.log(new Date().toDateString() +  " ,total " + r.length + " articles ready to publish.");
            publishCream(r, 0, r.length);
        }
    }

    query(creamSql, creamNext);
}

/**
 * 发布文章
 * @param rs
 * @param i
 * @param total
 */
function publishCream(rs, i, total) {
    var updateSql = "update " + TABLE_NAME_ARTICLE + " set status=2 where id=" + rs[i].id;

    var rf = function(msg, r) {
        console.log(i + " publish cream " + rs[i].id + " " + msg);
        if (i+1 < total) {
            publishCream(rs, i+1, total);
        } else {
            console.log(new Date().toDateString() + " ,publish cream  finish. Beign to push...");
            autoPush();
        }
    };
    query(updateSql, rf);
}

function autoPush() {
    var opts = {
        key : 'RECORD_DAILY_AP_KEY'
    };
    var opts_str = querystring.stringify(opts);
    var options = {
        host: "mobile.liba.com",// mobile.liba.com localhost
        port: 80,//8080 80
        path: "/service/liba_only/ap?key=RECORD_DAILY_AP_KEY",//service
        method: "PUT",
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
            console.log("End push.");
        });

    }).on('error', function(e) {
            console.log("auto push error: " + e.message);
        });
    req.write(opts_str);
    req.end();
}

/********************* 执行操作 **************************/
/********************* 涉及数据，请慎重!!! ****************/

getDaily();
