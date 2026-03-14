import { createPageRouter } from "@/bootstrap/router";

const routes = [
    {
        name: "pvx",
        path: "/",
        component: () => import("@/views/index/Index.vue"),
        meta: {
            sidebar: false,
        },
    },
];

export default createPageRouter("/pvx", routes);
