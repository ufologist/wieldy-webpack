// 与环境相关的配置, 例如配置开发环境下的各个 URL
var env = {
    // 先是声明环境的类型, 例如: dev(开发环境)/test(测试环境)/stage(预上线环境)/prod(生产环境)
    // 再是该环境的具体配置, 称之为环境变量
    dev: {
        // 建议统一规范环境变量的属性名全小写, 单词以下划线隔开, 头尾添加两个下划线
        // 这样便于在代码中搜索出使用了环境变量的地方

        // 对应 webpack 配置项目 output.publicPath
        __public_path__: '/'
    },
    prod: {
        // 资源访问路径的基准路径
        // 如果配置了 __public_base_path__
        // 则会自动拼装 __public_path__ = __public_base_path__ + (__dir__ || pkg.name)
        // 如果同时配置 __public_path__, 则以 __public_path__ 为准
        // __public_base_path__: '',

        // ftp 的相关配置, 使用 deploy 功能时需要配置
        // __ftp_host__: '',
        // __ftp_port__: 0,
        // __ftp_user__: '',
        // __ftp_password__: '',

        // 上传到指定的 ftp 目录
        // __ftp_path__: '',

        // FTP 的基准目录
        // 如果配置了 __ftp_base_path__
        // 则会自动拼装 __ftp_path__ = __ftp_base_path__ + (__dir__ || pkg.name)
        // 如果同时配置 __ftp_path__, 则以 __ftp_path__ 为准
        // __ftp_base_path__: ''
    }
};

// console.log('__dirname 该文件所在的文件夹', __dirname);
// console.log('process.cwd() 当前工作目录', process.cwd());

module.exports = env;