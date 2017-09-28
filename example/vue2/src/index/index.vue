<template>
    <div>
        <h1 class="index-header">wieldy-webpack Vue2 示例项目</h1>
        <div class="js-vue-test" v-cloak>
            <p>{{foo}}</p>
            <hello-component></hello-component>
            <async-component></async-component>
        </div>
    </div>
</template>
<script>
import HelloComponent from '../lib/hello-component/hello-component.vue';
var AsyncComponent = import('../lib/async-component/async-component.vue');

export default {
    data() {
        return {
            foo: 'hello vue'
        };
    },
    components: {
        HelloComponent,
        'async-component': () => AsyncComponent
    }
}
</script>
<style>
@import url(~normalize.css);

.index-header {
    font-weight: normal;
}
</style>