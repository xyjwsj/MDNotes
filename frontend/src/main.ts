import { createApp } from 'vue'
import App from './App'
import './style.css'
import router from "./router"
import 'vditor/dist/index.css'


// 禁止鼠标右键
// window.oncontextmenu = () => false;
// 禁止选中网页上内容
// window.onselectstart = () =>  false;

createApp(App)
    .use(router)
    .mount('#app')
