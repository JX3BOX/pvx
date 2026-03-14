import { createPageRouter } from "@/bootstrap/router";

const List = () => import("@/views/adventure/AdventureList.vue");
const Single = () => import("@/views/adventure/AdventureSingle.vue");
const landscape = () => import("@/views/adventure/landscape.vue");
const portrait = () => import("@/views/adventure/portrait.vue");

const routes = [
    { name: "list", path: "/", component: List },
    { name: "single", path: "/:id(\\d+)", component: Single },
    {
        name: "treasure",
        path: "/treasure",
        redirect: () => {
            const isMobile = window.innerWidth <= 768;
            return isMobile ? "/treasure/portrait" : "/treasure/landscape";
        },
    },
    {
        name: "landscape",
        path: "/treasure/landscape",
        component: landscape,
        meta: {
            name: "横屏",
        },
    },
    {
        name: "portrait",
        path: "/treasure/portrait",
        component: portrait,
        meta: {
            name: "竖屏",
        },
    },
];

export default createPageRouter("/adventure", routes);
