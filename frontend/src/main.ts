import i18n from "@/lang";
import "vditor/dist/index.css";
import { createApp } from "vue";
import App from "./App";
import router from "./router";
import "./style.css";

// 禁止鼠标右键
// window.oncontextmenu = () => false;
// 禁止选中网页上内容
// window.onselectstart = () => false;

createApp(App).use(router).use(i18n).mount("#app");
