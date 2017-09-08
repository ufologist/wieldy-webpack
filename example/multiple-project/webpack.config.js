var wieldyWebpack = require('wieldy-webpack');

module.exports = function(env) {
    if (!env || !env.__dir__) {
        throw new Error('必须设置 --env.__dir__ 参数来指定要构建的文件夹');
    }

    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        // 指定入口的 js 文件和 html 文件的路径, 默认相对于 src 目录(根目录)
        var entry = wieldyWebpack.createEntry('index.js', 'index.html', {
            env: env,

            // 如果有多个入口, 则在创建时需要设置 setChunks 为 true
            // setChunks: true,

            // 多项目时需要修改 src 目录的根目录
            srcBase: 'src/' + env.__dir__,
        });
        entry.addToWebpackConfig(webpackConfig);

        return webpackConfig;
    });
};