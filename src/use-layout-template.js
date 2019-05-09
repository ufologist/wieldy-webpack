/**
 * 处理 layout 的模版页面
 * 
 * @param {object} templateParams
 * @param {object} templateParams.htmlWebpackPlugin.options.__layout__.options
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.layoutContent
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.templateContent
 * @param {Function} templateParams.htmlWebpackPlugin.options.__layout__._template
 */
module.exports = function(templateParams) {
    var htmlWebpackPlugin = templateParams.htmlWebpackPlugin;
    var layout = htmlWebpackPlugin.options.__layout__;

    console.log('------使用 layout 机制------');
    console.log(JSON.stringify(layout, null, 4));
    console.log('---------------------------');

    // 以页面模版的内容替换掉 layout 内容中占位的内容
    var html = '';
    if (layout.templateContent) {
        html = layout.layoutContent.replace(layout.options.placeholder, layout.templateContent);
    } else {
        html = layout.layoutContent;
    }

    // 根据数据生成 HTML 页面的内容
    return layout._template(html)({
        htmlWebpackPlugin: htmlWebpackPlugin
    });
};