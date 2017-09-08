var wieldyWebpack = require('wieldy-webpack');

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        // 指定入口的 js 文件和 html 文件的路径, 默认相对于 src 目录(根目录)
        var entryIndex = wieldyWebpack.createEntry('index/index.js', 'index.html', {
            env: env,
            // 有多个入口时, 在创建时需要设置 setChunks 为 true
            setChunks: true
        });
        entryIndex.addToWebpackConfig(webpackConfig);

        var entryAbout = wieldyWebpack.createEntry('about/about.js', 'about/about.html', {
            env: env,
            // 有多个入口时, 在创建时需要设置 setChunks 为 true
            setChunks: true
        });
        entryAbout.addToWebpackConfig(webpackConfig);

        return webpackConfig;
    });
};