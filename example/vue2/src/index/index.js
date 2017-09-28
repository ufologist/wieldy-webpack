import Vue from 'vue';
import Index from './index.vue';

new Vue({
    el: '.js-app',
    render: function(h) {
        return h(Index)
    }
});