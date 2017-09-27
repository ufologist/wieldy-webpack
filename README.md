# wieldy-webpack

[![NPM version][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/wieldy-webpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/wieldy-webpack
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/ufologist/wieldy-webpack/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/wieldy-webpack/blob/master/CHANGELOG.md

易于使用的 webpack

## 功能

* 组件化构建, 方便提取和使用组件, 不用关心组件依赖的资源和样式
* 基于文件内容(生成稳定的 hash 签名)对文件进行重命名, 实现静态资源长缓存和非覆盖式发布
* 支持多环境配置
* 支持多入口配置
* 支持 mock server
* 支持根据同一份源码, 生成多份不同的输出结果
  * 通过动态配置在 HTML 页面/JS 文件中注入参数来实现
* 支持上传构建后的静态资源到 CDN(ftp)