<template>
  <div class="gugu">{{ content }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 使用ref创建响应式数据
const content = ref("咕咕咕");

// 在组件挂载后设置定时器
onMounted(() => {
  setInterval(() => {
    content.value += "咕";
  }, 1000);
});
</script>

<style lang="scss" scoped>
.gugu {
  padding: 10px 20px;
}
</style>
