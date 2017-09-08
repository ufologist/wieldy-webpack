var path = require('path');

var mockHttpApi = require('mock-http-api');

var webpack = require('webpack');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
// 提取出 webpack 的 runtime/manifest 的方式
// 1. 将整个 manifest chunk inline 到 HTML 中
//    需要先 split out the runtime code, 通过 CommonsChunkPlugin 将 manifest chunk 提取出来
//    new webpack.optimize.CommonsChunkPlugin({
//        name: 'manifest',
//        filename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename,
//        minChunks: Infinity
//    })
//    这样 manifest 会包含 webpackBootstrap 的代码, 但其中变的部分其实很少, 还有优化空间,
//    * inline-manifest-webpack-plugin
//      还需要在 HTML 中使用
//      <%= htmlWebpackPlugin.files.webpackManifest %> 来输出 manifest 分块的代码
//    * inline-chunks-html-webpack-plugin
//      直接找到需要 inline 的 chunk 的 HTML 标签, 然后替换掉标签的内容, 因此无需自己再指定输出
// 2. 将 chunk map inline 到 HTML 中
//    inline-chunk-manifest-html-webpack-plugin 将每个 chunk ID 和文件名映射起来提取出来,
//    然后修改 webpackBootstrap 直接使用这个映射, 这样就可以将 webpackBootstrap 模块合并到 vendor 去,
//    不需要单独提取出 manifest chunk 了.
//    new InlineChunkManifestHtmlWebpackPlugin({
//        dropAsset: true
//    })
//    得到的结果类似于
//    script.src = __webpack_require__.p + window["webpackManifest"][chunkId];
//    但是每次其他模块的代码, 竟然影响到了 vendor 的 hash?
//    因为 vendor 原本包含了 manifest 的内容, 代码修改 manifest 的内容肯定会变, chunk 的 hash 也就变了,
//    但是 InlineChunkManifestHtmlWebpackPlugin 替换了 vendor 文件的内容后, 没有重新计算 hash
//    因此前后生成的 vendor.js 文件的内容是一样的, 但是 hash 却不一样
//
//    注意 webpackBootstrap 代码可能会变化的地方
//    1. 当 chunk 数量变化时会造成 installedChunks 变化
//       以下途径会产生新的 chunk
//       * entry 定义的每一个入口
//       * 动态 import 或者 require.ensure 产生的异步分块
//       * CommonsChunkPlugin 提取的通用分块, 如果只提取了 vendor 分块,
//         就不会 installedChunks 的数量, 因为 vendor 作为初始分块, 不计入 installedChunks 中
//       var installedChunks = {
//           // 3 为 chunk 的总数
//           3: 0
//       };
//    2. 加载异步分块的方法中放置了每个分块对应的文件路径
//       __webpack_require__.e
//       // 分块文件 URL
//       script.src = __webpack_require__.p + "chunk/"
//                  // 分块ID与分块名称的映射: 分块ID 定义在 `webpackJsonp([2]`
//                  // 先通过 chunkId (分块ID是一个索引数字), 找出 chunk 的名称
//                  // 如果是动态 import 进来的分块, 没有对其命名的话, 就不会出现在这个映射中,
//                  // 则直接使用 chunkId 作为分块名称
//                  + ({"0":"abc","1":"ddd","2":"index"}[chunkId]||chunkId)
//                  // 分块ID与分块 hash 的映射
//                  + "-" + {"0":"2356817","1":"427f17d","2":"2daed49"}[chunkId] + ".js";
//    3. 所有静态资源的根路径
//       __webpack_require__.p = "//cdn.com/path/";
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
                use: [{
                    loader: 'url-loader',
                    options: {
                        limit: wpkConfig.urlLoader.limit,
                        name: wpkConfig.output.res + '/' + wpkConfig.output.resFilename
                    }
                }, {
                    loader: 'image-webpack-loader',
                    options: wpkConfig.imageWebpackLoader
                }]
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
            // 将所有 npm 的包(JS/JSON 文件)都打包成一个第三方依赖包
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
            // 从 vendor chunk 中提取出 manifest chunk
            new webpack.optimize.CommonsChunkPlugin({
                name: 'manifest',
                chunks: ['vendor'],
                minChunks: Infinity,
                filename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename,
            }),
            // inline manifest chunk 到 HTML 中, 减少一个 JS 请求
            new InlineChunksHtmlWebpackPlugin({
                inlineChunks: ['manifest'],
                // 不要将这个 chunk 删除掉, 否则当存在多个 HtmlWebpackPlugin 时,
                // 会因为找不到这个 chunk 而报错的
                deleteFile: false
            }),
            // 默认的 chunk id 是数字递增, 如果有添加或者删除, 就会造成 id 改变,
            // 通过命名来生成稳定的 chunk id
            // webpack 的概念: 将一个个 module(模块) 打包成 chunk(分块) 文件
            new webpack.NamedChunksPlugin(chunkNameResolver)
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
            // 但这样设置后自动 open 浏览器打开的是 http://0.0.0.0:8080/ 无法访问
            // host: '0.0.0.0',

            // 启用 host 设置后, 报错 Invalid Host header 的解决办法
            // https://github.com/webpack/webpack-dev-server/issues/882
            disableHostCheck: true,
            // Shows a full-screen overlay in the browser when there are compiler errors
            // 这样浏览器中就会出现错误信息了, 不然有时候构建出错了, 你还不知道
            overlay: true,

            setup: function(app) {
                // Mock Server 功能通过 mock-http-api 的模块来实现
                // 只需要在 mock/http 文件夹中放置 mock 配置即可
                mockHttpApi(app);
            }
        }
    };

    if (env.__mode__ == 'dev') { // 开发模式
        // 开发模式下使用 NamedModulesPlugin 标识出每个模块对应的文件, 便于调试
        webpackConfig.plugins.push(new webpack.NamedModulesPlugin());
    } else { // 非开发模式
        // 开启 NoEmitOnErrorsPlugin 会在构建出错后就不继续构建任务了
        webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());
        // 默认的 module id 是数字递增, 如果发生模块的添加或者删除, 就会造成 id 改变,
        // 通过 hash 的方式生成稳定的 module id, 这样才能确保每次构建生成的文件 hash 也是稳定的
        webpackConfig.plugins.push(new webpack.HashedModuleIdsPlugin());
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