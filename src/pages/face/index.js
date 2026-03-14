import router from "./router";
import store from "./store";
import App from "@/views/face/Face.vue";
import { mountPage } from "@/bootstrap/mountPage";

mountPage(App, {
    router,
    store,
});
