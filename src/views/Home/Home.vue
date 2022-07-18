<template>
  <div class="home-page">
    <el-container class="main-content">
      <el-header class="header-content">
        <div class="logo">Logo</div>
        <user-avatar></user-avatar>
      </el-header>
      <el-container>
        <el-aside width="244px" class="aside-bar">
          <nav-bar></nav-bar>
        </el-aside>
        <el-main class="page-content">
          <router-view></router-view>
        </el-main>
      </el-container>
      <div v-if="showStatusBar" class="status-bar">
        <status-bar></status-bar>
      </div>
    </el-container>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import UserAvatar from '@/components/UserAvatar/UserAvatar.vue'
import StatusBar from '@/components/StatusBar/StatusBar.vue'
import NavBar from '@/components/NavBar/NavBar.vue'
import { useStore } from 'vuex'
export default defineComponent({
  name: 'Home',
  components: {
    UserAvatar,
    NavBar,
    StatusBar
  },
  setup() {
    const store = useStore()
    const showStatusBar = computed(() =>
      !!store.state.file.fileList.length
    )

    return {
      showStatusBar
    }
  }
})
</script>

<style scoped lang="less">
.home-page {
  width: 100%;
  height: 100%;

  .main-content {
    height: 100%;

    .page-content {
      padding: 0 0 0 36px !important;
      background: #fff;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0;
      background-color: #fff;
      box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.5);
      border-bottom: 2px solid rgb(241, 241, 241);

      .logo {
        width: 216px;
        text-align: center;

        .logo-img {
          position: relative;
          width: 100%;
          bottom: 64px;
        }
      }
    }

    .aside-bar {
      background-color: rgb(245, 245, 246);
    }

    .status-bar {
      position: fixed;
      width: 384px;
      right: 24px;
      bottom: 24px;
    }
  }
}
</style>
