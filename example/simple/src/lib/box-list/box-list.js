import './box-list.css';

import $ from 'jquery';

class BoxList {
    constructor(el, selectedIndex) {
        this.$el = $(el);
        var thiz = this;

        if (typeof selectedIndex != 'undefined') {
            thiz.$el.find('.box-list__item').eq(selectedIndex).addClass('box-list__item--active');
        }

        this.$el.on('click', '.box-list__item', function() {
            thiz.$el.find('.box-list__item').removeClass('box-list__item--active');
            $(this).addClass('box-list__item--active');
        });
    }
}

export default BoxList;