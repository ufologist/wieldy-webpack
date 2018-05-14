var path = require('path');

var mockHttpApi = require('mock-http-api');

var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var InlineChunksHtmlWebpackPlugin = require('inline-chunks-html-webpack-plugin');
// 如果只是单纯的复制资源, 可以使用 copy-webpack-plugin 插件
// 例如 { context: 'from/directory', from: '**/*' }
// var CopyWebpackPlugin = require('copy-webpack-plugin');

var mergeEnv = require('./merge-env.js');
var mergeWpkConfig = require('./merge-wpk-config.js');
var chunkNameResolver = require('./chunk-name-resolver.js');
var getDefinePlugin = require('./get-define-plugin.js');
var addDeployPlugin = require('./add-deploy-plugin.js');

var pkg = require(process.cwd() + '/package.json');

function getImgLoaders(wpkConfig, env) {
    var imgLoaders = [{
        loader: 'url-loader',
        options: {
            limit: wpkConfig.urlLoader.limit,
            name: wpkConfig.output.res + '/' + wpkConfig.output.resFilename
        }
    }];
    if (env.__mode__ != 'dev') { // 非开发模式才做图片压缩
        imgLoaders.push({
            loader: 'image-webpack-loader',
            options: wpkConfig.imageWebpackLoader
        });
    }
    return imgLoaders;
}

function getWebpackConfig(env) {
    env = mergeEnv(env);
    var wpkConfig = mergeWpkConfig(env);

    var webpackConfig = {
        entry: {},
        output: {
            path: wpkConfig.output.path,
            publicPath: env.__public_path__,
            filename: wpkConfig.output.jsFilename,
            chunkFilename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename
        },
        module: {
            rules: [{ // js
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: wpkConfig.babelLoader
            }, { // css
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [{
                        loader: 'css-loader',
                        options: wpkConfig.cssLoader
                    }, {
                        loader: 'postcss-loader',
                        options: wpkConfig.postcssLoader
                    }]
                })
            }, { // html, 用于处理 HTML 中依赖的资源, 例如 <img src="res/foo.png">
                test: /\.html$/,
                use: {
                    // 本来是用 html-loader 的,
                    // 但是使用之后 <%=webpackConfig.output.publicPath%> 这样的模版语法就不被解析了
                    loader: 'underscore-template-loader'
                }
            }, { // 图片
                test: /\.(jpe?g|png|gif|svg)(\?\S*)?$/i,
                use: getImgLoaders(wpkConfig, env)
            }, { // 字体
                test: /\.(otf|eot|ttf|woff2?)(\?\S*)?$/i,
                loader: 'url-loader',
                options: {
                    limit: wpkConfig.urlLoader.limit,
                    name: wpkConfig.output.res + '/' + wpkConfig.output.resFilename
                }
            }]
        },
        resolve: {
            modules: [ // 配置 modules 来提升 webpack 的构建速度
                'src',
                'node_modules'
            ],
            alias: {
                // 设置这个 alias 便于直接从 src 目录引用文件, 放心不会与引用 scope 包时冲突
                // 例如: import c from '@/a/b/c.js';
                // 但是注意, 在 CSS 的 @import 中使用这个 alias 时, 必须加一个 ~ 符号在最前面
                // 因为直接 @import url(@/a/b/c.css) 会被解析为 './@/a/b/c.css' 这样当然就找不到模块了
                // 正确的用法是: @import url(~@/a/b/c.css)
                '@': path.resolve(process.cwd(), 'src')
            }
        },
        plugins: [
            new CleanWebpackPlugin([wpkConfig.output.path], {
                root: process.cwd()
            }),
            getDefinePlugin(env),
            new ExtractTextPlugin(wpkConfig.output.cssFilename, {
                allChunks: false
            }),
            new webpack.BannerPlugin(`${env.__dir__ || pkg.name} | (c) ${pkg.author}`),
            // 分离所有 npm 的包(JS/JSON 文件), 打包成一个第三方依赖包
            new webpack.optimize.CommonsChunkPlugin({
                name: 'vendor',
                filename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename,
                minChunks: function(module) {
                    // 参考
                    // https://github.com/vuejs-templates/webpack
                    // template/build/webpack.prod.conf.js
                    var nodeModulesPath = path.join(process.cwd(), 'node_modules');
                    return module.resource && /\.(js|json)$/.test(module.resource) && module.resource.indexOf(nodeModulesPath) === 0;
                }
            }),
            // 分离出 manifest chunk
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                minChunks: Infinity,
                filename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename,
            })
        ],
        devtool: wpkConfig.devtool,
        devServer: {
            // Tell the server where to serve content from.
            // **This is only necessary if you want to serve static files.**
            // devServer.publicPath will be used to determine where the bundles should be served from, and takes precedence.
            // By default it will use your current working directory to serve content
            contentBase: wpkConfig.output.path,
            port: env.__port__,

            // 默认只监听 localhost, 如果想通过 IP 来访问, 需要在启动时配置 host
            // 例如: --host=0.0.0.0
            // 但这样设置后自动 open 浏览器打开的是 http://0.0.0.0:8080/ 无法访问,
            // 因此要配合 useLocalIp 来使用, 例如: --host=0.0.0.0 --useLocalIp
            host: '0.0.0.0',
            useLocalIp: true,
            // 启用 host 设置后, 报错 Invalid Host header 的解决办法
            // https://github.com/webpack/webpack-dev-server/issues/882
            disableHostCheck: true,

            // Shows a full-screen overlay in the browser when there are compiler errors
            // 这样浏览器中就会出现错误信息了, 不然有时候构建出错了, 你还不知道
            overlay: true,

            // XXX The `setup` option is deprecated and will be removed in v3. Please update your config to use `before`
            setup: function(app) {
                // Mock Server 功能通过 mock-http-api 的模块来实现
                // 只需要在 mock/http 文件夹中放置 mock 配置即可
                mockHttpApi(app);
            }
        }
    };

    if (env.__mode__ == 'dev') { // 开发模式
        // 默认的 chunk id 是数字递增, 如果有添加或者删除, 就会造成 id 改变,
        // 通过命名来生成稳定的 chunk id
        // webpack 的概念: 将一个个 module(模块) 打包成 chunk(分块) 文件
        //
        // 注意: 开发时不要使用 chunkNameResolver, 因为使用后发现增量构建时有很高的机率造成构建过程卡死停滞,
        // 即 hang 住, 重现方法为: 直接快速的保存一个文件, 一般 5 分钟左右就会让构建卡死停滞
        webpackConfig.plugins.push(new webpack.NamedChunksPlugin());
        // 开发模式下使用 NamedModulesPlugin 标识出每个模块对应的文件, 便于调试
        webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
    } else { // 非开发模式
        webpackConfig.plugins.push(new webpack.NamedChunksPlugin(chunkNameResolver));
        // 开启 NoEmitOnErrorsPlugin 会在构建出错后就不继续构建任务了
        webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());
        // 默认的 module id 是数字递增, 如果发生模块的添加或者删除, 就会造成 id 改变,
        // 通过 hash 的方式生成稳定的 module id, 这样才能确保每次构建生成的文件 hash 也是稳定的
        webpackConfig.plugins.push(new webpack.HashedModuleIdsPlugin());
        // inline manifest chunk 到 HTML 中, 减少一个 JS 请求
        // 只在非开发模式下添加这个插件以减少构建时间
        webpackConfig.plugins.push(new InlineChunksHtmlWebpackPlugin({
            inlineChunks: ['manifest'],
            // 不要将这个 chunk 删除掉, 否则当存在多个 HtmlWebpackPlugin 时,
            // 会因为找不到这个 chunk 而报错的
            deleteFile: false
        }));
        webpackConfig.plugins.push(new webpack.optimize.UglifyJsPlugin(wpkConfig.uglifyJsPlugin));
    }

    // 是否部署
    if (env.__deploy__) {
        addDeployPlugin(webpackConfig, wpkConfig, env);
    }

    // 看看模块分析的结果
    // https://webpack.js.org/guides/code-splitting/#bundle-analysis
    // webpack --profile --json > stats.json
    return webpackConfig;
}

module.exports = getWebpackConfig;