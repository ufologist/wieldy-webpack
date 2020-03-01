# CHANGELOG

* v1.4.3 2020-3-1

  * fix: 由于网络原因使用 `image-webpack-loader-coding-net-vendor` 替换掉 `image-webpack-loader`

  # imagemin 总是安装失败, 如何解决

  ## 分析问题

  * 寻找可替换方案(暂时没有找到不依赖本地包的图片优化包)
    * https://github.com/tinify/tinify-nodejs 500张每个月
    * https://github.com/dkunin/optimizilla-cli 也是上传到一个网站, 网站的可用性未知
  * 定位安装失败的原因
    * 以 `jpegtran-bin` 为例
    * `jpegtran pre-build test failed`
    * 查看代码(`lib/index.js` 和 `lib/install.js`)得知
      * 因为 [`jpegtran-bin`](https://unpkg.com/browse/jpegtran-bin@4.0.0/) 没有在发布的包中包含 `vendor/` 文件夹中的分平台可执行文件(猜测可能是版权的问题)
      * 会由 `bin-wrapper` 去下载可执行文件 `https://raw.githubusercontent.com/imagemin/jpegtran-bin/v4.0.0/vendor/win/x86/jpegtran.exe`, 但由于网络问题, 访问不到, 造成下载失败了(会卡在这里很久)
      * 失败后会走本地编译出可执行文件的方案(在这里由于依赖各种操作系统的环境, 很容易失败) 
    * 总是安装失败罪魁祸首算是找到了: 是因为我们不明所以地打不开某个网站造成的, 都不好意思跟外国友人提需求了
    * 那么我们自建修复包吧

  ## 自建修复包(共计发包 18 个)
  
  ### 梳理依赖
  
  ```
  * vue-cli-plugin-wieldy-webpack@1.0.3 => vue-cli-plugin-wieldy-webpack@1.0.5
    * image-webpack-loader@5.1.0        => image-webpack-loader-coding-net-vendor@5.1.0
      * imagemin@7.0.1                  => imagemin-coding-net-vendor@7.0.1
        * imagemin-jpegtran@6.0.0       => imagemin-jpegtran-coding-net-vendor@6.0.0
          * jpegtran-bin@4.0.0          => jpegtran-bin-coding-net-vendor@4.0.0
      * imagemin-gifsicle@6.0.1         => imagemin-gifsicle-coding-net-vendor@6.0.1
        * gifsicle@4.0.1                => gifsicle-coding-net-vendor@4.0.1
      * imagemin-mozjpeg@8.0.0          => imagemin-mozjpeg-coding-net-vendor@8.0.0
        * mozjpeg@6.0.1                 => mozjpeg-coding-net-vendor@6.0.1
      * imagemin-optipng@7.1.0          => imagemin-optipng-coding-net-vendor@7.1.0
        * optipng-bin@6.0.0             => optipng-bin-coding-net-vendor@6.0.0
      * imagemin-pngquant@6.0.1         => imagemin-pngquant-coding-net-vendor@6.0.1
        * pngquant-bin@5.0.2            => pngquant-bin-coding-net-vendor@5.0.2
      * imagemin-webp@5.1.0             => imagemin-webp-coding-net-vendor@5.1.0
        * cwebp-bin@5.1.0               => cwebp-bin-coding-net-vendor@5.1.0
      * imagemin-svgo
  * wieldy-webpack@1.4.2                => wieldy-webpack@1.4.3
    * image-webpack-loader^4.6.0        升级到 5.1.0
  * fe-common-build@0.6.4               => fe-common-build@0.6.7
    * gulp-imagemin@^3.3.0"             => gulp-imagemin-coding-net-vendor@6.2.0
    * imagemin-pngquant@^5.1.0"         升级到 6.0.1
  ```
  
  ### 修改底层依赖包(`xxx-bin` 这一类的包)
  
  * 找到依赖的仓库和版本
    * 例如: `https://github.com/imagemin/optipng-bin.git`
    * 例如: `6.0.0`
  * 本地 clone GitHub 仓库
  * 重置 master 到对应版本的 tag
  * 创建 [Coding 的仓库](https://coding.net/), 因为这里的网络是好的
  * 修改 origin remote 到 Coding 的仓库
    * 例如: `https://e.coding.net/ufologist/optipng-bin.git`
  * 修改 `lib/index.js` 中的 `url`
    * 例如: `https://ufologist.coding.net/p/optipng-bin/d/optipng-bin/git/raw/v${pkg.version}/vendor/`;
  * 修改 `package.json` 中的包名(`name`)
    * 添加后缀: `-coding-net-vendor`
    * 例如: `optipng-bin` => `optipng-bin-coding-net-vendor`
  * 提交代码并 push 到 origin remote
    * `fix: 使用 coding.net 存放 vendor`
  * 打上对应版本号的 tag
    * 例如: `v6.0.0`
  * 测试安装是否正常
    * `npm install`
  * 发布到 npm
    * `npm publish`
  
  ## 修改上层依赖包
  
  * 找到依赖的仓库和版本
    * 例如: `https://github.com/imagemin/imagemin-optipng`
    * 例如: `7.1.0`
  * 本地 clone GitHub 仓库
  * 重置 master 到对应版本的 tag
  * 创建 [Coding 的仓库](https://coding.net/), 因为这里的网络是好的
  * 修改 origin remote 到 Coding 的仓库
    * 例如: `https://e.coding.net/ufologist/imagemin-optipng.git`
  * 修改 `package.json` 中的包名(`name`)
    * 添加后缀: `-coding-net-vendor`
    * 例如: `imagemin-optipng` => `imagemin-optipng-coding-net-vendor`
  * 修改 `package.json` 中依赖包的名称(`dependencies` 和 `devDependencies`)
    * 添加后缀: `-coding-net-vendor`
    * 例如: `optipng-bin` => `optipng-bin-coding-net-vendor`
  * 修改代码中使用时的包名称
    * 例如: `require('optipng-bin')` => `require('optipng-bin-coding-net-vendor')`
  * 测试安装是否正常
    * `npm install`
  * 执行测试用例
    * `npm test`
  * 提交代码并 push 到远端
    * `fix: 使用 coding-net-vendor 包`
  * 发布到 npm
    * `npm publish`

* v1.4.2 2020-2-15

  * fix: 由于 `image-webpack-loader@3.x` 版本太老了, 老是安装失败, 升级到 `4.x` 版本

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