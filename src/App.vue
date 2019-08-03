<template>
    <div id="app">
        <three></three>
    </div>
</template>

<script>
import Three from './components/Three.vue'

export default {
    name: 'app',
    components: {
        Three
    }
}
</script>

<style>
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>