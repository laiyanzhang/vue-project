import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
import AIcon from '@/components/AIcon.vue';
import i18n from './locales/index'

const app = createApp(App);

app.use(store);
app.use(router);
app.use(Antd)
app.use(i18n);
app.component('AIcon', AIcon)

app.mount('#app');
