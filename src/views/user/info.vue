<template>
  <div class="user-info-page">
    <!-- 用户信息卡片 -->
    <div class="user-card">
      <!-- 头像区域 -->
      <div class="avatar-container">
        <img src="../../assets/img/avatar.png" alt="用户头像" class="avatar" />
      </div>

      <!-- 用户名和状态 -->
      <div class="user-basic">
        <h2 class="username">
          {{ userdata?.username }}
          <van-badge :text="userGroup" class="group-badge" />
        </h2>
      </div>

      <!-- 注册信息 -->
      <div class="user-meta">
        <div class="meta-item">
          <van-icon name="clock-o" size="14" />
          <span>注册时间: {{ userdata?.userRegdate }}</span>
        </div>
        <div class="meta-item">
          <van-icon name="eye-o" size="14" />
          <span>最后登录: {{ userdata?.userLastvisit }}</span>
        </div>
      </div>
    </div>

    <!-- 主要内容区 -->
    <div class="content-container">
      <!-- 基本信息卡片 -->
      <van-cell-group class="info-group">
        <van-cell title="用户ID" :value="userdata?.uid" />
        <van-cell title="邮箱" :value="userdata?.email" is-link>
          <template #label>
            <van-badge
              :text="emailstatus ? '已验证' : '未验证'"
              :color="emailstatus ? '#4cd263' : '#ff9f43'"
              class="email-badge"
            />
          </template>
        </van-cell>
        <van-cell title="注册IP" :value="userdata?.regip" />
        <van-cell title="最后登录IP" :value="userdata?.lastip" />
        <van-cell
          title="私信设置"
          :value="onlyacceptfriendpm ? '仅接受好友私信' : '接受所有人私信'"
        />
      </van-cell-group>

      <!-- 积分详情 -->
      <van-collapse v-model="activeNames" class="credits-detail">
        <van-collapse-item name="1" title="积分详情">
          <van-cell-group>
            <van-cell
              title="灵气"
              :value="count?.extcredits1"
              label="论坛内基础积分，每日登录签到可获取，代表用户活跃度"
            />
            <van-cell
              title="妖灵币"
              :value="count?.extcredits2"
              label="论坛内基础流通货币，用于道具购买、会馆创建等"
            />
            <van-cell
              title="值钱玉佩"
              :value="count?.extcredits3"
              label="活动货币，通过参与各项活动获取，可兑换特殊物品"
            />
            <van-cell
              title="天明珠"
              :value="count?.extcredits4"
              label="贡献点，对论坛有贡献的内容将会被给予"
            />
          </van-cell-group>
        </van-collapse-item>
      </van-collapse>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent, computed } from "vue";
import store from "@/store";
import {
  Icon,
  Badge,
  Cell,
  CellGroup,
  Grid,
  GridItem,
  Collapse,
  CollapseItem,
} from "vant";

// 定义用户组信息接口
interface GroupInfo {
  [key: number]: string;
}

export default defineComponent({
  name: "UserInfoMobile",
  components: {
    [Icon.name]: Icon,
    [Badge.name]: Badge,
    [Cell.name]: Cell,
    [CellGroup.name]: CellGroup,
    [Grid.name]: Grid,
    [GridItem.name]: GridItem,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
  },
  setup() {
    // 从store获取用户数据（修复数据获取路径）
    const userState = store.state.user || {};
    const userdata = store.state.user?.info?.user || {};
    const count = store.state.user?.info?.count || {};
    const activeNames = ref(["1"]);

    // 用户组信息映射
    const groupMap: GroupInfo = {
      1: "禁灵",
      2: "锁灵",
      3: "物质灵",
      4: "生灵",
      5: "精灵",
      6: "妖灵",
      7: "仙灵",
      8: "神灵",
    };

    // 计算属性 - 用户组名称
    const userGroup = computed(() => {
      return groupMap[userdata.groupid] || "普通用户";
    });

    // 计算属性 - 状态文本
    const statusText = computed(() => {
      return userdata.status === 0 ? "正常" : "禁用";
    });

    // 计算属性 - 状态样式
    const statusClass = computed(() => {
      return userdata.status === 0 ? "status-normal" : "status-banned";
    });

    // 计算属性 - 新私信数量
    const newPmCount = computed(() => {
      try {
        const pmData = JSON.parse(userdata.newpm || "[]");
        return pmData.length;
      } catch (e) {
        return 0;
      }
    });

    // 解构用户数据方便使用
    const { emailstatus = 0, onlyacceptfriendpm = 0 } = userdata;

    return {
      userdata,
      count,
      userGroup,
      statusText,
      statusClass,
      newPmCount,
      emailstatus,
      onlyacceptfriendpm,
      activeNames,
    };
  },
});
</script>

<style lang="scss" scoped>
.user-info-page {
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  margin: 110px 10px 20px 10px;
  max-width: calc(800px - 20px);
  margin: 110px auto;
}

// 用户卡片
.user-card {
  width: 93%;
  max-width: 400px;
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  margin: 0 auto;
}

// 头像区域
.avatar-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto -15px;
  top: -50px;
}

.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 4px solid #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  object-fit: cover;
}

// 用户基本信息
.user-basic {
  padding-top: 5px;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.user-status {
  font-size: 13px;
  margin-bottom: 10px;
}

.status-normal {
  color: #4cd263;
}

.status-banned {
  color: #ff4d4f;
}

// 用户元数据
.user-meta {
  display: flex;
  justify-content: center;
  gap: 15px;
  padding: 8px 0;
  border-top: 1px dashed #f0f0f0;
  font-size: 12px;
  color: #86909c;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 3px;
}

// 内容容器
.content-container {
  width: 94%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

// 信息组样式
.info-group {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  >>> .van-cell {
    padding-left: 15px;
    padding-right: 15px;
    font-size: 14px;

    &::after {
      right: 15px;
      left: 15px;
    }
  }
}

.email-badge {
  margin-left: 5px;
}

// 统计网格
.stats-grid {
  background-color: #fff;
  border-radius: 10px;
  padding: 10px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  >>> .van-grid-item {
    padding: 10px 0;

    >>> .van-grid-item__icon {
      font-size: 20px;
      margin-bottom: 5px;
    }

    >>> .van-grid-item__text {
      font-size: 12px;
      color: #86909c;
    }
  }
}

// 积分详情
.credits-detail {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);

  >>> .van-collapse-item__content {
    padding: 0;
  }

  >>> .van-cell {
    font-size: 14px;
  }

  >>> .van-cell__label {
    font-size: 12px;
    color: #86909c;
    line-height: 1.4;
  }
}
</style>
