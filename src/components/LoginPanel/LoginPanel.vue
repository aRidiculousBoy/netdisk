<template>
  <div class="login-panel" @keyup.enter="doLogin">
    <img src="../../assets/images/CloudTechlogodesign.png" class="logo" />
    <h1 class="title">NetDisk</h1>
    <login-account ref="accountRef" />
    <el-button type="primary" size="large" @click="doLogin"> 登录 </el-button>
    <div class="password-about">
      <el-checkbox v-model="isKeepPassword" label="记住密码" size="large" />
      <el-link>忘记密码?</el-link>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import LoginAccount from './LoginAccount/LoginAccount.vue'

export default defineComponent({
  name: 'LoginPanel',
  components: { LoginAccount },
  setup() {
    const isKeepPassword = ref(false)
    const accountRef = ref(null)
    const doLogin = () => {
      accountRef.value?.loginAction(isKeepPassword.value)
    }
    return {
      isKeepPassword,
      doLogin,
      accountRef
    }
  }
})
</script>

<style scoped lang="less">
.login-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 444px;
  margin-bottom: 108px;
  box-shadow: 10px 10px 10px rgba(0, 0, 0, 0.3);
  border-radius: 12px;
  background-color: #fff;
  text-align: center;
  .title {
    text-align: center;
    padding-top: 32px;
  }
  .el-button {
    width: 64%;
    border-radius: 32px;
  }
  .password-about {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 70%;
    height: 64px;
  }

  .logo {
    position: absolute;
    box-shadow: 3px 2px 2px rgba(0, 0, 0, 0.3);
    width: 108px;
    height: 108px;
    top: -58px;
    border-radius: 64px;
  }
}
</style>
