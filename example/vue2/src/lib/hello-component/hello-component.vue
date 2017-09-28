<template>
    <div class="hello-component">
        <p class="hello-component__text">{{hello}}</p>
    </div>
</template>
<script>
export default {
    data() {
        return {
            hello: 'hello world'
        };
    }
}
</script>
<style>
@import url(hello.css);

.hello-component {
    display: flex;
    background-color: #ddd;
}
</style>