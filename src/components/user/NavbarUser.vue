<template>
  <div class="NavbarUser">
    <div class="avatarBox">
      <!-- 头像区域：支持点击上传 -->
      <div class="avatar-container" @click="triggerAvatarUpload">
        <img 
          :src="avatarUrl" 
          alt="用户头像" 
          class="user-avatar"
        />
        <!-- 上传提示（登录状态显示） -->
        <div class="avatar-tip" v-if="login">更换头像</div>
      </div>
      
      <!-- 隐藏的文件选择器 -->
      <input 
        type="file" 
        ref="avatarInput" 
        class="avatar-input" 
        accept="image/*" 
        @change="handleAvatarSelect"
      />

      <div class="avatarBox-content" v-if="login">{{ username }}</div>
      <div class="avatarBox-content" v-else @click="toLogin()">
        您没有登录,立即登录
      </div>
    </div>

    <van-cell
      icon="user-circle-o"
      title="个人信息"
      is-link
      :to="{
        name: 'info',
        params: { id: uid },
      }"
    />
    <van-cell icon="medal-o" title="勋章" is-link to="invitation" />
    <van-cell icon="todo-list-o" title="誓言录" is-link to="invitation" />
    <van-cell icon="coupon-o" title="邀请码" is-link to="invitation" />
    <van-cell icon="friends-o" title="用户组" is-link to="permission" />
    <van-cell icon="setting-o" title="设置" is-link to="setting" />
    <van-cell
      icon="setting"
      title="论坛管理"
      is-link
      to="admin"
      v-if="admin === 1"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from "vue";
import config from "@/config/index";
import store from "@/store";
import router from "@/router";
import { GetUserAvatarAPI } from "@/api/index"; // 引入获取头像接口
import { UploadAvatarAPI } from "@/api/index"; // 引入上传头像接口
import { ElMessage } from "element-plus"; 

export default defineComponent({
  name: "NavbarUser",
  setup() {
    const avatarInput = ref<HTMLInputElement | null>(null); // 文件选择器ref
    const avatarUrl = ref<string>("../../assets/img/avatar.png"); // 头像地址
    const uid = ref<number | null>(store.state.user?.info?.user?.uid);
    const login = ref<boolean>(!!store.state.user?.login); // 确保是boolean原始类型
    const username = ref<string>(store.state.user?.info?.user?.username || "");
    const admin = ref<number | null>(store.state.user?.info?.user?.extgroupids);

    // 加载用户头像
    const loadUserAvatar = async () => {
      if (!login.value || !uid.value) {
        avatarUrl.value = "../../assets/img/avatar.png";
        return;
      }

      try {
        const res = await GetUserAvatarAPI(uid.value);
        if (res.status === 200 && res.data) {
          avatarUrl.value = `${config.avatarUrl}${res.data}`;
        }
      } catch (error) {
        console.error("加载头像失败:", error);
        avatarUrl.value = "../../assets/img/avatar.png";
      }
    };

    // 触发文件选择器
    const triggerAvatarUpload = () => {
      if (!login.value) return;
      avatarInput.value?.click();
    };

    // 处理头像选择
    const handleAvatarSelect = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      // 校验文件类型和大小（限制2MB以内的图片）
      const isImage = file.type.startsWith("image/");
      const isLt3M = file.size / 1024 / 1024 < 3;
      
      if (!isImage) {
        ElMessage.error("请选择图片文件！");
        return;
      }
      if (!isLt3M) {
        ElMessage.error("图片大小不能超过3MB!");
        return;
      }

      try {
        // 上传头像
        const res = await UploadAvatarAPI(file);
        if (res.status === 200) {
          ElMessage.success("头像上传成功！");
          // 如果用vant Toast：Toast.success("头像上传成功！");
          
          // 重新加载最新头像
          await loadUserAvatar();
          // 清空文件选择器
          target.value = "";
        }
      } catch (error) {
        console.error("上传头像失败:", error);
        ElMessage.error("头像上传失败，请重试！");
        // 如果用vant Toast：Toast.fail("头像上传失败，请重试！");
        target.value = "";
      }
    };

    // 监听登录状态和UID变化
    watch([() => store.state.user?.login, () => store.state.user?.info?.user?.uid], 
      () => {
        uid.value = store.state.user?.info?.user?.uid;
        login.value = !!store.state.user?.login; // 强制转为boolean原始类型
        username.value = store.state.user?.info?.user?.username || "";
        admin.value = store.state.user?.info?.user?.extgroupids;
        loadUserAvatar(); // 重新加载头像
      }, 
      { immediate: true }
    );

    // 跳转登录
    const toLogin = () => {
      router.push({
        path: "/login",
        query: { url: router.currentRoute.value.path },
      });
    };

    return {
      avatarInput,
      avatarUrl,
      uid,
      login,
      username,
      admin,
      loadUserAvatar,
      triggerAvatarUpload,
      handleAvatarSelect,
      toLogin,
    };
  },
});
</script>

<style lang="scss" scoped>
.NavbarUser {
  background: rgba(246, 246, 246, 1);
  height: 100%;
  max-width: 700px;

  .avatarBox {
    background: rgba(255, 252, 244, 0.8);
    height: 10%;
    padding: 20px;
    margin-bottom: 20px;
    border-bottom-left-radius: 15px;
    border-bottom-right-radius: 15px;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;

    .avatar-container {
      position: relative;
      cursor: pointer;

      .user-avatar {
        width: 70px;
        height: 70px;
        border-radius: 50%; // 圆形头像
        object-fit: cover;
        border: 2px solid #fff;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
      }

      .avatar-tip {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.5);
        color: #fff;
        font-size: 12px;
        text-align: center;
        padding: 2px 0;
        border-bottom-left-radius: 50%;
        border-bottom-right-radius: 50%;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .avatar-tip {
        opacity: 1;
      }
    }

    .avatar-input {
      display: none; // 隐藏原生文件选择器
    }

    .avatarBox-content {
      font-size: 1.2rem;
      margin: 0 25px;
      line-height: 2.5em;
      cursor: pointer;

      &:hover {
        color: #1989fa;
      }
    }
  }
}
</style>