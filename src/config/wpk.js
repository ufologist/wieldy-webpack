// webpack 配置
var config = {
    output: { // 构建输出的目录和文件名规则
        path: 'dist',   // 构建输出的目录, 对应 webpack 配置的 output.path
        chunk: 'chunk', // 模块目录(基于 output.path)
        res: 'res',     // 资源文件目录(基于 output.path)
        jsFilename: '[name]-[chunkhash:7].js',
        cssFilename: '[name]-[contenthash:7].css',
        resFilename: '[name]-[hash:7].[ext]'
    },

    devtool: 'source-map',

    // Loader/Plugin 的配置
    babelLoader: {
        presets: [
            ['es2015', {
                modules: false
            }]
        ],
        plugins: [
            'syntax-dynamic-import' // 让 babel-loader 支持 import() 语法
        ]
    },
    cssLoader: {
        // configure how many loaders before css-loader should be applied to @import ed resources.
        // 0 => no loaders (default)
        // https://github.com/webpack-contrib/css-loader#importloaders
        // 让通过 @import 方式导入的 css 文件使用 loader 来处理, 例如 postcss autoprefixer
        // 如果不使用这个配置会导致以 @import 方式导入的 css 文件不会经过 loader 的处理
        // 也就是说 @import 进来的 css 文件不会被 postcss-loader 处理了
        importLoaders: 1
    },
    // 如果觉得原生 CSS 语法太弱, 还是怀恋 LESS/SASS 之类的预处理器
    // 可以自己添加 less-loader 或者 sass-loader 来处理 less/scss 文件
    postcssLoader: {
        // 使用了 cssLoader 的 importLoaders 配置后, 会导致报错: No PostCSS Config found
        // https://github.com/postcss/postcss-loader/issues/204
        // http://www.imooc.com/qadetail/198677
        // 不给 css-loader 加参数 importLoaders=1 是能够正常打包的,
        // 但是对于包含 @import 方式的 css 就不能进行前缀等转换了
        ident: 'postcss',
        plugins: [
            // PS: 试过 https://github.com/ElemeFE/postcss-salad
            //          https://github.com/jonathantneal/precss
            //          https://github.com/MoOx/postcss-cssnext
            // 都没有 less/sass 好用
            require('autoprefixer')({
                // add: true,
                // remove: true,
                // https://github.com/ai/browserslist#queries
                browsers: ['iOS >= 6', 'Android >= 4']
            })
        ]
    },
    urlLoader: {
        limit: 8 * 1024
    },
    imageWebpackLoader: {
        optipng: {
            optimizationLevel: 7
        },
        gifsicle: {
            interlaced: false
        },
        pngquant: {
            quality: '75-90',
            speed: 4
        },
        mozjpeg: {
            quality: 75
        }
    },
    uglifyJsPlugin: {
        compress: {
            warnings: false,
            drop_console: true
        }
    }
};

module.exports = config;