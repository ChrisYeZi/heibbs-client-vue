<template>
  <div class="gugu">{{ content }}</div>
</template>

<script>
export default {
  name: "gugu",
  data() {
    return {
      content: "咕咕咕",
    };
  },
  created() {
    setInterval(() => {
      this.content += "咕";
    }, 1000);
  },
};
</script>

<style lang="scss" scoped>
.gugu {
}
</style>