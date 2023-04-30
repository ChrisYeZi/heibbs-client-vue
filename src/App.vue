<template>
  <div id="app">
    <router-view />
  </div>
</template>

<style lang="scss">
* {
  color: rgb(207, 157, 65);
  padding: 0;
  margin: 0;
}
body {
  background: #d1decd;
  -webkit-app-region: drag;
  padding: 0px 7px;
}
::-webkit-scrollbar {
  display: none;
}
</style>
