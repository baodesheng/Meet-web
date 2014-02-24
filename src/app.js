/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 上午11:04
 * To change this template use File | Settings | File Templates.
 */

var server = require("./server");
var route = require("./route");

server.start(route.route);