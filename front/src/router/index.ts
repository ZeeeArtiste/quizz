import { createRouter, createWebHistory } from 'vue-router'
import CreateQuizzView from '../views/CreateQuizzView.vue'
import QuizzView from '../views/QuizzView.vue'
import LoginView from '../views/LoginView.vue'
import HandleAccountView from '../views/HandleAccountView.vue'
import { isAuthenticated } from '@/utils'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/creer-quizz',
      name: 'createQuizz',
      component: CreateQuizzView,
      meta: { requiresAuth: true }
    },
    { path: '/quizz/:id', component: QuizzView },
    {
      path: '/quizz/edit/:id',
      component: CreateQuizzView,
      meta: { requiresAuth: true }
    },
    { path: '/login', component: LoginView },
    { path: '/creer-compte', component: HandleAccountView },
  ]
});

router.beforeEach(async (to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth) && !await isAuthenticated(router)) {
    next({ path: '/login', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});


export default router;
