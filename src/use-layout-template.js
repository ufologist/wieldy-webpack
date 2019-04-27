var path = require('path');
var fs = require('fs');

var _ = require('lodash');
var merge = require('merge');

/**
 * 处理 layout 的模版页面
 * 
 * @param {object} templateParams
 * @param {object} templateParams.htmlWebpackPlugin.options.__layout__.options
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.layoutFile
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.templateFile
 */
module.exports = function(templateParams) {
    var htmlWebpackPlugin = templateParams.htmlWebpackPlugin;
    var layout = htmlWebpackPlugin.options.__layout__;

    console.log('------使用 layout 机制------');
    console.log(JSON.stringify(layout, null, 4));
    console.log('---------------------------');

    var layoutContent = '';
    var templateContent = '';
    var html = '';

    // 获取 layout 的内容
    if (layout.options.isContent) {
        layoutContent = layout.layoutFile;
    } else {
        var layoutFilePath = '';
        if (path.isAbsolute(layout.layoutFile)) {
            layoutFilePath = layout.layoutFile;
        } else {
            layoutFilePath = path.resolve(layout.options.srcBase, layout.layoutFile);
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
        templateContent = fs.readFileSync(layout.templateFile, 'utf8');
    } catch (error) {
        console.error('read template content fail', error.message);
        throw error;
    }

    // 以页面模版的内容替换掉 layout 内容中占位的内容
    html = layoutContent.replace(layout.options.placeholder, templateContent);
    // 合并环境变量
    htmlWebpackPlugin.options.env = merge.recursive(true, htmlWebpackPlugin.options.env, layout.options.env);
    // 根据数据生成 HTML 页面的内容
    return _.template(html)({
        htmlWebpackPlugin: htmlWebpackPlugin
    });
};