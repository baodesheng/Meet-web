exports.CODE = {
    SUCCESS: 1,
    FAIL: 0
};

exports.make = function(code, message, data) {
    var rs = {};
    if (isNaN(code)) {
        rs.code = this.CODE.FAIL;
    } else {
        rs.code = code;
    }
    rs.message = message ? message : "";
    rs.data = data ? data : [];
    var returnStr = JSON.stringify(rs);
    return returnStr;
};