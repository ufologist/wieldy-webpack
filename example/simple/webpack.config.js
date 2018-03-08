var wieldyWebpack = require('wieldy-webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * 添加入口配置
 * 
 * @param {object} env 
 * @param {object} webpackConfig 
 */
function addEntries(env, webpackConfig) {
    // 指定入口的 js 文件和 html 文件的路径, 默认根目录是 src 目录
    wieldyWebpack.createEntry('index/index.js', 'index.html', {
        env: env
    }).addToWebpackConfig(webpackConfig);
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
    var index = -1;
    for (var i = 0, length = webpackConfig.plugins.length; i < length; i++) {
        if (webpackConfig.plugins[i] instanceof webpack.optimize.UglifyJsPlugin) {
            index = i;
            break;
        }
    }
    if (index != -1) {
        webpackConfig.plugins.splice(index, 1);
    }
    process.env.NODE_ENV = 'development';
}

/**
 * 构建的时候设置只启用某几个入口
 * 
 * 主要是因为配置的入口越来越多, 构建的速度也就越来越慢
 * 但是开发的时候, 一般我们只会调试某个入口, 因此可以只构建这个入口即可
 * 
 * npm start -- --env.__entry__=a/a.js,b/b.js --devtool=false
 */
function enableEntries(env, webpackConfig) {
    if (env.__entry__) {
        var _entry = env.__entry__.split(',');

        // 去掉不启用的 entry
        for (var entry in webpackConfig.entry) {
            if (_entry.indexOf(entry + '.js') == -1) {
                delete webpackConfig.entry[entry];
            }
        }

        // 去掉不启用的 HtmlWebpackPlugin 实例
        for (var i = 0, length = webpackConfig.plugins.length; i < length; i++) {
            var plugin = webpackConfig.plugins[i];
            if (plugin instanceof HtmlWebpackPlugin) {
                if (_entry.indexOf(plugin.options.filename.replace('.html', '.js')) == -1) {
                    webpackConfig.plugins.splice(i, 1);
                    i = i - 1;
                }
            }
        }

        console.log('启用的入口有\n', webpackConfig.entry);
    }
}

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        addEntries(env, webpackConfig);
        enableEntries(env, webpackConfig);
        return webpackConfig;
    });
};