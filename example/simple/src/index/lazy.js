import './lazy.css';

import $ from 'jquery';

function lazy(el) {
    $(el).append('<div class="lazy">我是一个懒加载的模块</div>');
}

export default lazy;