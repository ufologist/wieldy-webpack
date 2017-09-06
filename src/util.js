/**
 * 判断字符串是否以斜杠(/)结尾, 如果没有则自动修复
 * 
 * @param {string} string 
 * @return {string} 以斜杠(/)结尾的字符串
 * @see https://webpack.js.org/configuration/dev-server/#devserver-publicpath-
 *      Make sure publicPath always starts and ends with a forward slash.
 */
function endsWithForwardSlash(string) {
    if (string.slice(-1) != '/') {
        console.warn(string + ' 应该以斜杠(/)结尾, 已自动修复');
        return string + '/';
    }

    return string;
}

module.exports = {
    endsWithForwardSlash: endsWithForwardSlash
};