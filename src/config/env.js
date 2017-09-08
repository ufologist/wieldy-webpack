// 与环境相关的配置, 例如配置开发环境下的各个 URL
var env = {
    // 先是声明环境的类型, 例如: dev/test/stage/prod
    // 再是该环境的具体配置
    // 统一规范属性名全小写, 单词以下划线隔开, 头尾添加两个下划线, 便于查找定位,
    // 建议不要嵌套对象, 这样便于在 JS 中替换使用
    // 例如: var apiRootEndpoint = __api_root_endpoint__;
    dev: {
        // 对应 webpack 配置项目 output.publicPath
        __public_path__: '/'
    },
    prod: {
        // 如果配置了 __cdn_root_path__
        // 则会自动拼装 __public_path__ = __cdn_root_path__ + (__dir__ || pkg.name)
        // 如果同时配置 __public_path__, 则以 __public_path__ 为准
        // __cdn_root_path__: '',

        // ftp 的相关配置, 使用 deploy 功能时需要配置
        // __ftp_host__: '',
        // __ftp_port__: 0,
        // __ftp_user__: '',
        // __ftp_password__: '',

        // 上传到指定的 ftp 目录
        // __ftp_path__: '',

        // 如果配置了 __ftp_root_path__
        // 则会自动拼装 __ftp_path__ = __ftp_root_path__ + (__dir__ || pkg.name)
        // 如果同时配置 __ftp_path__, 则以 __ftp_path__ 为准
        // __ftp_root_path__: ''
    }
};

// console.log('__dirname 该文件所在的文件夹', __dirname);
// console.log('process.cwd() 当前工作目录', process.cwd());

module.exports = env;