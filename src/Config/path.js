/**
 * Created with JetBrains WebStorm.
 * User: yang
 * Date: 13-3-28
 * Time: 下午1:49
 * To change this template use File | Settings | File Templates.
 */

/**
 * 静态路径
 * @type {Object}
 */
exports.STATIC = {
    NO_PERMISSION: "/403.html",
    NOT_FOUND: "/404.html",
    ERROR_SERVER: "/500.html",
    INDEX: "/index.html",
    PRINT_SUCCESS: "/print-ok.html",
    PRINT2_SUCCESS: "/story_book_ok.html",
    STORY_BOOK_LIBA_LOGIN: "/story_book_liba_login.html"
};

/**
 * 动态路径
 * @type {Object}
 */
exports.DYNAMIC = {
    LOGIN: "/login",
    STORY_BOOK_LIST: "/story_book_list"
};

// ----- EJS -----

// EJS NAMES
exports.EJS = {
    MESSAGE: "message",
    LOGIN: "login",
    SHOW: "show",
    SHOW_OBJECT: "show_object",
    ARTICLE: 'article',
    INVITE: 'invite',
    MEET: 'meet',
    MEET_PLAY: 'meet_play',
    STORY_BOOK_LIST: "story_book_list",
    STORY_BOOK_INFO: "story_book_info",
    PRINT_LIST: "print_list"
};