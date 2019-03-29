# wieldy-webpack

[![NPM version][npm-image]][npm-url] [![changelog][changelog-image]][changelog-url] [![license][license-image]][license-url]

[npm-image]: https://img.shields.io/npm/v/wieldy-webpack.svg?style=flat-square
[npm-url]: https://npmjs.org/package/wieldy-webpack
[license-image]: https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square
[license-url]: https://github.com/ufologist/wieldy-webpack/blob/master/LICENSE
[changelog-image]: https://img.shields.io/badge/CHANGE-LOG-blue.svg?style=flat-square
[changelog-url]: https://github.com/ufologist/wieldy-webpack/blob/master/CHANGELOG.md

![使用对比](https://github.com/ufologist/wieldy-webpack/blob/master/compare.png?raw=true)

易于使用的 `webpack`

> **将通用的 `webpack` 配置做为一个模块封装起来**
>
> * 封装繁琐的配置信息
> * 提供通用功能
> * 统一维护管理
> * 方便升级

## 为什么要易于使用?

* `webpack` 需要的配置项太多了
  * 并不是每个人都需要深入去了解
  * 通常只要知道如何配置入口就可以了
* 每个项目都存在着一些通用的 `webpack` 配置
  * `babel-loader`
  * `css-loader`
  * 等等
* 每个项目都在一遍又一遍地复制着 `webpack` 的配置文件
  * 脚手架工程
  * `webpack.base.conf.js`
  * `webpack.dev.conf.js`
  * `webpack.prod.conf.js`
  * `webpack.test.conf.js`
* 如果需要添加通用配置, 难道每个项目去修改一遍?
  * 为了优化性能, 统一添加一个 `image-webpack-loader` 怎么样?

## 怎样才能易于使用?

* 简而言之: **重复的逻辑就需要封装**
* 但绝不过度封装, 增加学习成本
* 仅封装配置, 完整的返回 `webpack` 的配置, 可以理解为返回了一份默认的 `webpack` 配置信息
* 可以对返回的 `webpack` 配置再做扩展以适用不同的项目, 例如支持 `vue`/`react`

## [内置功能](https://github.com/ufologist/wieldy-webpack/blob/master/manual.md)

* 优选的默认配置
* 多环境构建
* mock server(扩展了 webpack dev server)
* 随机端口启动开发服务器(webpack dev server)
* 组件化构建, 方便提取和使用组件, 不用关心组件依赖的资源和样式
* 支持多入口配置
* 入口页面支持 layout 机制
* 支持根据同一份源码, 生成多份不同的输出结果
  * 通过动态配置在 HTML 页面/JS 文件中注入参数来实现
* 支持上传构建后的静态资源到 CDN(ftp)

## 使用方法

### 安装

```
npm install webpack@3.x webpack-dev-server@2.x wieldy-webpack@1.x --save-dev
```

### 新建并配置 `webpack.config.js`

```javascript
var wieldyWebpack = require('wieldy-webpack');

module.exports = function(env) {
    return wieldyWebpack.createWebpackConfig(env = env ? env : {}).then(function(webpackConfig) {
        wieldyWebpack.createEntry('index/index.js', 'index.html', {
            env: env
        }).addToWebpackConfig(webpackConfig);

        return webpackConfig;
    });
};
```

## 使用示例

* [简单示例项目](https://github.com/ufologist/wieldy-webpack/tree/master/example/simple)
* [React 示例项目](https://github.com/ufologist/wieldy-webpack/tree/master/example/react)
* [Vue2 示例项目](https://github.com/ufologist/wieldy-webpack/tree/master/example/vue2)
* [多入口示例项目](https://github.com/ufologist/wieldy-webpack/tree/master/example/multiple-entry)
* [多项目示例项目](https://github.com/ufologist/wieldy-webpack/tree/master/example/multiple-project)

## API

* `wieldyWebpack.createWebpackConfig` 创建 webpack 配置
* `wieldyWebpack.createEntry` 创建 entry(包括 HTML 入口)

## 常见问题

* [FAQ](https://github.com/ufologist/wieldy-webpack/tree/master/FAQ.md)

## 其他实践

* [ElemeFE/cooking](https://github.com/ElemeFE/cooking)