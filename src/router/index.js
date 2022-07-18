import { createRouter, createWebHistory } from 'vue-router'
import localCache from '@/utils/cache.js'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    name: 'Login',
    path: '/login',
    component: () => import(/* webpackChunkName: "login" */'@/views/Login/Login.vue')
  },
  {
    name: 'Home',
    path: '/home',
    component: () => import(/* webpackChunkName: "home" */'@/views/Home/Home.vue'),
    redirect: '/home/filelist',
    children: [
      {
        name: 'FileList',
        path: '/home/filelist',
        meta: {
          routes: [{
            title: '文件',
            path: '/home/filelist/0',
            id: 0
          }]
        },
        component: () => import(/* webpackChunkName: "filelist" */'@/views/FileList/FileList.vue'),
        redirect: '/home/filelist/0',
        children: [
          {
            path: '/home/filelist/:id',
            component: () => import('@/views/FileList/FileList.vue')
          }
        ]
      },
      {
        name: 'Album',
        path: '/home/album',
        meta: {
          title: '相册'
        }
      },
      {
        name: 'RecycleBin',
        path: '/home/recyclebin',
        component: () => import('@/views/RecycleBin/RecycleBin.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  if (to.path !== '/login') {
    const token = localCache.getCache('token')
    if (!token) {
      return '/login'
    }
  }
})

export default router
