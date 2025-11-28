<template>
  <div class="gugu">咕咕之门{{ content }}
    <button @click="test()">不要点</button>
    <iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=110 src="//music.163.com/outchain/player?type=0&id=373620328&auto=0&height=90"></iframe>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import store from "@/store";

export default defineComponent({
  name: "gugu",
  components: {},
  setup() {
    // 使用ref创建响应式数据
    const content = ref("咕咕咕");

    // 在组件挂载后设置定时器
    onMounted(() => {
      setInterval(() => {
        content.value += "咕";
      }, 1000);
    });

    const test = () => {
       store.dispatch("system/SET_SYSLOADING_ACTION", true);
    };

    return {
      content,
      test,
    };
  },
});
</script>

<style lang="scss" scoped>
.gugu {
  padding: 10px 20px;
}
</style>
