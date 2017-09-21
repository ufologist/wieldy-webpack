# 如何跨项目共用前端组件(资源)

## 背景

随着公司前端项目的增多, 大家会发现存在需要跨项目共用的前端资源, 这里的资源泛指前端涉及到的所有静态资源, 常见的有 CSS/JS/图片等等.

所谓共用前端资源, 就是将公共的前端资源提取出来, 例如公共样式/公共逻辑/公共组件/公共静态资源等等, 让多个项目来引用, 避免复制多份, 避免重复开发, 统一管理和维护, 一旦公共资源更新, 其他引用的项目也就可以同步更新.

## 前端资源共用的特殊之处

理想很丰满, 现实很骨感, 要想达到预期的效果, 我们首先来认清下前途的障碍.

前端资源的共用涉及到以下几个方面, 主要是如何使用和如何更新的问题
* **提取公共资源**: 如何模块化? 模块化的粒度控制?
* **存放/管理公共资源**: 公共资源应该统一放置在哪里? 如何管理依赖?
* **公共资源的发布更新**: 如何发布一个公共资源, 又如果更新版本?
* **公共资源的多版本共存**: 如何表明我需要哪个公共资源的哪个版本?
* **使用(引用)公共资源**: 如何在项目中使用公共资源, 还要考虑到打包优化的问题?

前端资源是由多种不同种类的资源组成的, 而且依赖关系错综复杂, 涉及到不同的资源路径, 引用方式是个头痛的问题, 一直是造成前端资源不方便共用的一大壁垒. 而且前端早些时候连(依赖)包管理器(例如 Java 的 Maven)的概念都没有, 所有的依赖都是手工的复制粘帖, 更新的时候再覆盖一次. 新项目开始的时候, 又是复制粘帖一遍.

你还记得你复制过多少份 `jquery.js` 吗? 你还弄得清各个项目所用的 jQuery 版本吗? 如果全项目需要统一升级一下 jQuery 的版本, 你该怎么做? 公共资源以复制多份的方式来共用, 势必变得难以维护, 最终很有可能造成公共资源存在各种版本不统一.

还记得当年 Java 没有 Maven 来管理项目的时候, 各种 jar 依赖在多个项目中复制粘帖, 是不是深有感触啊?

为了避免复制粘帖带来的痛苦, 统一维护公共资源, 在先不考虑优化的情况下, 我们可以将公共资源细粒度发布到 CDN 上.

那么各个项目中, 我们就可以这样使用了

```html
<!-- 公共组件的 CSS -->
<link rel="stylesheet" href="//cdn.com/lib/component1/component1.css">
<!-- 公共静态资源: 例如整个公司级需要共用的资源, 常见的就是公司 LOGO 了 -->
<img src="//cdn.com/lib/logo.png">
<!-- 公共组件的 JS -->
<script src="//cdn.com/lib/component1/component1.js"></script>
```

但是, 如果公共资源更新了呢? 由于涉及到浏览器缓存的问题, 你需要将各个项目引用到公共资源的地方全部搜索出来, 然后一个个修改引用资源的时间戳, 强制让浏览器缓存失效. 别忘了, 公共资源中如果引用到其他资源的也需要如此操作一番, 例如 CSS 中引用到的图片如果更新了的话.

```html
<link rel="stylesheet" href="//cdn.com/lib/component1/component1.css?v1">
<img src="//cdn.com/lib/logo.png?v2">
<script src="//cdn.com/lib/component1/component1.js?v3"></script>
```

但是, 如果公共资源需要多版本共存呢? 我们可以使用**版本文件夹**来区分, 引用的公共资源更新时, 就修改下版本号, 但具体哪个项目使用了哪个版本, 还是得全局搜索. 而且公共资源版本更新之后, 如何通知各个项目来更新呢? 难道是靠大声呼喊吗?

```html
<link rel="stylesheet" href="//cdn.com/lib/component1/1.1.0/component1.css">
<img src="//cdn.com/lib/logo/1.2.0/logo.png">
<script src="//cdn.com/lib/component1/1.1.0/component1.js"></script>
```

但是, 如果 CDN 域名要更换呢? 又得全局搜索一遍, 这种全局搜索的方式, 是痛苦而原始的, 项目不多还好处理, 一旦项目越来越多, 管理起来就会痛苦不堪. 你可能想到一些变通的方式, 来统一管理公共资源的引用, 例如借助后端配置管理系统之类的东西, 将这些引用都配置起来.

但是, 如果引用的公共资源太多, 想优化请求的数量, 做资源的合并呢? 这没法通过全局搜索的方式来解决了吧. 起初为了便于公共资源的按需使用, 我们细粒度规划了公共资源, 势必会增加页面的请求数量, 要想做优化, 可以使用 [combo 机制](https://yuiblog.com/blog/2008/07/16/combohandler/) 在服务端做资源的动态合并.

开发阶段我们可以细粒度的引用公共资源

```html
<link rel="stylesheet" href="//cdn.com/lib/component1/1.0.0/component1.css">
<link rel="stylesheet" href="//cdn.com/lib/component2/1.1.0/component2.css">
<link rel="stylesheet" href="//cdn.com/lib/component3/1.2.0/component3.css">
<link rel="stylesheet" href="//cdn.com/lib/component4/1.3.0/component4.css">
<img src="//cdn.com/lib/logo/1.0.0/logo.png">
<script src="//cdn.com/lib/component1/1.0.0/component1.js"></script>
<script src="//cdn.com/lib/component2/1.1.0/component2.js"></script>
<script src="//cdn.com/lib/component3/1.2.0/component3.js"></script>
<script src="//cdn.com/lib/component4/1.3.0/component4.js"></script>
```

上线阶段我们可以使用 combo 机制合并资源减少请求的数量, 以优化前端性能

```html
<link rel="stylesheet" href="//cdn.com/combo?lib/component1/1.0.0/component1.css,lib/component2/1.1.0/component2.css,lib/component3/1.2.0/component3.css,lib/component4/1.3.0/component4.css">
<img src="//cdn.com/lib/logo/1.0.0/logo.png">
<script src="//cdn.com/combo?lib/component1/1.0.0/component1.js,lib/component2/1.1.0/component2.js,lib/component3/1.2.0/component3.js,lib/component4/1.3.0/component4.js"></script>
```

这么长的 URL, 就像老太婆的裹脚布又臭又长, 维护起来那是相当辣眼睛啊.

而且大家有没有注意到, 公共组件的引用方式, 也有点麻烦, 是分两步来走的, 先引用 CSS, 再引用 JS, 这个 CSS 明显属于组件的依赖. 那么问题来了, 我使用一个组件, 为什么还要关注它的依赖呢? 如果组件的 CSS 或者组件的 JS 再有别的依赖呢? 是不是也需要使用者自己来处理呢? 可见前端资源的引用方式, 最好能够自动处理依赖关系的, 使用者只需要关注到他想用的资源(组件)这一层即可.

### 前端资源的依赖关系

要想简化前端资源的引用方式, 就必须处理好前端资源的依赖关系, 就让我们来好好地理一理前端资源的各种依赖关系吧.

首先页面是所有资源引用的入口, 即依赖的起点(源头), 依赖的种类主要分为两种
* 静态依赖: 通过静态分析代码, 就可以找出来的明确依赖关系, 可能涉及到多层依赖
* 动态依赖: 代码在执行的过程中才会加载的依赖

下面的示例说明了前端可能存在的各种依赖关系
```
index.html                                      -- 页面入口, 所有依赖的起点
├── <link rel="stylesheet" href="index.css">    -- CSS 依赖(可能又依赖其他 CSS 和其他静态资源)
|   |── @import url(a.css);                     -- 引用资源的相对路径是相对于当前 CSS 的路径
|   |   |── .a {background: url(res/a.png)}     -- 依赖的资源又会牵涉出依赖的依赖
|   |── .index {background: url(res/index.png)}
|
├── <img src="res/foo.png">                     -- 静态资源依赖
|
├── <script src="index.js"></script>            -- JS 预览(可能(动态)依赖其他 CSS/JS 和其他静态资源)
|   |── img.src = 'res/bar.png';                -- 引用资源的相对路径是相对于当前 HTML 的路径
|   |── link.href = 'b.css';
|   |   |── ...
|   |── js.src = 'a.js';
|   |   |── ...
```

这么多依赖关系, 该如何处理呢? 手工处理肯定不现实, 我们需要一个 **module bundler(模块打包器)** 来帮助我们分析并打包这些依赖.

## 实现方案

基于上面的分析结果, 要想共用前端资源, 必须先将公用的前端资源以包的形式统一地管理起来, 形成一个公共仓库, 在项目中声明依赖的前端资源包, 通过工具来下载依赖的具体资源文件.

开发时使用模块打包器分析出具体的依赖文件, 打包出项目依赖的所有前端资源.

因此我们需要一个**包管理器**和**模块打包器**, 即可实现梦寐以求地共用前端资源.
* 包管理器: [npm](https://www.npmjs.com/ "manage dependencies in your projects")

  > npm is the package manager for JavaScript
  >
  > manage dependencies in your projects

  管理项目级别的依赖, 必要时搭建一套 [npm 私服](https://github.com/cnpm/cnpmjs.org/wiki/Deploy-a-private-npm-registry-in-5-minutes)
* 模块打包器: [webpack](https://webpack.js.org/concepts/)

  > webpack is a module bundler for modern JavaScript applications
  >
  > it recursively builds a dependency graph that includes every module your application needs, then packages all of those modules into a small number of bundles - often only one - to be loaded by the browser.

  构建工具分析并打包依赖, 现在你可以放心大胆地删除项目中可能是历史遗留的静态资源文件了
  * 任何资源都可以视为一种依赖, 在构建时分析出资源的引用关系
  * 如果某个资源是僵尸资源, 删除后不会引发构建失败, 因为已经没有任何文件引用(依赖)它了
  * 在没有构建工具分析依赖的年代, 你只能通过全局搜索的方式来确定一个文件还有没有用, 但可能还是没有办法下达删除的决定(万一其他项目引用了呢?)

接下来, 共用前端资源的关键就是将公共的模块发布到 npm 里面, 然后就是在各个项目声明依赖实际使用了.

实际使用的方式就落在了: 如何通过 webpack 在 HTML/CSS/JS 文件中引用 npm 模块(即 node_modules 文件夹), 或者是 npm 模块中的文件

* HTML

  ```html
  <!-- 引用 npm 模块 ionicons 中的文件 -->
  <img src="~ionicons/dist/svg/ios-sunny.svg" width="50" height="50">
  ```
* CSS

  ```css
  /* 导入 npm 模块: normalize.css, 会自动去找 main 文件 */
  @import url(~normalize.css);

  .test-npm-res {
      /* 引用 npm 模块 ionicons 中的文件 */
      background-image: url(~ionicons/dist/svg/ios-partly-sunny-outline.svg);
  }
  ```
* JS:

  ```js
  // 导入 npm 模块 ionicons 中的文件
  import svg from 'ionicons/dist/svg/ios-sunny-outline.svg';
  ```

## 示例

我们只需要关注使用的模块, 不再需要关注模块的依赖了

* 共用静态资源文件: 在各个项目中引用公共的公司 Logo 图片

  将公共静态资源在 npm 上发布为一个 `company-common-res` 的模块包

  ```
  company-common-res/
  ├── src/
  |   |── logo.psd
  |   └── ...
  |
  ├── dist/
  |   |── logo.png
  |   └── ...
  |
  └── package.json
  ```

  在项目的 `package.json` 中声明依赖这个模块

  ```json
  "dependencies": {
    "company-common-res": "^1.0.0",
  }
  ```

  然后就是在 HTML/CSS/JS 文件中引用这个静态资源了, 以 HTML 文件中为例

  ```html
  <img src="~company-common-res/dist/logo.png" width="50" height="50">
  ```
* 共用 CSS 组件: 在各个项目中引用公共的 CSS 样式

  将公共的 CSS 基础样式在 npm 上发布为一个 `company-component-base` 的模块包, 在项目的 `package.json` 中声明依赖这个模块

  `company-component-base` 模块的 `package.json` 应该声明 `main` 为组件的 CSS 文件
  ```json
  "main": "company-component-base.css"
  ```

  在项目中使用这个组件, 以 CSS 文件中为例
  ```css
  @import url(~company-component-base);
  ```

  将公共的 CSS 组件在 npm 上发布为一个 `company-component-button` 的模块包

  ```css
  @import url(~company-component-button);
  ```
* 公共 JS 模块(纯逻辑模块, 不包含样式): 在各个项目中引用公共的 JS 工具方法

  将公共的 JS 工具方法在 npm 上发布为一个 `company-util` 的模块包, 在项目的 `package.json` 中声明依赖这个模块

  ```javascript
  import util from 'company-util';

  util.log('test');
  ```

* 公共 JS 组件(包含样式): 在各个项目中引用公共的 toast 组件

  将 toast 组件在 npm 上发布为一个 `company-component-toast` 的模块包, 在项目的 `package.json` 中声明依赖这个模块

  ```javascript
  import Toast from 'company-component-toast';

  new Toast({
      content: '提示内容'
  }).show();
  ```

## 总结

基于前端资源共用的特殊之处
* 多种不同种类的资源
* 资源的依赖关系复杂(HTML依赖/CSS依赖/JS依赖/图片依赖/组件依赖)
* 没有包管理器来统一维护项目的依赖
* 如何引用依赖以及打包

要实现前端资源共用, 我们需要一个**包管理器**和**模块打包器**, 以解决上面的这些问题.

接下来的重点就是, 如何形成一个组件的平台了, 让大家可以方便的知道有哪些组件, 以及如何使用这些组件
* 规范化的包名: 例如组件包名都以 `component` 开头
* 规范化的项目目录结构
* 组件文档和可展示的使用示例