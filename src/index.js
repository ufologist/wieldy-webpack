var getPort = require('get-port');

var pkg = require('../package.json');
var getWebpackConfig = require('./get-webpack-config.js');
var createEntry = require('./create-entry.js');

/**
 * 创建 webpack 配置
 * 
 * 环境配置项
 * ---------
 * env.__mode__   构建的模式, 例如 dev/prod, 默认为 prod 模式, 与各种环境配置息息相关
 * env.__port__   开发服务器启动的端口, 如果不指定, 则会使用随机端口号
 * env.__deploy__ 是否部署到服务器, 例如通过 ftp 上传构建后的静态资源文件
 * env.__dir__    需要构建的文件夹, 可以指定 src 目录下的一个文件夹
 *                (适用于 src 中一个目录对应一个独立页面项目的情况)
 *                例如: src/project-a
 *                      src/project-b
 *                src 下面每个项目都是独立的, 互补相关的项目, 例如活动页面项目
 * 
 * @param {object} env webpack 传入的环境配置 https://webpack.js.org/configuration/configuration-types/#exporting-a-function-to-use-env
 * @return {Promise} webpack 的配置
 */
function createWebpackConfig(env) {
    return new Promise(function(resolve, reject) {
        if (env.__port__) { // 指定端口号
            process.title = process.cwd() + ' ' + env.__port__ + ' v' + pkg.version;
            resolve(getWebpackConfig(env));
        } else { // 随机端口号
            getPort().then(function(port) {
                env.__port__ = port;
                process.title = process.cwd() + ' ' + env.__port__ + ' v' + pkg.version;

                resolve(getWebpackConfig(env));
            });
        }
    });
}

module.exports = {
    createWebpackConfig: createWebpackConfig,
    createEntry: createEntry
};