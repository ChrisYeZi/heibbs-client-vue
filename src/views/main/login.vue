<template>
  <div class="login">
    <div class="headBox">
      <van-icon
        :name="imgUrl + '/icon/guanbi.svg'"
        size="30"
        @click="toIndex()"
      />
    </div>

    <!--        登录         -->
    <div class="login-form" v-if="indexType == 'login'">
      <!-- 标题 -->
      <div class="form-title">罗小黑妖灵论坛用户登录</div>
      <!-- 账户 -->
      <div class="form-input">
        <div>ID</div>
        <input type="username" v-model="user.username" />
      </div>
      <!-- 密码 -->
      <div class="form-input">
        <div>密码</div>
        <input type="password" v-model="user.password" />
      </div>
      <div class="form-toForgot">
        <span @click="setIndexType('forgot')">忘记密码？</span>
      </div>
      <!-- 接受协议 -->
      <div class="form-agreement">
        <van-checkbox
          v-model="agreementChecked"
          shape="square"
          checked-color="rgb(254,180,69)"
          >接受<a
            >《关于三万两千七百六十七条不平等扣除妖灵币条约》</a
          ></van-checkbox
        >
      </div>
      <!-- submit -->
      <div class="form-submit" @click="login()">阅读并同意协议登录</div>
      <div class="form-register" @click="setIndexType('register')">
        立即注册
      </div>
    </div>

    <!--      忘记密码       -->
    <div class="login-form" v-if="indexType == 'forgot'">
      <!-- 标题 -->
      <div class="form-title">罗小黑妖灵论坛忘记密码</div>
      <!-- 账户 -->
      <div class="form-input">
        <div>邮箱</div>
        <input type="email" v-model="user.email" />
      </div>
      <!-- 密码 -->
      <div class="form-input">
        <div>密码</div>
        <input type="password" v-model="user.password" />
      </div>
      <!-- 重复密码 -->
      <div class="form-input">
        <div>重复密码</div>
        <input type="password" v-model="user.rePassword" />
      </div>
      <!-- 验证码 -->
      <div class="form-input">
        <div>验证码</div>
        <input type="text" v-model="user.captcha" v-if="questCaptcha" />
        <div
          class="form-quest-submit"
          v-if="!questCaptcha"
          @click="forgotRequestCaptcha()"
        >
          获取验证码
        </div>
      </div>
      <div class="form-toForgot">
        <span @click="setIndexType('login')">立即登录</span>
      </div>
      <!-- submit -->
      <div class="form-submit" @click="forgot()">修改密码</div>
    </div>

    <!--        注册账户        -->
    <div class="login-form" v-if="indexType == 'register'">
      <!-- 标题 -->
      <div class="form-title">罗小黑妖灵论坛注册账户</div>
      <!-- 账户 -->
      <div class="form-input">
        <div>ID</div>
        <input type="email" v-model="user.username" />
      </div>
      <!-- 邮箱 -->
      <div class="form-input">
        <div>邮箱</div>
        <input type="email" v-model="user.email" />
      </div>
      <!-- 密码 -->
      <div class="form-input">
        <div>密码</div>
        <input type="password" v-model="user.password" />
      </div>
      <!-- 重复密码 -->
      <div class="form-input">
        <div>重复密码</div>
        <input type="password" v-model="user.rePassword" />
      </div>
      <!-- 邀请码 -->
      <div class="form-input">
        <div>邀请码</div>
        <input type="text" v-model="user.invitation" />
      </div>
      <!-- 验证码 -->
      <div class="form-input">
        <div>验证码</div>
        <input type="text" v-model="user.captcha" v-if="questCaptcha" />
        <div
          class="form-quest-submit"
          v-if="!questCaptcha"
          @click="registerRequestCaptcha()"
        >
          获取验证码
        </div>
      </div>
      <div class="form-toForgot">
        <span @click="setIndexType('login')">立即登录</span>
      </div>
      <!-- 接受协议 -->
      <div class="form-agreement">
        <van-checkbox
          v-model="agreementChecked"
          shape="square"
          checked-color="rgb(254,180,69)"
          >接受<a
            >《关于三万两千七百六十七条不平等扣除妖灵币条约》</a
          ></van-checkbox
        >
      </div>
      <!-- submit -->
      <div class="form-submit" @click="register()">注册</div>
    </div>

    <!-- 弹出框 -->
    <van-toast
      v-model:show="msgShow"
      style="padding: 0; background: rgba(0, 0, 0, 0)"
    >
      <template #message>
        <messagebar-vue :content="content"></messagebar-vue>
      </template>
    </van-toast>
  </div>
</template>

<script>
import config from "@/config";
import router from "@/router";
import {
  LoginAPI,
  GetUserInfoAPI,
  GetForgotCaptchaAPI,
  UpdateForgotPasswordAPI,
  GetRegisterCaptchaAPI,
  RegisterAPI,
} from "../../api/index";
import MessagebarVue from "@/components/common/Messagebar.vue";
import store from "@/store";
export default {
  name: "login",
  components: { MessagebarVue },
  data() {
    return {
      // 图片默认地址
      imgUrl: config.imgUrl,
      // 用户信息
      user: {
        username: "",
        password: "",
        rePassword: "",
        email: "",
        invitation: "",
        captcha: "",
      },
      // 是否接受协议
      agreementChecked: false,
      // 消息弹出框控制变量
      msgShow: false,
      // 消息内容
      content: "",
      // 页面类型
      indexType: "login",
      // 是否请求验证码
      questCaptcha: false,
    };
  },
  methods: {
    // 跳转首页
    toIndex() {
      router.push("/index");
    },
    // 登录
    login() {
      if(!this.agreementChecked){
        this.content = "接受协议接受协议接受协议接受协议接受协议";
        this.msgShow = true;
        return;
      }
      LoginAPI({
        username: this.user.username,
        password: this.user.password,
      }).then((res) => {
        if (res.status == 200) {
          this.content = res.msg;
          localStorage.setItem("heibbs.token", res.data);
          GetUserInfoAPI().then((res) => {
            if (res.status == 200) {
              // 存入登录数据
              store.commit("user/SET_USERINFO", res.data);
            } else {
              this.content = res.data;
              this.msgShow = true;
            }
          });
          this.msgShow = true;
          // 将登录状态设置为true
          store.commit("user/SET_USERLOGIN", true);
          // 延迟跳转
          setTimeout(() => {
            router.push("/index");
          }, 1500);
        } else {
          this.content = res.msg;
          this.msgShow = true;
        }
      });
    },

    // 忘记密码修改密码
    forgot() {
      let email = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (!email.test(this.user.email)) {
        this.content = "邮箱格式错误";
        this.msgShow = true;
        return;
      }
      if (this.user.password != this.user.rePassword) {
        this.content = "两次密码不一致";
        this.msgShow = true;
        return;
      }
      UpdateForgotPasswordAPI({
        email: this.user.email,
        captchacode: this.user.captcha,
        password: this.user.password,
      }).then((res) => {
        if (res.status == 200) {
          this.content = res.data;
          this.msgShow = true;
          // 延迟跳转
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          this.content = res.data;
          this.msgShow = true;
        }
      });
    },
    // 忘记密码请求验证码
    forgotRequestCaptcha() {
      let email = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (!email.test(this.user.email)) {
        this.content = "邮箱格式错误";
        this.msgShow = true;
        return;
      }
      GetForgotCaptchaAPI({
        email: this.user.email,
      }).then((res) => {
        if (res.data == "请勿重复请求验证码") {
          this.content = res.data;
          this.questCaptcha = true;
          this.msgShow = true;
          return;
        }
        if (res.status == 200) {
          this.content = res.data;
          this.questCaptcha = true;
          this.msgShow = true;
        } else {
          this.content = res.data;
          this.msgShow = true;
        }
      });
    },

    // 注册账户
    register() {
      let username = /^([\u4e00-\u9fa5a-zA-Z0-9]{1,9}\S{1,9})$/;
      let email = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (!username.test(this.user.username)||this.user.username.length>8) {
        this.content = "用户名格式错误";
        this.msgShow = true;
        return;
      }
      if (!email.test(this.user.email)) {
        this.content = "邮箱格式错误";
        this.msgShow = true;
        return;
      }
      if (this.user.password != this.user.rePassword) {
        this.content = "两次密码不一致";
        this.msgShow = true;
        return;
      }
      if(!this.agreementChecked){
        this.content = "接受协议接受协议接受协议接受协议接受协议";
        this.msgShow = true;
        return;
      }
      RegisterAPI({
        username: this.user.username,
        email: this.user.email,
        password: this.user.password,
        invitation: this.user.invitation,
        captcha: this.user.captcha,
      }).then((res) => {
        if (res.status == 200) {
          this.content = res.data;
          this.msgShow = true;
          // 延迟跳转
          setTimeout(() => {
            router.push("/login");
          }, 1500);
        } else {
          this.content = res.data;
          this.msgShow = true;
        }
      });
    },
    // 注册账户请求验证码
    registerRequestCaptcha() {
      let email = /^([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})$/;
      if (!email.test(this.user.email)) {
        this.content = "邮箱格式错误";
        this.msgShow = true;
        return;
      }
      GetRegisterCaptchaAPI({
        email: this.user.email,
      }).then((res) => {
        if (res.data == "请勿重复请求验证码") {
          this.content = res.data;
          this.questCaptcha = true;
          this.msgShow = true;
          return;
        }
        if (res.status == 200) {
          this.content = res.data;
          this.questCaptcha = true;
          this.msgShow = true;
        } else {
          this.content = res.data;
          this.msgShow = true;
        }
      });
    },

    // 切换
    setIndexType(val) {
      let obj = {
        username: "",
        password: "",
        rePassword: "",
        email: "",
        invitation: "",
        captcha: "",
      };
      this.user = obj;
      this.indexType = val;
    },
  },
};
</script>

<style lang="scss" scoped>
.login {
  .headBox {
    padding: 5px;
  }
  .login-form {
    margin-top: 20px;
    background: rgba(255, 255, 255, 1);
    padding: 20px 10px;
    border-radius: 20px;
    .form-toForgot {
      text-align: right;
      padding: 0px 30px;
      font-size: 14px;
    }
    .form-title {
      text-align: center;
      margin: 0 auto;
      font-size: 20px;
      font-weight: 550;
      padding: 10px;
      width: 80%;
      border-bottom: 3px solid rgb(254, 180, 69);
    }
    .form-input {
      text-align: center;
      background: rgb(255, 248, 226);
      margin: 20px;
      padding: 10px;
      border-radius: 15px;
      display: flex;
      div {
        width: 70px;
        color: rgb(255, 248, 226);
        background: rgb(254, 180, 69);
        border-radius: 10px;
        padding: 10px 5px;
        font-weight: 550;
      }
      input {
        background: rgba(0, 0, 0, 0);
        border: none;
        text-align: center;
        border-radius: 10px;
        color: rgb(226, 156, 50);
      }
      .form-quest-submit {
        position: absolute;
        right: 60px;
        padding: 7px 5px;
        width: 100px;
        font-weight: 500;
        border-radius: 10px;
        margin-left: 50px;
        background: rgba(116, 135, 105, 0.6);
      }
      .form-quest-submit:active {
        background: rgba(116, 135, 105, 0.9);
      }
    }
    .form-agreement {
      margin: 20px;
      font-size: 12px;
    }
    .form-submit {
      text-align: center;
      background: rgb(254, 180, 69);
      color: #fff;
      margin: 20px;
      padding: 10px;
      border-radius: 15px;
      font-weight: 550;
    }
    .form-submit:active {
      background: rgba(254, 180, 69, 0.8);
      transition: 0.4s;
    }
    .form-register {
      text-align: center;
    }
  }
}
</style>