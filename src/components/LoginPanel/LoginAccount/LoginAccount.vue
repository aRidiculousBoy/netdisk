<template>
  <div class="login-account">
    <el-form
      ref="accountFormRef"
      :model="account"
      :rules="accountFormRules"
      label-width="60px"
      size="large"
    >
      <el-form-item label="账户" prop="userName">
        <el-input v-model="account.userName" :prefix-icon="User" clearable />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="account.password"
          type="password"
          show-password
          :prefix-icon="Lock"
        />
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { defineComponent, reactive, ref } from 'vue'
import { User, Lock } from '@element-plus/icons-vue'
import localCache from '@/utils/cache.js'
import { useStore } from 'vuex'

export default defineComponent({
  name: 'LoginAccount',
  defineComponent: {
    User,
    Lock
  },
  setup() {
    const store = useStore()
    const accountFormRef = ref(null)
    const account = reactive({
      userName: localCache.getCache('userName') || '',
      password: localCache.getCache('password') || ''
    })
    const accountFormRules = {
      userName: [
        {
          required: true,
          message: '用户名不能为空~',
          trigger: 'blur'
        }
      ],
      password: [
        {
          required: true,
          message: '密码不能为空~',
          trigger: 'blur'
        }
      ]
    }
    const loginAction = (isKeepPassword) => {
      accountFormRef.value?.validate((valid) => {
        if (valid) {
          store.dispatch('login/accountLoginAction', {
            account: {
              ...account
            },
            isKeepPassword
          })
        }
      })
    }
    return {
      account,
      accountFormRef,
      accountFormRules,
      User,
      Lock,
      loginAction
    }
  }
})
</script>

<style scoped lang="less">
.login-account {
  width: 100%;
  height: 100%;
}
.el-input {
  width: 96%;
}
</style>
