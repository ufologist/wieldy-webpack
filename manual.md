# 内置功能使用手册

## 优选的默认配置

`wieldy-webpack` 构建配置文件: `wpk.js`, 配置的优先级: `./src/wpk.js > ./wpk.js > 默认的 wpk.js`

### 默认的配置项

* 构建输出的目录(`dist`)
* 资源文件的目录(`res`)
* 输出文件名的格式
* `@` alias 便于直接从 `src` 目录引用文件
* devtool

### 默认的 loader 处理

* 处理 js 文件
  * `babel-loader`
  * `es2015`
  * 默认配置(`wpk.js#babelLoader`)
* 处理 css 文件
  * `css-loader < postcss-loader`
  * `ExtractTextPlugin.extract` 提取样式内容为独立文件
  * 默认配置(`wpk.js#cssLoader` / `wpk.js#postcssLoader`)
* 处理 html 文件
  * `underscore-template-loader`
  * 用于处理 HTML 中依赖的资源, 例如图片
* 处理图片文件
  * `url-loader < image-webpack-loader`(优化图片)
  * 默认配置(`wpk.js#urlLoader` / `wpk.js#imageWebpackLoader`)
* 处理字体文件
  * `url-loader`
  * 默认配置(`wpk.js#urlLoader`)

### 默认的 Plugin

* `ExtractTextPlugin`
  * 配合提取 CSS 内容为文件
* `DefinePlugin`
  * 将环境变量都放到 `DefinePlugin` 中
  * 配合多环境构建
* 基于文件内容(生成稳定的 hash 签名)对文件进行重命名, 有助于实现静态资源长缓存和非覆盖式发布
  * `HashedModuleIdsPlugin`
  * `NamedChunksPlugin`
* `CommonsChunkPlugin`
  * 分离所有 npm 的包(JS/JSON 文件), 打包成一个第三方依赖包: `vendor`
  * 分离出 manifest chunk: `manifest`
* `UglifyJsPlugin`
  * 压缩 JS
  * 默认配置(`wpk.js#uglifyJsPlugin`)
* `InlineChunksHtmlWebpackPlugin`
  * 将 `manifest` chunk 嵌入到 HTML 中, 减少一个 JS 请求
* `CleanWebpackPlugin`
  * 删除上一次构建的文件
* `BannerPlugin`
  * 为文件生成统一的头注释
* `NoEmitOnErrorsPlugin`
  * 构建出错后终端构建任务

### 默认的 devServer 配置

* 可设置端口或者随机端口启动
* 启动时自动打开浏览器并通过 IP 地址来访问页面
* 通过 overlay 显示错误信息
* 扩展开启 mock server 功能

## 多环境构建

先讲一讲为什么需要支持多环境构建, 因为
* 页面往往需要在不同的环境下进行测试上线, 例如: 本地开发环境, 测试环境, 再到正式环境
* 某些配置与环境息息相关, 例如
  * 静态资源的根路径
  * 接口地址的根路径

如果不通过构建的方式来支持多环境, 一般我们会这样做
* 每次构建的时候修改代码中对应的环境配置
  * 纯手工操作, 极易遗漏
* 运行时判断域名(区分测试域名和正式域名)来决定使用哪一套环境配置
  * 例如: `if (domain.indexOf('xxxtest.com') != -1) { mode = 'test'; }`
  * 会暴露非正式环境的配置信息, 留下安全隐患

因此最好的方式还是在构建的过程中, 将环境相关的配置替换好

-----------------------

`wieldy-webpack` 采用环境配置文件: `env.js`, 集中管理所有与环境相关的配置信息, 需要导出一个包含了各个环境的配置信息, 其中最重要的就是**环境类型**和**环境变量**

配置的模式为:
```javascript
{
    '环境类型1': {
        '环境变量1': '变量值1.1',
        '环境变量2': '变量值1.2'
    },
    '环境类型2': {
        '环境变量1': '变量值2.1',
        '环境变量2': '变量值2.2'
    }
}
```

例如:

```javascript
// env.js
module.exports = {
    dev: {                 // 环境类型: 开发环境
        __foo_bar__: 'a1', // 环境的配置信息, 每一项称之为: 环境变量
        __foo_baz__: 'b1'
    },
    test: {                // 环境类型: 测试环境
        __foo_bar__: 'a2',
        __foo_baz__: 'b2'
    },
    prod: {                // 环境类型: 生产环境(正式环境)
        __foo_bar__: 'a3',
        __foo_baz__: 'b3'
    }
};
```

* 对象的属性名标识出**环境类型**
  * 例如这里的 `dev/test/prod`
  * 通过 `--env.__mode__` 参数在执行构建的时候指定使用哪个环境
    * 例如: `npm run build -- --env.__mode__=dev`
* 对象的值为环境的配置信息, 每一项属性称之为: **环境变量**
  * 建议统一规范环境变量的属性名全小写, 单词以下划线隔开, 头尾添加两个下划线
  * 该机制取自 [webpack Environment Options](https://webpack.js.org/api/cli/#environment-options)
  * 通过 `--env` 传入的所有参数将与 `env.js` 中的环境变量合并, 包括 `__mode__` 参数
    * 例如: `--env.__mode__=dev --env.__a__=1 --env.__b__=2`
  * 合并的优先级为: `--env > ./src/env.js > ./env.js`

-----------------------

**如何在代码中使用这些环境变量呢?** 例如, 配置了一个环境变量: `__api_root_endpoint__`

```javascript
dev: {
    __api_root_endpoint__: '//test.domain.com'
}
```

* 在 JS 代码中直接占位使用

  ```javascript
  var apiRootEndpoint = __api_root_endpoint__; 
  ```

  通过 [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) 实现
* 在 HTML 代码中输出环境变量

  环境变量的内容是作为字符串直接输出的
  ```html
  <p><%= htmlWebpackPlugin.options.env.__api_root_endpoint__ %></p>
  ```

  通过 [htmlWebpackPlugin.options](https://github.com/jantimon/html-webpack-plugin#writing-your-own-templates "The following variables are available in the template") 实现, 会在构建的时候将环境变量做为一个额外的配置项(`env`)附加到 `HtmlWebpackPlugin` 的 `options` 上

  注意: 在 HTML `<script>` 中获取环境变量

  ```html
  <script>
  // - 如果是 string 类型的值需要用引号引起来
  //   例如: var a = '<%= htmlWebpackPlugin.options.env.__public_path__ %>';
  //   否则得到的是 var a = //a.com/publicpath/;
  // - 如果是 object 类型的值需要用 JSON.stringify
  //   例如: var PAGE_DATA = <%= JSON.stringify(htmlWebpackPlugin.options.env.__page_data__) %>;
  //   否则得到的是 var PAGE_DATA = [object Object]
  var envPublicPath = '<%= htmlWebpackPlugin.options.env.__public_path__ %>';
  var PAGE_DATA = <%= htmlWebpackPlugin.options.env.__mode__ == 'dev' ? JSON.stringify(htmlWebpackPlugin.options.env.__page_data__) : htmlWebpackPlugin.options.env.__page_data__ %>;
  </script>
  ```

  通过灵活使用环境变量, 将每个 HTML 页面都需要的内容配置到环境变量中, 即可实现页面输出统一的头部内容和底部内容

  ```html
  <head>
      <meta charset="UTF-8">
      <title>示例页面</title>
      <%= htmlWebpackPlugin.options.env.__common_head__ %>
  </head>
  <body>
      <h1>示例页面</h1>
      <%= htmlWebpackPlugin.options.env.__common_body__ %>
  </body>
  ```