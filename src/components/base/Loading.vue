<template>
  <div class="Loading">
    <div class="loading-logo">
      <img src="../../assets/img/heibbs-logo.png" alt="罗小黑妖灵论坛logo" />
    </div>
  </div>
</template>

<!-- 这里不适合用ts -->
<script>
import config from "@/config/index";
import store from "@/store";
import router from "@/router";
export default {
  name: "Navbar",
  components: {},
  data() {
    return {
      //   username: store.state.user?.info?.user?.username,
    };
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.Loading {
  position: fixed;
  top: 0;
  width: 100%;
  height: 100%;
  padding: 0px 10px;
  padding-top: 10px;
  background: rgba(255, 254, 249, 1);
  z-index: 9999;
  .loading-logo {
    padding-top: 20vh;
    text-align: center;
    img {
      width: 70vw;
    }
  }
}
</style>