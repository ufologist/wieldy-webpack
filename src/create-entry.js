var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var merge = require('merge');

var HtmlWebpackPlugin = require('html-webpack-plugin');

/**
 * 入口配置
 * 
 * @param {object} entry webpack entry 配置
 * @param {HtmlWebpackPlugin} htmlPlugin HtmlWebpackPlugin 实例
 */
function Entry(entry, htmlPlugin) {
    this.entry = entry;
    this.htmlPlugin = htmlPlugin;
}
/**
 * 使用 layout 模版改写 HtmlWebpackPlugin 的 HTML 内容
 * 
 * 这样就能够使用一个全局的页面模版, 在全局页面模版中统一添加一些内容, 接入的页面只需要关心 body 这里的内容即可
 * 
 * 例如: layout.html
 * ```html
 * <!DOCTYPE html>
 * <html lang="en">
 * <head>
 *     <meta charset="UTF-8">
 *     <% if (htmlWebpackPlugin.options.env.__mode__ !== 'prod') { %>
 *     <script src="//unpkg.com/vconsole@3.3.0/dist/vconsole.min.js"></script>
 *     <script>window.vConsole = new VConsole();</script>
 *     <% } %>
 *     <% if (htmlWebpackPlugin.options.env.__head_start__) { %><%= htmlWebpackPlugin.options.env.__head_start__ %><% } %>
 *     <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0,user-scalable=no">
 *     <title><%= htmlWebpackPlugin.options.title %></title>
 *     <script>window.GLOBAL_DATA={};window.PAGE_DATA={};</script>
 *     <% if (htmlWebpackPlugin.options.env.__page_data__) { %>
 *     <script>PAGE_DATA = <%= htmlWebpackPlugin.options.env.__mode__ === 'dev' ? JSON.stringify(htmlWebpackPlugin.options.env.__page_data__) : htmlWebpackPlugin.options.env.__page_data__ %>;</script>
 *     <% } %>
 *     <% if (htmlWebpackPlugin.options.env.__head_end__) { %><%= htmlWebpackPlugin.options.env.__head_end__ %><% } %>
 * </head>
 * <body>
 * <% if (htmlWebpackPlugin.options.env.__body_start__) { %><%= htmlWebpackPlugin.options.env.__body_start__ %><% } %>
 * <!-- body -->
 * <% if (htmlWebpackPlugin.options.env.__body_end__) { %><%= htmlWebpackPlugin.options.env.__body_end__ %><% } %>
 * </body>
 * </html>
 * ```
 * 
 * index.html 只需要关注中间的内容即可
 * ```html
 * <div>index 页面</div>
 * ```
 * 
 * 注意: 
 * 1. 使用的是 HtmlWebpackPlugin.options.template js 机制
 *    https://github.com/jantimon/html-webpack-plugin/blob/master/migration.md#isomorph-apps
 *    PS: HtmlWebpackPlugin.options.templateContent 虽然文档中说去掉了, 但实际上还可以使用
 * 2. 不能在页面中使用 loader
 * 3. 页面修改了之后不能及时生效, 只能停掉构建后重新构建
 * 
 * @param {string} layoutFile
 * @param {object} options
 * @param {string} [options.isContent=false] 将 `layoutFile` 参数视作 layout 文件的内容
 * @param {string} [options.srcBase='src'] src 的根目录
 * @param {string|RegExp} [options.placeholder=/<!--\sbody\s-->[\s\S]*<!--\s\/body\s-->/] 要替换的占位文字
 * @param {object} [options.env] 页面的环境配置, 会与全局的 HtmlWebpackPlugin.options.env 做合并
 * @return {Entry} this
 */
Entry.prototype.useLayout = function(layoutFile, options) {
    options = Object.assign({
        isContent: false,
        srcBase: 'src',
        placeholder: /<!--\sbody\s-->[\s\S]*<!--\s\/body\s-->/
    }, options);

    // 合并环境变量
    this.htmlPlugin.options.env = merge.recursive(true, this.htmlPlugin.options.env, options.env);

    var layoutContent = '';
    var templateFile = this.htmlPlugin.options.template;
    var templateContent = '';

    // 获取 layout 的内容
    if (options.isContent) {
        layoutContent = layoutFile;
    } else {
        var layoutFilePath = '';
        if (path.isAbsolute(layoutFile)) {
            layoutFilePath = layoutFile;
        } else {
            layoutFilePath = path.resolve(options.srcBase, layoutFile);
        }

        try {
            layoutContent = fs.readFileSync(layoutFilePath, 'utf8');
        } catch (error) {
            console.error('read layout content fail', error.message);
            throw error;
        }
    }

    // 获取页面模版的内容
    try {
        if (templateFile) {
            templateContent = fs.readFileSync(templateFile, 'utf8');
        }
    } catch (error) {
        console.error('read template content fail', error.message);
        throw error;
    }

    this.htmlPlugin.options.__layout__ = {
        _template: _.template,
        options: options,
        layoutContent: layoutContent,
        templateContent: templateContent
    };

    // 开启 chunk-name-resolver.js 之后,
    // template 指向的 js 文件内不能导入其他模块,
    // 否则 calcChunkHash 时拿到的 m.context 为 null, m.request 为 'path'
    // 因此必须将逻辑封装在 useLayout 方法中
    this.htmlPlugin.options.template = __dirname + '/use-layout-template.js';

    // TODO
    // 如果要实现原来的模版页面更新之后就自动重新构建
    // 需要监听模版文件修改了之后, 触发 use-layout-template.js 修改(例如调整文件的时间)

    return this;
};
/**
 * 将入口配置合并到 webpackConfig 中
 * - entry
 * - htmlPlugin
 */
Entry.prototype.addToWebpackConfig = function(webpackConfig) {
    Object.assign(webpackConfig.entry, this.entry);
    webpackConfig.plugins.push(this.htmlPlugin);
};

/**
 * 创建入口配置
 * 
 * @param {string} entryJsFile 入口 JS 文件, 相对于 options.srcBase 的路径
 *                 生成入口的名字为入口 JS 文件去掉文件后缀
 *                 例如: index/index.js -> entryName 为: index/index
 * @param {string} entryHtmlFile 入口 HTML 文件
 * @param {object} options
 * @param {string} [options.title='title'] 页面的标题
 * @param {string} [options.srcBase='src'] src 的根目录
 * @param {object} options.env 环境配置, 用于在生成 HTML 页面时做环境的判断
 * @param {boolean} options.setChunks 是否设置 HtmlWebpackPlugin 需要包含的 chunks,
 *                                    当涉及到多个入口的时候, 才需要设置 setChunks 为 true,
 *                                    会将 chunks 配置为:
 *                                    ['manifest', 'vendor', '你的一个入口的 entryName']
 *                                    例如: ['manifest', 'vendor', 'index/index']
 * @return {Entry} 入口配置
 */
function createEntry(entryJsFile, entryHtmlFile, options) {
    options = Object.assign({
        srcBase: 'src',
        title: 'title'
    }, options);

    var srcBasePath = path.posix.resolve(options.srcBase);

    // 生成 webpack 的 entry 配置
    var entryJsPath = path.posix.resolve(options.srcBase, entryJsFile);
    var entry = {};
    // 获取相对于 src 根目录的路径名
    // 例如: src/index.js       -> index.js
    //       src/about/about.js -> about/about.js
    var entryName = path.posix.relative(srcBasePath, entryJsPath);
    // 去掉文件后缀名
    entryName = entryName.substring(0, entryName.lastIndexOf('.'));
    entry[entryName] = entryJsPath;

    // 生成 HtmlWebpackPlugin 的模版配置
    var entryHtmlPath = '';
    var htmlOutputPath = '';
    if (entryHtmlFile) {
        entryHtmlPath = path.posix.resolve(options.srcBase, entryHtmlFile);
        htmlOutputPath = path.posix.relative(srcBasePath, entryHtmlPath);
    } else { // 默认输出的 html 文件名为 entry 的名称, 例如 index/index -> index/index.html
        htmlOutputPath = entryName + '.html';
    }

    var htmlPluginOptions = {
        title: options.title,
        filename: htmlOutputPath,
        template: entryHtmlPath,
        chunksSortMode: 'dependency',
        // 将环境配置放到 HtmlWebpackPlugin 配置项中, 这样在 HTML 页面就可以拿到这些值了
        // 例如: <%= htmlWebpackPlugin.options.env.__dir__ %>
        env: options.env ? options.env : {}
    };
    // 如果涉及到多个页面, 需要指明每个页面依赖的 chunks
    if (options.setChunks) {
        htmlPluginOptions.chunks = ['manifest', 'vendor', entryName];
    }
    var htmlPlugin = new HtmlWebpackPlugin(htmlPluginOptions);

    return new Entry(entry, htmlPlugin);
}

module.exports = createEntry;