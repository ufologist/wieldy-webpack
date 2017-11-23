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
    getUser,
    sendApiRequest
} from '@/lib/api.js';

$('.js-file-path').append('<img width="50" height="50" src="' + svg + '">');

new BoxList('.box-list', 0);

getUser({
    data: {
        a: 1
    }
}).then(function(user) {
    $('.js-http-api').text(user.name);
});

sendApiRequest('getUser', {
    data: {
        a: 2
    }
}).then(function(user) {
    $('.js-http-api').text(user.name);
});

$('.js-lazy-mod-btn').on('click', function() {
    import('./lazy.js').then(function(mod) {
        mod['default']($('.js-lazy-mod'));
    });
});