<template>
  <div>
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item
        v-for="route in routes"
        :key="route.path"
        :to="route.path"
      >
        {{ route.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
export default defineComponent({
  name: 'BreadCrumb',
  props: {
    routes: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    return {
      ArrowRight
    }
  }
})
</script>

<style scoped lang="less">
&:deep(.el-breadcrumb__inner) {
  font-size: 18px;
  color: #25262b !important;
  font-weight: 700 !important;
}
</style>
