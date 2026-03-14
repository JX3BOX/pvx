import router from "./router";
import store from "./store";
import App from "@/views/qqbot/Index.vue";
import { mountPage } from "@/bootstrap/mountPage";


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

mountPage(App, {
    router,
    store,
});
