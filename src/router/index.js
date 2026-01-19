import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/management',
  },
  {
    path: '/management',
    name: 'management',
    component: () => import('@/views/Management.vue'),
    meta: { title: 'Управление автостоянкой' },
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: () => import('@/views/Reservations.vue'),
    meta: { title: 'Бронирование и оплата' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
