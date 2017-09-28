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
        // 一般约定俗成的打包优化, 设置环境变量为 production 模式
        // 例如 vue-loader 会判断 NODE_ENV 在非 production 模式下, 处理过的文件会带有供调试的信息,
        // options.__file="sr/lib/hello-component/hello-component.vue"
        // 再例如 react 的 https://facebook.github.io/react/docs/optimizing-performance.html#webpack
        process.env.NODE_ENV = 'production';
        definitions['process.env'] = {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV)
        }
    }

    return new webpack.DefinePlugin(definitions);
}

module.exports = getDefinePlugin;