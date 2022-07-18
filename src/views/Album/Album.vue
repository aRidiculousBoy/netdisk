<template>
  <div class="album">
    <file-list-header>
      <template #header-left>
        <h2>相册</h2>
      </template>
    </file-list-header>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import FileListHeader from '@/components/FileListHeader/FileListHeader.vue'
import FileListMain from '@/components/FileListMain/FileListMain.vue'
export default defineComponent({
  name: 'Album',
  components: {
    FileListHeader,
    FileListMain
  }
})
</script>

<style scoped lang="less"></style>
