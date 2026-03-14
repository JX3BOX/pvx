import router from "./router";
import store from "./store";
import App from "@/views/pet/Pet.vue";
import { mountPage } from "@/bootstrap/mountPage";

mountPage(App, {
    router,
    store,
});
