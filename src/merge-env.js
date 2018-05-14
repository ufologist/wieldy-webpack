var path = require('path');
var fs = require('fs');

var merge = require('merge');

var util = require('./util.js');
var pkg = require(process.cwd() + '/package.json');

/**
 * 合并环境配置
 * 
 * [默认配置] <--覆盖-- [项目环境配置] <--覆盖-- [目录环境配置] <--覆盖-- [webpack 传入的环境配置]
 * 
 * @param {object} env webpack 传入的环境配置数据
 * @return {object} 合并后的环境配置
 */
function mergeEnv(env) {
    if (!env.__mode__) { // 默认为正式(生产)环境
        env.__mode__ = 'prod';
    }

    if (!env.__dir__) {
        env.__dir__ = '';
    }

    // 默认环境配置
    var defaultEnvConfig = require('./config/env.js');

    // If after processing all given path segments an absolute path has not yet been generated,
    // the Current Working Directory is used.
    // 所以以下方式是等效的
    // path.resolve('env.js');
    // path.resolve('./env.js');
    // path.resolve(process.cwd(), 'env.js');
    // 项目全局环境配置
    var globalEnvFile = path.resolve(process.cwd(), 'env.js');
    var globalEnvConfig = fs.existsSync(globalEnvFile) ? require(globalEnvFile) : {};

    // 目录环境配置
    var dirEnvFile = path.resolve(process.cwd(), 'src', env.__dir__, 'env.js');
    var dirEnvConfig = fs.existsSync(dirEnvFile) ? require(dirEnvFile) : {};

    // 递归合并对象, 但不会合并数组
    var mergedEnv = merge.recursive(defaultEnvConfig[env.__mode__], globalEnvConfig[env.__mode__], dirEnvConfig[env.__mode__], env);

    mergedEnv = proccessPublicPath(mergedEnv);

    console.info('----------环境配置----------');
    console.info(JSON.stringify(mergedEnv, null, 4));
    console.info('---------------------------');

    // 将环境配置再放回 env 对象
    Object.assign(env, mergedEnv);
    return env;
}

/**
 * 处理 __public_path__ 的配置
 * 
 * 一般我们只需要配置 __public_base_path__, 会再拼接 __dir__ 或者 pkg.name 来生成 __public_path__,
 * 但我们也可以强制设置 __public_path__ 来直接决定 publicPath 的配置
 * 
 * @param {object} env 
 * @return {object} env
 */
function proccessPublicPath(env) {
    if (!env.__public_path__ && env.__public_base_path__) {
        env.__public_base_path__ = util.endsWithForwardSlash(env.__public_base_path__);
        env.__public_path__ = env.__public_base_path__ + (env.__dir__ || pkg.name);
    }

    if (!env.__public_path__) {
        env.__public_path__ = '/';
    } else {
        env.__public_path__ = util.endsWithForwardSlash(env.__public_path__);
    }

    return env;
}

module.exports = mergeEnv;