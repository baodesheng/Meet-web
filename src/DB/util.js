/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-26
 * Time: 下午3:43
 * To change this template use File | Settings | File Templates.
 */

var DB = require("./db");

// --- private constant ---

var DEFAULT_PAGE_NO = 1, DEFAULT_PAGE_SIZE = 10;

// --- public constant ---

exports.PAGE = {
    DEFAULT_PAGE_NO: DEFAULT_PAGE_NO,
    DEFAULT_PAGE_SIZE: DEFAULT_PAGE_SIZE
};

// --- public functions ---

function getPageSql(params) {
    var options = {
        pageNo: DEFAULT_PAGE_NO,
        pageSize: DEFAULT_PAGE_SIZE
    };
    if (params) {
        if (params.pageNo && !isNaN(params.pageNo) && params.pageNo > 0) {
            options.pageNo = parseInt(params.pageNo);
        }
        if (params.pageSize && !isNaN(params.pageSize) && params.pageSize > DEFAULT_PAGE_SIZE){
            options.pageSize = parseInt(params.pageSize);
        }
    }
    var startIndex = (options.pageNo-1)*options.pageSize;
    return " limit "+startIndex+","+options.pageSize;
}

function select(sql, next) {
    var rf = function(msg, rs) {
        next(msg, rs);
    };
    DB.query(sql, rf);
}

function insert(tableName, rowData, next) {
    var sql = "INSERT INTO " + tableName + " SET ?";
    var rf = function(msg, rs) {
        next(msg, rs);
    };
    DB.insert(sql, rowData, rf);
}

exports.select = select;
exports.insert = insert;
exports.getPageSql = getPageSql;