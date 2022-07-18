<template>
  <div class="login-page">
    <login-panel />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import LoginPanel from '@/components/LoginPanel/LoginPanel.vue'

export default defineComponent({
  name: 'Login',
  components: {
    LoginPanel
  }
})
</script>

<style scoped lang="less">
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: url('~@/assets/images/mh.jpg');
  background-size: 100%;
  background-position: center;
}
</style>
