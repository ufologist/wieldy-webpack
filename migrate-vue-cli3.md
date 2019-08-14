# 迁移到 [`vue-cli-plugin-wieldy-webpack`](https://github.com/ufologist/vue-cli-plugin-wieldy-webpack)

> 适用于没有通过 `vue-cli3` 创建的项目

## 更新依赖

1. 删除 `wieldy-webpack` 依赖

   ```
   npm uninstall wieldy-webpack webpack webpack-dev-server --save-dev
   ```
2. 删除 `vue-loader` 依赖

   ```
   npm uninstall vue-loader --save-dev
   ```
3. 全局安装 vue-cli3

   ```
   npm install @vue/cli -g
   ```
4. 安装通过 vue-cli3 创建的项目所需的依赖

   ```
   npm install @vue/cli-plugin-babel @vue/cli-service vue-template-compiler --save-dev
   ```

   如果需要接入 `eslint`, 还需要安装以下依赖

   ```
   npm install @vue/cli-plugin-eslint babel-eslint eslint eslint-plugin-vue --save-dev
   ```
5. 安装 `vue-cli-plugin-wieldy-webpack` 插件

   ```
   vue add wieldy-webpack
   ```
6. 添加 `babel.config.js` 配置文件

   ```javascript
   module.exports = {
       presets: [
           '@vue/app'
       ]
   };
   ```

## 调整配置

* 调整 `npm scripts` 命令

  ```
  "serve": "vue-cli-service serve",
  "build": "vue-cli-service build",

  "start": "npm run serve",
  "build:dev": "npm run build -- --mode=development",
  "build:test": "npm run build -- --mode=test",
  "build:stage": "npm run build -- --mode=stage",
  "build:prod": "npm run build -- --mode=production",
  "inspect": "vue-cli-service inspect"
  ```
* 调整或者添加 `.browserslistrc` 配置浏览器兼容性

  ```
  iOS >= 6
  Android >= 4
  ```
* 调整或者添加 `postcss.config.js` 配置

  如果原来已经使用了 `autoprefixer` 插件, 可以去除其 `browsers` 选项, 统一使用 `.browserslistrc` 配置文件来控制

  例如
  ```javascript
  module.exports = {
      plugins: {
          autoprefixer: {}
      }
  }
  ```
* 迁移并删除 `wpk.js` 配置文件
* 迁移并删除 `webpack.config.js` 配置文件
* 在 `vue.config.js` 中配置 `pages` 注册入口和页面

## 迁移环境变量

将 `env.js` 迁移到 `.env` 方式