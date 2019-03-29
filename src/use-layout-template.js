var fs = require('fs');

var _ = require('lodash');

/**
 * 处理 layout 的模版页面
 * 
 * @param {object} templateParams
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.options
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.layoutFilePath
 * @param {string} templateParams.htmlWebpackPlugin.options.__layout__.templateFilePath
 */
module.exports = function(templateParams) {
    console.log('------使用 layout 机制------');
    console.log(JSON.stringify(templateParams.htmlWebpackPlugin.options.__layout__, null, 4));
    console.log('---------------------------');

    var layoutContent = fs.readFileSync(templateParams.htmlWebpackPlugin.options.__layout__.layoutFilePath, 'utf8');
    var templateContent = fs.readFileSync(templateParams.htmlWebpackPlugin.options.__layout__.templateFilePath, 'utf8');

    // 替换 layout 模版中的占位内容
    templateContent = layoutContent.replace(templateParams.htmlWebpackPlugin.options.__layout__.options.placeholder, templateContent);

    // 根据数据生成 HTML 页面的内容
    return _.template(templateContent)({
        htmlWebpackPlugin: templateParams.htmlWebpackPlugin
    });
};