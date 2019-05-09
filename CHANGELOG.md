# CHANGELOG

* v1.4.1 2019-5-9

  * fixbug: 开启 `chunk-name-resolver.js` 之后, template 指向的 js 文件内不能导入其他模块, 否则 `calcChunkHash` 时拿到的 `m.context` 为 null, `m.request` 为 'path', 因此必须将逻辑封装由 `use-layout-template.js` 转到 `useLayout` 方法中

* v1.4.0 2019-5-5

  * 优化 `wpk.js` 的配置方式, 支持导出方法传入 `env` 环境变量, 这样便于根据不同的环境来生成不同的配置

* v1.3.0 2019-4-30

  * 优化替换 `layout` 内容的逻辑: 当没有模版内容时不执行替换
  * 优化 `layout` 的默认参数 `options.placeholder` 为正则表达式, 支持内置默认的内容

* v1.2.0 2019-4-27

  * `layout` 机制增加 `env` 参数, 便于每个页面做个性化设置
  * 使用 `layout` 机制时创建 entry 可以不指定入口的 html 文件, 即: `wieldyWebpack.createEntry('login/login.js', '')`

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