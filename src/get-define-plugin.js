var webpack = require('webpack');

/**
 * 将环境配置都放到 DefinePlugin 中, 方便在 JS 中使用
 */
function getDefinePlugin(env) {
    var definitions = {};
    for (var key in env) {
        definitions[key] = JSON.stringify(env[key]);
    }

    if (env.__mode__ != 'dev') {
        // 一般约定的优化
        definitions['process.env'] = {
            NODE_ENV: '"production"'
        }
    }

    return new webpack.DefinePlugin(definitions);
}

module.exports = getDefinePlugin;