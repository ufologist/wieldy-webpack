var path = require('path');
var fs = require('fs');

var merge = require('merge');

/**
 * 合并 webpack 相关配置
 * 
 * [默认配置] <--覆盖-- [项目环境配置] <--覆盖-- [目录环境配置]
 * 
 * @param {object} env 环境配置
 * @return {object} 合并后的 webpack 相关配置
 */
function mergeWpkConfig(env) {
    // 默认配置
    var defaultWpkConfig = require('./config/wpk.js');

    // 项目全局配置
    var globalWpkFile = path.resolve(process.cwd(), 'wpk.js');
    var globalWpkConfig = fs.existsSync(globalWpkFile) ? require(globalWpkFile) : {};

    // 目录配置
    var dirWpkFile = path.resolve(process.cwd(), 'src', env.__dir__, 'wpk.js');
    var dirWpkConfig = fs.existsSync(dirWpkFile) ? require(dirWpkFile) : {};

    // 递归合并对象, 但不会合并数组
    var mergedWpkConfig = merge.recursive(true, defaultWpkConfig, globalWpkConfig, dirWpkConfig);

    mergedWpkConfig = adjustWpkConfig(env, mergedWpkConfig);

    console.info('------webpack 相关配置------');
    console.info(JSON.stringify(mergedWpkConfig, null, 4));
    console.info('---------------------------');

    return mergedWpkConfig;
}

/**
 * 根据环境配置, 调整 webpack 相关的配置
 */
function adjustWpkConfig(env, wpkConfig) {
    // 输出目录
    wpkConfig.output.path = path.resolve(wpkConfig.output.path, env.__dir__);

    // 开发模式下不使用 hash
    if (env.__mode__ == 'dev') {
        wpkConfig.output.jsFilename = '[name].js';
        wpkConfig.output.cssFilename = '[name].css';
        wpkConfig.output.resFilename = '[name].[ext]';

        wpkConfig.cssLoader.sourceMap = true;
        wpkConfig.cssLoader.minimize = false;

        wpkConfig.postcssLoader.sourceMap = true;
    } else {
        if (!wpkConfig.cssLoader.minimize) {
            wpkConfig.cssLoader.minimize = true;
        }

        // 除开开发模式, 其他模式都不使用 sourcemap
        wpkConfig.devtool = false;
    }

    return wpkConfig;
}

module.exports = mergeWpkConfig;