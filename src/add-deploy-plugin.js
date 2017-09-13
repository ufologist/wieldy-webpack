var DeployPlugin = require('deploy-kit/plugins/ftp-webpack-plugin');

var util = require('./util.js');
var pkg = require(process.cwd() + '/package.json');

/**
 * 增加部署用的插件
 * 
 * @param {object} webpackConfig
 * @param {object} wpkConfig
 * @param {object} env
 */
function addDeployPlugin(webpackConfig, wpkConfig, env) {
    env = proccessFtpPath(env);

    webpackConfig.plugins.push(new DeployPlugin({
        server: `${env.__ftp_user__}:${env.__ftp_password__}@${env.__ftp_host__}:${env.__ftp_port__}`,
        workspace: wpkConfig.output.path,
        deployTo: env.__ftp_path__
    }));
}

/**
 * 处理 __ftp_path__ 的配置
 * 
 * 一般我们只需要配置 __ftp_base_path__, 会根据 __dir__ 或者 pkg.name 来生成 __ftp_path__,
 * 但我们也可以强制设置 __ftp_path__ 来直接决定上传的目录
 * 
 * @param {object} env
 * @return {object} env
 */
function proccessFtpPath(env) {
    if (!env.__ftp_path__ && env.__ftp_base_path__) {
        env.__ftp_base_path__ = util.endsWithForwardSlash(env.__ftp_base_path__);
        env.__ftp_path__ = env.__ftp_base_path__ + (env.__dir__ || pkg.name);
    }

    if (env.__ftp_path__) {
        env.__ftp_path__ = util.endsWithForwardSlash(env.__ftp_path__);
    }

    return env;
}

module.exports = addDeployPlugin;