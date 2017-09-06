var path = require('path').posix;

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
 * @param {string} options.srcBase src 的根目录, 默认为 src 目录
 * @param {object} options.env 环境配置
 * @param {boolean} options.setChunks 是否设置 HtmlWebpackPlugin 需要包含的 chunks,
 *                                    当涉及到多个入口的时候, 才需要设置 setChunks 为 true,
 *                                    会将 chunks 配置为:
 *                                    ['manifest', 'vendor', '你的一个入口的 entryName']
 *                                    例如: ['manifest', 'vendor', 'index/index']
 * @return {Entry} 入口配置
 */
function createEntry(entryJsFile, entryHtmlFile, options) {
    options = Object.assign({
        srcBase: 'src'
    }, options);

    var srcBasePath = path.resolve(options.srcBase);
    var entryJsPath = path.resolve(options.srcBase, entryJsFile);
    var entryHtmlPath = path.resolve(options.srcBase, entryHtmlFile);

    var entry = {};
    // 获取相对于 src 根目录的路径名
    // 例如: src/index.js       -> index.js
    //       src/about/about.js -> about/about.js
    var entryName = path.relative(srcBasePath, entryJsPath);
    // 去掉文件后缀名
    entryName = entryName.substring(0, entryName.lastIndexOf('.'));
    entry[entryName] = entryJsPath;

    var htmlOutputPath = path.relative(srcBasePath, entryHtmlPath);
    var htmlPluginOptions = {
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