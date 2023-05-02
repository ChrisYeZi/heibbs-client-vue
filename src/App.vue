<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
* {
  color: rgba(124, 123, 91, 1);
  // color: rgb(207, 157, 65);
  padding: 0;
  margin: 0;
}
body {
  background: #d1decd;
  -webkit-app-region: drag;
}
::-webkit-scrollbar {
  display: none;
}
</style>
