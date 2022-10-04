<template>
  <div id="app">
    <Map />
  </div>
</template>

<script>
import Map from "./view/map.vue";

export default {
  components: {
    Map,
  },
  data() {
    return {};
  },
  mounted() {},
  methods: {},
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
#app {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.cesium-viewer-bottom {
  display: none !important;
}
.dj3d-logo-container {
  display: none;
}
</style>
