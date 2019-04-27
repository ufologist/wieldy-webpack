var wieldyWebpack = require('wieldy-webpack');

/**
 * 添加入口配置
 * 
 * @param {object} env 
 * @param {object} webpackConfig 
 */
function addEntries(env, webpackConfig) {
    // 指定入口的 js 文件和 html 文件的路径, 默认相对于 src 目录(根目录)
    wieldyWebpack.createEntry('index/index.js', 'index.html', {
        env: env,
        // 有多个入口时, 在创建时需要设置 setChunks 为 true
        setChunks: true
    }).addToWebpackConfig(webpackConfig);

    // 使用 layout 机制
    wieldyWebpack.createEntry('about/about.js', 'about/about.html', {
        title: 'wieldy-webpack 多入口示例项目 about',
        env: env,
        setChunks: true
    }).useLayout('layout.html', {
        env: {
            __body_start__: '<p>测试</p>'
        }
    }).addToWebpackConfig(webpackConfig);

    // 使用 layout 机制时可以不指定入口的 html 文件
    wieldyWebpack.createEntry('login/login.js', '', {
        title: 'wieldy-webpack 多入口示例项目 login',
        env: env,
        setChunks: true
    }).useLayout('layout.html', {
        env: {
            __body_start__: `
                <h1>登录</h1>
                <ul>
                    <li><a href="/index.html">首页</a></li>
                    <li><a href="/about/about.html">关于</a></li>
                    <li><a href="/login/login.html">登录</a></li>
                </ul>
            `
        }
    }).addToWebpackConfig(webpackConfig);
}

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        addEntries(env, webpackConfig);
        return webpackConfig;
    });
};