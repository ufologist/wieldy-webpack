// 使用相对路径引入模块
import './index.css';

import $ from 'jquery';
// 如果是引入 zepto, 需要使用 imports-loader
// import $ from 'imports-loader?this=>window!zepto';
// 引入 npm 模块中的文件
import svg from 'ionicons/dist/svg/ios-sunny-outline.svg';

import BoxList from '../lib/box-list/box-list.js';

// 使用 alias 绝对路径引入模块
// PS: 会影响到转到类型定义的功能
import {
    getUser
} from '@/lib/api.js';

$('.js-file-path').append('<img width="50" height="50" src="' + svg + '">');

new BoxList('.box-list', 0);

getUser().then(function(user) {
    $('.js-http-api').text(user.name);
});

// dynamic import 使用注意
// -------
// 如果要同时使用 dynamic import 和 babel-loader 来转译 es2015
// import(/* webpackChunkName: "abc" */'./abc.js').then(function(mod) {
//     mod['default']();
// });
// 必须给 babel-loader 配置 syntax-dynamic-import 插件来支持 import() 语法
// 否则会提示 SyntaxError 'import' and 'export' may only appear at the top level
// https://babeljs.io/docs/plugins/syntax-dynamic-import/
//
// 或者你可以不使用 dynamic import 功能, 直接使用 require.ensure 来动态加载模块,
// 这样就不需要给 babel-loader 配置 syntax-dynamic-import 插件了
$('.js-lazy-mod-btn').on('click', function() {
    import('./lazy.js').then(function(mod) {
        mod['default']($('.js-lazy-mod'));
    });
});