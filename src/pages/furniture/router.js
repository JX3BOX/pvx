import { createPageRouter } from "@/bootstrap/router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const furnitureList = () => import("@/views/furniture/Index.vue");
const furnitureSingle = () => import("@/views/furniture/Single.vue");
const furnitureListMobile = () => import("@/views/furniture/mobile/index.vue");
const furnitureSingleMobile = () => import("@/views/furniture/mobile/Single.vue");

const routes = [
    {
        name: "furniture",
        path: "/",
        component: isMiniProgram() || isApp() ? furnitureListMobile : furnitureList,
        meta: {
            sidebar: false,
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: isMiniProgram() || isApp() ? furnitureSingleMobile : furnitureSingle,
    },
];

export default createPageRouter("/furniture", routes);
