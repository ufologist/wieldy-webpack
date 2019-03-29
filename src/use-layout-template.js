var path = require('path');
var fs = require('fs');

var _ = require('lodash');

/**
 * 处理 layout 的模版页面
 * 
 * @param {object} templateParams
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.options
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.layoutFile
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.templateFile
 */
module.exports = function(templateParams) {
    var layout = templateParams.htmlWebpackPlugin.options.__layout__;

    console.log('------使用 layout 机制------');
    console.log(JSON.stringify(layout, null, 4));
    console.log('---------------------------');

    var layoutContent = '';
    if (layout.options.isContent) {
        layoutContent = layout.layoutFile;
    } else {
        var layoutFilePath = '';
        if (path.isAbsolute(layout.layoutFile)) {
            layoutFilePath = layout.layoutFile;
        } else {
            layoutFilePath = path.resolve(layout.options.srcBase, layout.layoutFile);
        }

        layoutContent = fs.readFileSync(layoutFilePath, 'utf8');
    }

    var templateContent = fs.readFileSync(layout.templateFile, 'utf8');
    // 替换 layout 模版中的占位内容
    templateContent = layoutContent.replace(layout.options.placeholder, templateContent);

    // 根据数据生成 HTML 页面的内容
    return _.template(templateContent)({
        htmlWebpackPlugin: templateParams.htmlWebpackPlugin
    });
};