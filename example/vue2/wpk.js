// 覆盖 wieldy-webpack 默认的 webpack 配置
// 详见: https://github.com/ufologist/wieldy-webpack/blob/master/src/config/wpk.js
var postcssConfig = require('./postcss.config.js');

var config = {
    postcssLoader: {
        plugins: postcssConfig.plugins
    }
};

module.exports = config;