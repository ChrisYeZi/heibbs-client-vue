<template>
  <div class="Messagebar">{{ content }}</div>
</template>

<script>
export default {
  name: "Messagebar",
  props: ["content"],
};
</script>

<style>
.Messagebar {
  width: 200px;
  background: rgb(255,248,226);
  padding: 20px;
  border-radius: 10px;
  font-weight: 550;
  color: rgba(124, 123, 91, 1);
  border: 1px solid rgba(0,0,0,0.1);
}
</style>