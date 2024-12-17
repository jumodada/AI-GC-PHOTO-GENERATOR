import { createRouter, createWebHashHistory } from 'vue-router';


// Define routes
const routes = [
  { path: '/', name: 'photo', component: () => import('@/views/home/take.vue') },
  // { path: '/lock', name: 'lock', component: () => import('@/views/home/lock.vue') },


  // 404
  { path: "/:pathMatch(.*)*", name: '404', component: () => import('@/views/404.vue') },
];


// Create router instance and pass the `routes` option
const router = createRouter({
  history: createWebHashHistory(),
  routes
});


export default router;