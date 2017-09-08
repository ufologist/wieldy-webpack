// 覆盖 wieldy-webpack 默认的环境相关配置
// 详见: https://github.com/ufologist/wieldy-webpack/blob/master/src/config/env.js
var env = {
    dev: {
        __api_root_endpoint__: ''
    },
    prod: {
        __cdn_root_path__: '//cdn.com/',

        __ftp_host__: 'ftp.cdn.com',
        __ftp_port__: 2121,
        __ftp_user__: 'test',
        __ftp_password__: 'test',
        __ftp_root_path__: '/project/',

        __api_root_endpoint__: '//api.domain.com'
    }
};

module.exports = env;