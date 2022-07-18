<template>
  <div class="user-avatar">
    <el-dropdown>
      <span class="el-dropdown-link">
        <el-avatar
          :size="40"
          src="https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fc-ssl.duitang.com%2Fuploads%2Fitem%2F202002%2F11%2F20200211170814_wcewk.jpg&refer=http%3A%2F%2Fc-ssl.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1647273684&t=0dc705e5470a69ba41aff9bf66f15b66"
        ></el-avatar>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item :icon="User">个人资料</el-dropdown-item>
          <el-dropdown-item :icon="Help">帮助与反馈</el-dropdown-item>
          <el-dropdown-item :icon="Link">关于</el-dropdown-item>
          <el-dropdown-item :icon="CircleClose">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { User, Help, CircleClose, Link } from '@element-plus/icons-vue'
export default defineComponent({
  name: 'UserAvatar',
  components: {
    User,
    Help,
    CircleClose,
    Link
  },
  setup() {
    return {
      User,
      Help,
      CircleClose,
      Link
    }
  }
})
</script>

<style scoped lang="less">
.user-avatar {
  margin-right: 72px;
  cursor: pointer;
}
</style>
