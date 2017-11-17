# CHANGELOG

* v1.0.4 2017-10-21

  只在非开发模式下使用 `image-webpack-loader` 和 `InlineChunksHtmlWebpackPlugin` 以减少开发时构建所需要的时间

* v1.0.3 2017-10-12

  升级 [mock-http-api](https://github.com/ufologist/mock-http-api) 模块到 `1.1.2` 版本, 现在支持 `proxy` 配置代理接口了

* v1.0.2 2017-9-28

  bin 忘记添加 `#!/usr/bin/env node` 了

* v1.0.1 2017-9-28

  统一封装 npm scripts 要执行的命令

* v1.0.0 2017-9-6

  TODO 初始版本, 实现了前端可以解析后端模版页面, 前端可以查看页面渲染的效果

  * 1
  * 2

TODO
https://github.com/appbone/webpack-driven-web/blob/master/FAQ.md#什么时候支持-webpack-2x

TODO
在使用 webpack-dev-server 的时候, 有时候会在构建的时候卡住, 在改动 css 的时候好像会出现
Compilation hangs
webpack Compilation hang css

Compilation Hang
https://stackoverflow.com/questions/26708205/webpack-watch-isnt-compiling-changed-files
No files are written to disk, it handle the files in memory
https://github.com/gajus/write-file-webpack-plugin

process.env.UV_THREADPOOL_SIZE=100

cache: false.