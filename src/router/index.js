
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

import HomeView from '@/views/HomeView.vue'

const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/about', name: 'About', component: () => import('@/views/AboutView.vue') },
  { path: '/login', name: 'Login', component: () => import('@/views/member/LoginView.vue') },
  { path: '/signup', name: 'Signup', component: () => import('@/views/member/SignupView.vue') },
  { path: '/:catchAll(.*)', name: 'NotFound', component: () => import('@/views/error/NotFound.vue') },

  // 로그인이 필요한 메뉴
  { path: '/lecture/:category', name: 'Lecture', component: () => import('@/views/lecture/LectureView.vue'), meta: { requiresAuth: true } },
  { path: '/lecture/qna', name: 'Question', component: () => import('@/views/lecture/QuestionView.vue'), meta: { requiresAuth: true } },

  { path: '/recipe', name: 'Recipe', component: () => import('@/views/service/RecipeView.vue'), meta: { requiresAuth: true } },
  { path: '/tour', name: 'Tour', component: () => import('@/views/service/TourView.vue'), meta: { requiresAuth: true } },
  { path: '/weather', name: 'Weather', component: () => import('@/views/service/WeatherView.vue'), meta: { requiresAuth: true } },
  { path: '/weatherCity', name: 'WeatherCity', component: () => import('@/views/service/WeatherCityView.vue'), meta: { requiresAuth: true } },

  { path: '/guest', name: 'Guest', component: () => import('@/views/community/GuestView.vue'), meta: { requiresAuth: true } },
  { path: '/board', name: 'Board', component: () => import('@/views/community/BoardView.vue'), meta: { requiresAuth: true } },
  { path: '/photo', name: 'Photo', component: () => import('@/views/community/PhotoView.vue'), meta: { requiresAuth: true } },

  { path: '/faq', name: 'Faq', component: () => import('@/views/customer/FaqView.vue'), meta: { requiresAuth: true } },
  { path: '/notice', name: 'Notice', component: () => import('@/views/customer/NoticeView.vue'), meta: { requiresAuth: true } },
  { path: '/inquiry', name: 'Inquiry', component: () => import('@/views/customer/InquiryView.vue'), meta: { requiresAuth: true } },

  { path: '/album', name: 'Album', component: () => import('@/views/mypage/AlbumView.vue'), meta: { requiresAuth: true } },
  { path: '/schedule', name: 'Schedule', component: () => import('@/views/mypage/ScheduleView.vue'), meta: { requiresAuth: true } },
  { path: '/note', name: 'Note', component: () => import('@/views/mypage/NoteView.vue'), meta: { requiresAuth: true } },

  // ── ✅ 워크스페이스 (Weave) ─────────────────────────────────────
  {
    path: '/ws/:slug',
    name: 'workspace',
    component: () => import('@/views/workspace/WorkspaceView.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'ch/:channelId',
        name: 'channel',
        component: () => import('@/views/channel/ChatView.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'page/:pageId',
        name: 'page-editor',
        component: () => import('@/views/page/PageEditorView.vue'),
        meta: { requiresAuth: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 네비게이션 가드 설정 (기존 그대로)
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!authStore.auth.token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router