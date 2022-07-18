<template>
  <div class="file-list-header">
    <!-- 面包屑 -->
    <div class="left">
      <slot name="header-left"></slot>
    </div>
    <div class="right">
      <slot name="header-right"></slot>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FileListHeader'
})
</script>

<style scoped lang="less">
.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
  .right {
    display: flex;
    margin-right: 64px;
    align-items: center;
  }
}
</style>
