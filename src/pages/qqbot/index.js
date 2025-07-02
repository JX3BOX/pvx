Vue.config.productionTip = false;

// 第三方UI组件
import Vue from "vue";
import ElementUI from "element-ui";
Vue.use(ElementUI);

// 通用UI模块
import JX3BOX_UI from "@jx3box/jx3box-common-ui";
import "@jx3box/jx3box-common/css/element.css";
import "@jx3box/jx3box-common/css/normalize.css";
Vue.use(JX3BOX_UI);

import reporter from "@jx3box/jx3box-common/js/reporter";
reporter.install(Vue);

// 数据与路由
import router from "./router";
import store from "./store";

import App from "@/views/qqbot/Index.vue";


// 判断是否是需要移除 viewport 的特殊页面
const shouldRemoveViewport = () => {
  const href = window.location.href;

  // 你可以使用更复杂的匹配逻辑，例如：
  return href.includes("/pvx") && href.includes("type=treasure");
};

// 如果是特殊页面，删除 <meta name="viewport">
if (shouldRemoveViewport()) {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.remove();
  }
}

new Vue({
    router,
    store,
    render: (h) => h(App),
}).$mount("#app");
