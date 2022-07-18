<template>
  <div class="recycle-bin">
    <file-list-header>
      <template #header-left>
        <h3>回收站</h3>
      </template>
    </file-list-header>
    <file-list-main
      page-env="bin"
      :files="recycleBinFiles.files"
      :folders="recycleBinFiles.folders"
      :total-file-length="fileLength"
    ></file-list-main>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useStore } from 'vuex'

import FileListHeader from '@/components/FileListHeader/FileListHeader.vue'
import FileListMain from '@/components/FileListMain/FileListMain.vue'

export default defineComponent({
  name: 'RecycleBin',
  components: {
    FileListHeader,
    FileListMain
  },
  setup() {
    const store = useStore()
    store.dispatch('file/getBinFilesAction')
    const recycleBinFiles = computed(() => store.state.file.recycleBinFiles)
    const fileLength = computed(
      () =>
        store.state.file.recycleBinFiles.files.length +
        store.state.file.recycleBinFiles.folders.length
    )
    return {
      recycleBinFiles,
      fileLength
    }
  }
})
</script>

<style scoped lang="less"></style>
