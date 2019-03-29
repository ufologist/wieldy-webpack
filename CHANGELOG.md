# CHANGELOG

* v1.1.0 2019-3-29

  增加了入口页面的 `layout` 机制

* v1.0.6 2018-5-14

  解决开发阶段增量构建时老是出现卡死的情况

* v1.0.5 2018-3-8

  在 Mac 下发现 `wieldy-webpack` 跑不起来, 搜索得知 `bin/wieldy-webpack.js` 有行结束符兼容性问题, 需要由 `CRLF` 修改为 `LF`

* v1.0.4 2017-10-21

  只在非开发模式下使用 `image-webpack-loader` 和 `InlineChunksHtmlWebpackPlugin` 以减少开发时构建所需要的时间

* v1.0.3 2017-10-12

  升级 [mock-http-api](https://github.com/ufologist/mock-http-api) 模块到 `1.1.2` 版本, 现在支持 `proxy` 配置代理接口了

* v1.0.2 2017-9-28

  bin 忘记添加 `#!/usr/bin/env node` 了

* v1.0.1 2017-9-28

  统一封装 npm scripts 要执行的命令

* v1.0.0 2017-9-6

  初始版本