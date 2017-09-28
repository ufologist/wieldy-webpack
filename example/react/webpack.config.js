var wieldyWebpack = require('wieldy-webpack');

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        // 指定入口的 js 文件和 html 文件的路径, 默认根目录是 src 目录
        var entry = wieldyWebpack.createEntry('index/index.js', 'index.html', {
            env: env
        });
        entry.addToWebpackConfig(webpackConfig);

        var babelLoaderOptions = webpackConfig.module.rules.filter(function(rule) {
            return rule.loader == 'babel-loader'
        })[0].options;

        // 添加 babel-preset-react 启用 JSX
        babelLoaderOptions.presets.push('react')

        return webpackConfig;
    });
};