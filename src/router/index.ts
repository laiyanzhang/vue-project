import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/about",
    name: "about",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "about" */ "../views/AboutView.vue"),
  },
  {
    path: "/masonry",
    name: "masonry",
    component: () =>
      import(/* webpackChunkName: "masonry" */ "../views/demo/masonry.vue"),
  },
  {
    path: "/websocket",
    name: "websocket",
    component: () =>
      import(/* webpackChunkName: "masonry" */ "../views/demo/websocket.vue"),
  },
  {
    path: "/canvas",
    name: "canvas",
    component: () =>
      import(/* webpackChunkName: "masonry" */ "../views/demo/canvas.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
