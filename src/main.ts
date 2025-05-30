import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import AIcon from '@/components/AIcon.vue';

const app = createApp(App);

app.use(store);
app.use(router);
app.use(Antd)
app.component('AIcon', AIcon)

app.mount('#app');
