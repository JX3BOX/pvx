import router from "./router";
import store from "./store";
import App from "@/views/pvg/Index.vue";
import { mountPage } from "@/bootstrap/mountPage";

mountPage(App, {
    router,
    store,
});
