import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

export const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "首页",
    component: HomeView,
  },
  {
    path: "/masonry",
    name: "瀑布流",
    component: () =>
      import(/* webpackChunkName: "masonry" */ "../views/masonry.vue"),
  },
  {
    path: "/websocket",
    name: "webSocket",
    component: () =>
      import(/* webpackChunkName: "websocket" */ "../views/websocket.vue"),
  },
  {
    path: "/canvas",
    name: "画布",
    component: () =>
      import(/* webpackChunkName: "canvas" */ "../views/canvas.vue"),
  },
  {
    path: "/animation",
    name: "动画",
    component: () =>
      import(/* webpackChunkName: "animation" */ "../views/animation.vue"),
  },
  {
    path: "/imageView",
    name: "图片预览",
    component: () =>
      import(/* webpackChunkName: "imageView" */ "../views/imageView.vue"),
  },
  {
    path: "/worker",
    name: "webWorker",
    component: () =>
      import(/* webpackChunkName: "worker" */ "../views/worker.vue"),
  },
  {
    path: "/editor",
    name: "编辑器",
    component: () =>
      import(/* webpackChunkName: "worker" */ "../views/editor.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
