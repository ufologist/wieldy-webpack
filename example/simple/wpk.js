// 覆盖 wieldy-webpack 默认的 webpack 配置
// 详见: https://github.com/ufologist/wieldy-webpack/blob/master/src/config/wpk.js
var config = {
    postcssLoader: {
        plugins: [
            require('autoprefixer')({
                browsers: ['ie >= 8', 'iOS >= 6', 'Android >= 4'],
            })
        ]
    }
};

module.exports = config;