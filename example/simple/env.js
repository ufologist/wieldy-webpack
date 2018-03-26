// 覆盖 wieldy-webpack 默认的环境相关配置
// 详见: https://github.com/ufologist/wieldy-webpack/blob/master/src/config/env.js

var metaViewport = '<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">';

var vConsole = `
<script src="//wechatfe.github.io/vconsole/lib/vconsole.min.js?v=3.0.0.0"></script>
<script>window.vConsole = new VConsole();</script>
`;

var env = {
    dev: { // 开发环境
        __api_root_endpoint__: '',
        // 用于在页面 <head> 中统一注入资源, 例如统计和调试用的脚本
        __common_head__: metaViewport + vConsole,
        // 用于在页面 <body> 中统一注入资源, 例如初始化的 Loading 提示
        __common_body__: '',

        __page_data__: { // 一般用作后端给页面中灌入的首屏数据
            foo: 1,
            bar: 'bar'
        }
    },
    test: { // 测试环境
        __api_root_endpoint__: '',
        __common_head__: metaViewport + vConsole,
        __common_body__: '',

        __public_base_path__: '//test.cdn.com/',

        __page_data__: '!{pageData}'
    },
    prod: { // 正式环境
        __api_root_endpoint__: '', // 正式环境可能指向网关, 例如: //api.domain.com
        __common_head__: metaViewport,
        __common_body__: '',
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