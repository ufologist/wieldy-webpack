# FAQ

## 如何在 CSS 文件中导入 npm 模块(node_modules 文件夹)中的文件?

关键点: 在模块名之前添加一个 `~` 符号来表明是要导入 npm 模块中的资源

格式为: `~npm模块名/path/to/file`

例如

```css
/* 导入 npm 模块 normalize.css 中的 css 文件 */
@import url(~normalize.css/normalize.css);

.test-npm-res {
    /* 引用 npm 模块 ionicons 中的文件 */
    background-image: url(~ionicons/dist/svg/ios-partly-sunny-outline.svg);
}
```

* [webpack-contrib/css-loader](https://github.com/webpack-contrib/css-loader#url)

  > `url(~module/image.png) => require('module/image.png')`

* [@import rules in css doesn't look in node_modules folder](https://github.com/webpack-contrib/css-loader/issues/12)

  > css `@import` is relative to the current directory. For resolving "like a module" you can prefix ~.

* [Resolving module path when @import](https://github.com/webpack-contrib/css-loader/issues/117)

  > as by default webpack interprets `@improt` within CSS as local imports because that's how CSS works.

* [Loading Styles from node_modules Directory](https://survivejs.com/webpack/styling/loading/#loading-from-node_modules-directory)

  > The tilde character (~) tells webpack that it's not a relative import as by default. If tilde is included, it performs a lookup against node_modules

## 如何在 HTML 文件中导入 npm 模块(node_modules 文件夹)中的文件?

方式与在 CSS 文件中导入 npm 模块中的文件一致.

例如

```html
<img src="~ionicons/dist/svg/ios-sunny.svg" width="50" height="50">
```

## 如果在 JS 文件中导入 npm 模块(node_modules 文件夹)中的文件?

关键点: 导入时以模块的名字开头

格式为: `模块名/path/to/file`

例如

```js
// 导入 npm 模块 ionicons 中的文件
import svg from 'ionicons/dist/svg/ios-sunny-outline.svg';
```

## 如何将第三方的 CSS 抽离出来作为一个独立的 CSS 文件: vendor.css?

一般 CSS 文件的依赖我们会放在 CSS 中来管理, 例如我们会在 CSS 文件中导入第三方的 CSS 文件

```css
@import url(~normalize.css);

.body--index {
    background-color: #eee;
}
```

这样做的好处就是上层使用者不需要关心下层的依赖关系, 但这种方式无法将第三方的 CSS 抽离出来.

打包的结果可想而知, 只会产生一个包含了所有样式的 CSS 文件, 任何样式的修改, 都会导致这个文件变化, 不利于缓存.

因此我们想把第三方的 CSS 抽离出来, 形成一个 `vendor.css`, 这个文件是相对稳定的, 因此可以更好的利用缓存.

关键点:

* **不要**在 CSS 文件中通过 `@import` 方式来导入第三方的 CSS 依赖
* 在 JS 文件中通过 `import` 方式来导入第三方的 CSS 依赖
* 修改提取出 `vendor` 的 `CommonsChunkPlugin` 来支持自动打包第三方的 CSS 依赖
  
  `/\.(js|json|css)$/.test(module.resource)`

例如

```css
/* index.css */
/*@import url(~normalize.css);*/

.body--index {
    background-color: #eee;
}
```

```javascript
// index.js
import 'normalize.css';
import './index.css';
```

* [Split vendor css into its own file](https://github.com/vuejs-templates/webpack/issues/598)

## 如何支持 `less` 文件?

* 安装依赖

  `npm install less-loader less`
* 配置 `less-loader`

  ```javascript
  // 找出内置的 css 文件关联的 loader, 然后添加上 less-loader 来处理 less 文件
  var cssRule = webpackConfig.module.rules.filter(function(rule) {
      return rule.test.test('.css');
  })[0];
  var lessLoader = cssRule.use.slice();
  lessLoader.push({
      loader: 'less-loader'
  });

  // 添加 less-loader 配置
  webpackConfig.module.rules.push({
      test: /\.less$/,
      use: lessLoader
  });
  ```
* 使用 `less`

  ```less
  // 注意导入 less 不需要使用 url() 这样的语法
  @import "./hello.less";
  ```

注意:

`vue-loader` 虽然默认支持处理 `less` 文件, 但如果在 `less` 中 `@import` 了 css 文件, 就需要自己配置一下 `less`, 将 `css-loader` 的 `importLoaders` 配置为 `1`, 否则通过 `@import` 导入的 css 不会经过 `postcss` 的处理

例如

```javascript
// 找出内置的 css 文件关联的 rule
var cssRule = webpackConfig.module.rules.filter(function(rule) {
    return rule.test.test('.css');
})[0];
// 找出内置的 css-loader, 这样便于共用配置
var cssLoader = cssRule.use.filter(function(loader) {
    return loader.loader == 'css-loader';
})[0];

// 为了样式支持 HMR, 在开发环境下只使用 style-loader
// XXX 目前发现 async import 即动态导入的模块 HMR 没有生效,
// 即开启 HMR 的时候, 修改 async-component.vue 确实会重载模块, 但界面上没有效果
var vueCssLoader = env.__mode__ == 'dev' ? [{
    loader: 'vue-style-loader'
}, cssLoader] : ExtractTextPlugin.extract({
    fallback: 'vue-style-loader',
    use: [cssLoader]
});
var vueLessLoader = vueCssLoader.slice();
vueLessLoader.push({
    loader: 'less-loader'
});

// vue-loader 配置
options: {
    loaders: {
        css: vueCssLoader,
        less: vueLessLoader
    }
}
```

PS: 支持 `SASS` 的方式类似, 只是需要安装的依赖是 `sass-loader node-sass`, 然后将上面 `less-loader` 的地方都改成 `sass-loader` 即可

## 提取出 webpack 的 runtime/manifest 的方式

* 方式一: 将整个 manifest chunk inline 到入口的 HTML 文件中

  需要先 split out the runtime code, 通过 `CommonsChunkPlugin` 将 manifest chunk 提取出来

  ```javascript
  new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      filename: wpkConfig.output.chunk + '/' + wpkConfig.output.jsFilename,
      minChunks: Infinity
  })
  ```

  这样 manifest 会包含 `webpackBootstrap` 的代码, 但其中变的部分其实很少, 还有优化空间, 再使用如下插件之一将 manifest inline 到入口的 HTML 文件中
  * `inline-manifest-webpack-plugin`

    还需要在 HTML 中使用 `<%= htmlWebpackPlugin.files.webpackManifest %>` 来明确输出 manifest 分块的内容
  * `inline-chunks-html-webpack-plugin`
  
    直接找到需要 inline 的 chunk 的 HTML 标签, 然后替换掉标签的内容, 因此无需自己再明确指定输出

* 方式二: 将 chunk map inline 到 HTML 中

  `inline-chunk-manifest-html-webpack-plugin` 将每个 chunk ID 和文件名映射起来提取出来,
  然后修改 `webpackBootstrap` 直接使用这个映射, 这样就可以将 `webpackBootstrap` 模块合并到 `vendor` 分块,
  不需要单独提取出 manifest chunk 了.

  ```javascript
  new InlineChunkManifestHtmlWebpackPlugin({
      dropAsset: false
  })
  ```
  
  得到的结果类似于

  ```html
  <script>
  window.webpackManifest={"0":"chunk/2356817.js","1":"chunk/427f17d.js","2":"chunk/2daed49.js"}
  </script>
  ```

  ```javascript
  // webpackBootstrap
  script.src = __webpack_require__.p + window["webpackManifest"][chunkId];
  ```

  **但是每次其他模块的代码, 竟然影响到了 vendor 的 hash?**

  因为 vendor 原本包含了 manifest 的内容, 代码修改后 manifest 的内容肯定会变, vendor 的 hash 也就变了,
  但是 `InlineChunkManifestHtmlWebpackPlugin` **替换了 vendor 文件的内容后, 没有重新计算 hash**,
  因此前后生成的 `vendor.js` 内容是一样的, 但是 hash 却不一样

  注意 `webpackBootstrap` 代码可能会变化的地方
  1. 当 chunk 数量变化时会造成 `installedChunks` 变化

     以下途径会产生新的 chunk
     * `entry` 定义的每一个入口
     * 动态 `import` 或者 `require.ensure` 产生的异步分块
     * `CommonsChunkPlugin` 提取的通用分块, 如果只提取了 vendor 分块, 就不会影响 `installedChunks` 的数量, 因为 vendor 作为初始分块, 不计入 `installedChunks` 中
    
  2. 加载异步分块的方法中放置了每个分块对应的文件路径
     
     ```javascript
     // __webpack_require__.e
     // 分块文件 URL
     script.src = __webpack_require__.p + "chunk/"
                // 分块ID与分块名称的映射: 分块ID 定义在 `webpackJsonp([2]`
                // 先通过 chunkId (分块ID默认是一个索引数字), 找出 chunk 的名称
                // 如果是动态 import 进来的分块, 没有对其命名的话, 就不会出现在这个映射中,
                // 则直接使用 chunkId 作为分块名称
                + ({"0":"abc","1":"ddd","2":"index"}[chunkId]||chunkId)
                // 分块ID与分块 hash 的映射
                + "-" + {"0":"2356817","1":"427f17d","2":"2daed49"}[chunkId] + ".js";
     ```
  3. 所有静态资源的根路径

     ```javascript
     __webpack_require__.p = "//cdn.com/path/";
     ```

## dynamic import 使用注意

如果要同时使用 dynamic import 和 `babel-loader` 来转译 es2015

例如:

```javascript
import(/* webpackChunkName: "abc" */'./abc.js').then(function(mod) {
    mod['default']();
});
```

必须给 `babel-loader` 配置 [`syntax-dynamic-import`](https://babeljs.io/docs/plugins/syntax-dynamic-import/) 插件来支持 `import()` 语法, 否则会报错提示

> SyntaxError 'import' and 'export' may only appear at the top level

或者你可以不使用 dynamic import 功能, 使用以往的 `require.ensure` 来动态加载模块, 这样就不需要给 `babel-loader` 配置 `syntax-dynamic-import` 插件了