var wieldyWebpack = require('wieldy-webpack');

/**
 * 添加入口配置
 * 
 * @param {object} env 
 * @param {object} webpackConfig 
 */
function addEntries(env, webpackConfig) {
    // 指定入口的 js 文件和 html 文件的路径, 默认根目录是 src 目录
    var entry = wieldyWebpack.createEntry('index/index.js', 'index.html', {
        env: env
    });
    entry.addToWebpackConfig(webpackConfig);
}

/**
 * 美化 JS 代码, 主要用于调试定位线上的 bug
 * 
 * 例如: 代码发布上线以后, 发现页面打开空白 :(
 * 
 * 此时我们可以开代理来映射本地的代码, 使用未压缩过的代码来定位问题
 * 
 * @param {object} env 
 * @param {object} webpackConfig 
 */
function beautifyJsForDebug(env, webpackConfig) {
    var webpack = require('webpack');
    var uglifyJsPlugin = webpackConfig.plugins.filter(function(plugin) {
        return plugin instanceof webpack.optimize.UglifyJsPlugin
    })[0];
    if (uglifyJsPlugin) {
        uglifyJsPlugin.options = {
            beautify: true,
            comments: true,
            mangle: false,
            compress: false
        }
    }
}

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        addEntries(env, webpackConfig);
        return webpackConfig;
    });
};