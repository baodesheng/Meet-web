/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-26
 * Time: 下午3:38
 * To change this template use File | Settings | File Templates.
 */

var mysql = require("mysql");
var CommonConfig = require("../Config/constant");

function createConn() {
    var localhostConfig = {
        host     : 'localhost',
        port     : 3306,
        user     : 'root',
        password : '',
        database : "test"
    };

    var host151Config = {
        host     : 'localhost',
        port     : 3306,
        user     : 'root',
        password : '111111',
        database : "mobile"
    };

    var ProConfig = {
        host     : '10.1.1.66',
        port     : 4306,
        user     : 'root',
        password : 'Adfj89cc/*-+',
        database : "mobile"//,
    };

    var NewProConfig = {
        host     : '10.1.1.105',
        port     : 3306,
        user     : 'root',
        password : 'Adfj89cc/*-+',
        database : "mobile"//,
    };

    var connection = mysql.createConnection(NewProConfig);
    connection.connect();
    return connection;
}

function insert(sql, rowData, next) {
    var connection = createConn();

    connection.query(sql, rowData, function(error, result) {
        if (error){
            next(CommonConfig.MESSAGE.FAIL, null);
            throw  error;
        } else {
            next(CommonConfig.MESSAGE.SUCCESS, result);
        }
    });

    connection.end();
}

function query(sql, next) {
    var connection = createConn();

    connection.query(sql, function(error, rows, fields) {
        if (error){
            next(CommonConfig.MESSAGE.FAIL, null);
            throw  error;
        } else {
            next(CommonConfig.MESSAGE.SUCCESS, rows);
        }
    });

    connection.end();
}

exports.insert = insert;
exports.query = query;