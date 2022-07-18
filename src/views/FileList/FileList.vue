<template>
  <div class="file-list">
    <file-list-header>
      <template #header-left>
        <bread-crumb :routes="routes"></bread-crumb>
      </template>
      <template #header-right>
        <!-- 搜索 -->
        <div class="search-icon-container">
          <img src="../../assets/svgs/search.svg" style="display: block; width: 22px; height: 22px"
            class="search-icon" />
        </div>
        <!-- 上传组件 -->
        <upload></upload>
      </template>
    </file-list-header>
    <file-list-main :files="files" :folders="folders" :total-file-length="totalFileLength" page-env="filelist"
      @onFileClick="onFileClickHandler"></file-list-main>
  </div>
</template>

<script>
import { defineComponent, watch, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'
import FileListHeader from '@/components/FileListHeader/FileListHeader.vue'
import FileListMain from '@/components/FileListMain/FileListMain.vue'
import BreadCrumb from '@/components/BreadCrumb/BreadCrumb.vue'
import Upload from '@/components/Upload/Upload.vue'
import localCache from '@/utils/cache.js'

export default defineComponent({
  name: 'FileList',
  components: {
    FileListHeader,
    FileListMain,
    BreadCrumb,
    Upload
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const files = computed(() => store.state.file.currentFileList.files)
    const folders = computed(() => store.state.file.currentFileList.folders)

    const rawRoutes = localCache.getCache('routes') || [
      ...route.matched[1].meta.routes
    ]
    const routes = ref(rawRoutes)

    const totalFileLength = computed(
      () => files.value.length + folders.value.length
    )

    const onFileClickHandler = (payload) => {
      if (payload.folderId) {
        // pushstate
        router.push('/home/filelist/' + payload.folderId)
      } else {
        // 执行预览操作
        console.log('执行预览操作')
      }
    }

    watch(
      () => route.params,
      (newParams) => {
        if (newParams.id) {
          // 处理面包屑导航逻辑
          const hasRoute = routes.value.some(
            (route) => route.path === '/home/filelist/' + newParams.id
          )
          if (!hasRoute) {
            const folder = folders.value.find(
              (folder) => String(folder.folderId) === newParams.id
            )
            routes.value.push({
              title: folder?.folderName || '',
              path: '/home/filelist/' + newParams.id,
              id: newParams.id
            })
            localCache.setCache('routes', routes.value)
          } else {
            // not has route?
            const index = routes.value.findIndex(
              (route) => String(route.id) === newParams.id
            )
            routes.value.splice(index + 1)
            localCache.setCache('routes', routes.value)
          }
          // 处理文件夹路由跳转逻辑
          router.push('/home/filelist/' + newParams.id)
          store.dispatch('file/getCurrentFileListAction', newParams.id)
        }
      },
      {
        immediate: true
      }
    )
    return {
      files,
      folders,
      totalFileLength,
      routes,
      onFileClickHandler
    }
  }
})
</script>

<style scoped lang="less">
.file-list {
  background: #fff;
  padding: 4px;
}

.search-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin-right: 24px;

  &:hover {
    cursor: pointer;
    background-color: rgba(132, 133, 141, 0.08);
    border-radius: 50%;
  }
}
</style>
