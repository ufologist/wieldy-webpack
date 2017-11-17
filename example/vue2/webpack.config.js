var wieldyWebpack = require('wieldy-webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

/**
 * 添加对 Vue 支持的配置
 * 
 * @param {object} env 
 * @param {object} webpackConfig 
 */
function addVueSupport(env, webpackConfig) {
    // 找出内置的 babel-loader
    var babelLoader = webpackConfig.module.rules.filter(function(rule) {
        return rule.loader == 'babel-loader'
    })[0];

    // 找出内置的 css 文件关联的 rule, 这样做的好处是共用内置的配置
    var cssRule = webpackConfig.module.rules.filter(function(rule) {
        return rule.test.test('.css');
    })[0];
    // 找出内置的 css-loader, 这样便于共用配置
    var cssLoader = cssRule.use.filter(function(loader) {
        return loader.loader == 'css-loader';
    })[0];

    // 为了样式支持 HMR, 在开发环境下只使用 style-loader
    // XXX 目前发现 async import 即动态导入的模块 HMR 没有生效,
    // 即开启 HMR 的时候, 修改 async-component.vue 确实会重载模块, 但界面上没有效果
    var vueCssLoader = env.__mode__ == 'dev' ? [{
        loader: 'vue-style-loader'
    }, cssLoader] : ExtractTextPlugin.extract({
        fallback: 'vue-style-loader',
        use: [cssLoader]
    });

    // 添加 vue-loader 配置
    webpackConfig.module.rules.push({
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
            loaders: {
                // 需要在这里设置 babel-loader, 否则 ES2015 的语法不会转义,
                // 除非你统一使用了 .babelrc 配置文件
                js: [babelLoader],
                // 由于 vue-loader 默认的 extractCSS 配置没有对 css-loader 添加 importLoaders 设置,
                // 这会造成 @import 进去的样式没有经过 postcss-loader 的处理,
                // 所以我们需要自己来设置 css 的 loader 处理
                //
                // 但是不能在 options.loaders.css 中配置 postcss-loader
                // 否则会报错
                // Module build failed: TypeError: Cannot read property 'postcss' of null
                // 应该在 options.postcss 中配置
                // 不过为了统一 webpack 的配置, 我们使用共用的 postcss.config.js 来配置
                css: vueCssLoader
            }
        }
    });

    // 如果你不使用 Vue 的模板功能, 则可以直接使用默认的 vue.runtime 版
    // if (env.__mode__ == 'dev') {
    //     webpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.js';
    // } else {
    //     webpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.min.js';
    // }
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
        addVueSupport(env, webpackConfig);
        addEntries(env, webpackConfig);
        return webpackConfig;
    });
};