var wieldyWebpack = require('wieldy-webpack');

/**
 * 添加对 React 支持的配置
 * 
 * @param {*} env 
 * @param {*} webpackConfig 
 */
function addReactSupport(env, webpackConfig) {
    var babelLoaderOptions = webpackConfig.module.rules.filter(function(rule) {
        return rule.loader == 'babel-loader'
    })[0].options;

    // 添加 babel-preset-react 启用 JSX
    babelLoaderOptions.presets.push('react');
}

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

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        addReactSupport(env, webpackConfig);
        addEntries(env, webpackConfig);
        return webpackConfig;
    });
};