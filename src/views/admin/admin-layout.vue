<template>
  <el-watermark font="rgba(0, 0, 0, .15)" :content="userdata()">
    <div class="admin">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
      >
        <el-menu-item index="index" @click="routerGoto('/admin/index')"
          >管理面板</el-menu-item
        >
        <el-menu-item index="user" @click="routerGoto('/admin/user')"
          >用户</el-menu-item
        >
        <el-menu-item index="block" @click="routerGoto('/admin/block')"
          >会馆</el-menu-item
        >
        <el-menu-item index="group" @click="routerGoto('/admin/group')"
          >用户组</el-menu-item
        >
        <el-menu-item index="permission" @click="routerGoto('/admin/permission')"
          >权限</el-menu-item
        >
        <el-sub-menu index="post">
          <template #title>帖子</template>
          <el-menu-item index="2-1" @click="routerGoto('/admin/post')">主题贴管理</el-menu-item>
          <el-menu-item index="2-2">回帖管理</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="message" @click="routerGoto('/admin/message')"
          >消息</el-menu-item
        >
        <el-menu-item index="unknowed" @click="routerGoto('/admin/unknowed')"
          >附件</el-menu-item
        >
        <el-menu-item index="unknowed" @click="routerGoto('/admin/unknowed')"
          >勋章</el-menu-item
        >
        <el-menu-item index="unknowed" @click="routerGoto('/admin/unknowed')"
          >集市</el-menu-item
        >
        <el-menu-item index="unknowed" @click="routerGoto('/admin/unknowed')"
          >誓言录</el-menu-item
        >
        <el-menu-item index="version" @click="routerGoto('/admin/version')"
          >版本控制</el-menu-item
        >
      </el-menu>
      <div class="admin-box"><router-view></router-view></div>
    </div>
  </el-watermark>
</template>

<script lang="ts">
import { ref, onMounted, defineComponent } from "vue";
import store from "@/store";
import router from "@/router";

export default defineComponent({
  name: "admin",
  components: {},
  setup() {
    const activeIndex = ref("index");
    // 在组件挂载后设置定时器
    const userdata = () => {
      return store.state.user.info.user.username;
    };

    const routerGoto = (path: any) => {
      router.push({ path: path });
    };
    onMounted(() => {});

    return {
      activeIndex,
      userdata,
      routerGoto,
    };
  },
});
</script>

<style lang="scss" scoped>
.admin {
  margin-top: 60px;
  padding: 10px 20px;
  border-bottom-left-radius: 10px;
  border-bottom-right-radius: 10px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  .el-menu-demo {
  }
  .admin-box {
  }
}
</style>
