/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-5-15
 * Time: 下午3:37
 * To change this template use File | Settings | File Templates.
 */

exports.getAvatarUrl = function(userId) {
    var avatarUrl = "http://mobile.liba.com/MEET_LOGO.png";
    if(userId){
        var pathStr = (userId.toString().length == 6 ? "10"+userId : "1"+userId);
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