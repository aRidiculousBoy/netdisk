<template>
  <div class="nav-bar">
    <div class="nav-bar-main">
      <el-menu
        text-color="#25262B"
        active-text-color="#25262B"
        background-color="#f5f5f6"
        :default-active="currentIndex"
        router
        @select="selectHandler"
      >
        <el-menu-item
          index="/home/filelist/0"
          :class="{ 'active-menu-item': '/home/filelist/0' === currentIndex }"
        >
          <el-icon>
            <folder />
          </el-icon>
          <span>文件</span>
        </el-menu-item>
        <el-menu-item index="/home/album">
          <el-icon>
            <picture-rounded />
          </el-icon>
          <span>相册</span>
        </el-menu-item>
        <el-menu-item index="2">
          <el-icon>
            <refrigerator />
          </el-icon>
          <span>收藏夹</span>
        </el-menu-item>
        <el-menu-item
          index="/home/recyclebin"
          :class="{ 'active-menu-item': '/home/recyclebin' === currentIndex }"
        >
          <el-icon>
            <delete />
          </el-icon>
          <span>回收站</span>
        </el-menu-item>
        <el-menu-item index="4">
          <el-icon>
            <share />
          </el-icon>
          <span>分享</span>
        </el-menu-item>
        <el-menu-item index="5">
          <el-icon>
            <paperclip />
          </el-icon>
          <span>皮肤中心</span>
        </el-menu-item>
      </el-menu>
    </div>
    <div class="nav-bar-bottom">
      <capacity-progress-bar></capacity-progress-bar>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  Folder,
  Delete,
  Share,
  PictureRounded,
  Refrigerator,
  Paperclip,
  Compass
} from '@element-plus/icons-vue'
import CapacityProgressBar from '@/components/CapacityProgressBar/CapacityProgressBar.vue'
export default defineComponent({
  name: 'NavBar',
  components: {
    Folder,
    Delete,
    Share,
    PictureRounded,
    Refrigerator,
    CapacityProgressBar,
    Paperclip,
    Compass
  },
  setup() {
    const route = useRoute()
    const currentIndex = ref(route.path)
    const selectHandler = (e) => {
      currentIndex.value = e
    }
    return {
      currentIndex,
      selectHandler
    }
  }
})
</script>

<style scoped lang="less">
.nav-bar {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  .el-menu {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.active-menu-item {
  background-color: rgba(0, 0, 0, 0.05);
}

.el-menu-item {
  width: 90%;
  height: 52px;
  border-radius: 6px;
  &:hover {
    width: 86%;
    transform: scale(1.111);
    background-color: rgba(132, 133, 141, 0.08);
    margin-top: 2px;
    transition: 0.3s all linear;
    border-radius: 8px;
  }
}

.nav-bar-bottom {
  margin-bottom: 64px;
  margin-left: 30px;
}
</style>
