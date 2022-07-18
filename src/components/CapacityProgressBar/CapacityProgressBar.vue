<template>
  <div class="capacity-progress">
    <span class="capacity-text">239.62 GB / 1.18 TB</span>
    <el-progress
      :percentage="24"
      :format="format"
      :stroke-width="6"
    ></el-progress>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CapacityProgressBar',
  setup() {
    const format = (percentage) => {
      return percentage === 100 ? '满' : `${percentage}%`
    }
    return {
      format
    }
  }
})
</script>

<style scoped lang="less">
.capacity-text {
  font-size: 10px;
}

/deep/ .el-progress__text {
  font-size: 12px !important;
}
</style>
