<template>
  <div id="app">
    <router-view />
  </div>
</template>


<style lang="scss">
* {
  // color: rgb(207, 157, 65);
  padding: 0;
  margin: 0;
}
:root:root {
  // 单元格背景 - 触发颜色
  --van-cell-background: rgba(255, 248, 226, 0);
  --van-cell-active-color: rgba(0, 0, 0, 0.05);
  // 按钮
  --van-button-default-background: rgba(244, 170, 41, 0);
  --van-button-primary-background: rgba(244, 170, 41, 0.7);
  --van-button-primary-border-color: rgba(0, 0, 0, 0);
  --van-button-default-color: rgba(124, 123, 91, 1);
  --van-button-primary-color: rgba(255, 255, 255, 0.9);
  // 弹出框Dialog
  --van-dialog-background: rgb(255, 248, 226);
  // 单元格文字颜色
  --van-cell-text-color: rgba(124, 123, 91, 1);
  --van-text-color: rgba(83,76,49, 1);
}
body {
  // background: #d1decd;
  color: rgba(124, 123, 91, 1);
  background: rgb(255, 248, 226);
  -webkit-app-region: drag;
}
::-webkit-scrollbar {
  display: none;
}
</style>
