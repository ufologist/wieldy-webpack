var wieldyWebpack = require('wieldy-webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

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

        // 添加 vue-loader 配置
        webpackConfig.module.rules.push({
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                loaders: {
                    // 需要在这里设置 babel-loader, 否则 ES2015 的语法不会转义,
                    // 除非你统一使用了 .babelrc 配置文件
                    js: 'babel-loader?' + JSON.stringify(babelLoaderOptions),
                    // 不能在 options.loaders.css 中配置 postcss-loader
                    // 否则总是报错
                    // Module build failed: TypeError: Cannot read property 'postcss' of null
                    // 应该在 options.postcss 中配置
                    // 为了统一 webpack 的配置, 我们使用 postcss.config.js 来配置
                    css: ExtractTextPlugin.extract({
                        fallback: 'vue-style-loader',
                        use: [{
                            loader: 'css-loader',
                            options: {
                                // 确保通过 @import 导入的 css 也使用 postcss 来处理
                                importLoaders: 1,
                                // 如果不开启 sourceMap, 调试的时候定位不到样式声明的地方
                                sourceMap: env.__mode__ == 'dev',
                                minimize: env.__mode__ != 'dev'
                            }
                        }]
                    })
                }
            }
        });

        // 如果你不使用 Vue 的模板功能, 则可以直接使用默认的 vue.runtime 版
        // if (env.__mode__ == 'dev') {
        //     webpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.js';
        // } else {
        //     webpackConfig.resolve.alias['vue$'] = 'vue/dist/vue.min.js';
        // }

        return webpackConfig;
    });
};