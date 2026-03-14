import "animate.css";
import router from "./router";
import store from "./store";
import Pagination from "@/components/Pagination";
import App from "@/views/horse/Horse.vue";
import { mountPage } from "@/bootstrap/mountPage";

mountPage(App, {
    router,
    store,
    components: {
        Pagination,
    },
});
