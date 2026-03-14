import { createPageRouter } from "@/bootstrap/router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const Index = () => import("@/views/horse/Index.vue");
const Single = () => import("@/views/horse/HorseSingle.vue");
const IndexMobile = () => import("@/views/horse/mobile/Index.vue");
const SingleMobile = () => import("@/views/horse/mobile/HorseSingle.vue");

const routes = [
    { name: "index", path: "/", component: isMiniProgram() || isApp() ? IndexMobile : Index },
    { name: "single", path: "/:id([0-9]_\\d+)", component: isMiniProgram() || isApp() ? SingleMobile : Single },
];

export default createPageRouter("/horse", routes);
