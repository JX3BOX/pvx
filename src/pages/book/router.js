import { createPageRouter } from "@/bootstrap/router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const Index = () => import("@/views/book/Index.vue");
const Single = () => import("@/views/book/Single.vue");
const MobileIndex = () => import("@/views/book/mobile/Index.vue");
const MobileSingle = () => import("@/views/book/mobile/Single.vue");

const routes = [
    { name: "index", path: "/", component: isMiniProgram() || isApp() ? MobileIndex : Index },
    { name: "single", path: "/:id([0-9]+_\\d+)", component: isMiniProgram() || isApp() ? MobileSingle : Single },
];

export default createPageRouter("/book", routes);
