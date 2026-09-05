import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../view/HomeView.vue'
import Register from '../components/Registrasi.vue'
import Login from '../components/Login.vue'
import { useAuth } from '../composables/Useauth'

const router = createRouter({
  history: createWebHistory(),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },

    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }
    },

    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true }
    },

    {
      path: '/profile',
      name: 'profile',
      component: () => import('../components/profile/profile.vue'),
      meta: { requiresAuth: true }
    },

    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../view/Authcallbackview.vue')
    },

    {
      path: '/admin',
      component: () => import('../view/admin/adminlayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        {
          path: 'dashboard',
          name: 'dashboardmin',
          component: () => import('../components/admin/Dashboard/dashboardmin.vue'),
        },
        {
          path: 'Managementuser',
          name: 'Managementuser',
          component: () => import('../components/admin/profilemanage/ProfileManagement.vue'),
        },
        {
          path: 'Managementdata',
          name: 'Managementdata',
          component: () => import('../components/admin/Managementdata/PerangkatListrikTab.vue'),
        },
        {
          path: 'laporan',
          name: 'laporan',
          component: () => import('../components/admin/laporandata/Laporan.vue'),
        },

        {
          path: 'pengaturan',
          name: 'pengaturan',
          component: () => import('../components/admin/pengaturan/pengaturan.vue'),
      
        }
      ],
    }
  ]
})

router.beforeEach(async (to) => {
  const { user, profile, authLoading, initAuth, fetchProfileById, logout } = useAuth()

  if (authLoading.value) {
    await initAuth()
  }

  if (to.meta.requiresAuth) {
    if (!user.value) {
      return '/login'
    }
    if (!profile.value) {
      try {
        profile.value = await fetchProfileById(user.value.id)
      } catch {
        profile.value = null
      }
    }
    if (!profile.value) {
      await logout()
      return '/register'
    }
  }

  if (to.meta.requiresAdmin && profile.value?.role !== 'admin') {
    return '/'
  }

  if (to.meta.guestOnly && user.value && profile.value) {
    return '/'
  }

  return true
})

export default router