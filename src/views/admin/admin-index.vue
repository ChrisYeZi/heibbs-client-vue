<template>
  <div class="admin-index">咕咕之门</div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
  name: "admin-index",
  components: {},
  setup() {
    // 在组件挂载后设置定时器
    onMounted(() => {});

    return {};
  },
});
</script>

<style lang="scss" scoped>
.admin-index {
  padding: 10px 20px;
}
</style>
