// 覆盖 wieldy-webpack 默认的环境相关配置
// 详见: https://github.com/ufologist/wieldy-webpack/blob/master/src/config/env.js
var env = {
    dev: {
        __api_root_endpoint__: '',
        __page_data__: { // 一般用作后端给页面中灌入的首屏数据
            foo: 1,
            bar: 'bar'
        }
    },
    prod: {
        __api_root_endpoint__: '//api.domain.com',
        __page_data__: '!{pageData}', // 正式环境时直接使用模板页面中的变量, 例如 velocity 变量

        __public_base_path__: '//cdn.com/',

        __ftp_host__: 'ftp.cdn.com',
        __ftp_port__: 2121,
        __ftp_user__: 'test',
        __ftp_password__: 'test',
        __ftp_base_path__: '/project/'
    }
};

module.exports = env;