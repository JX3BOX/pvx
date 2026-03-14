import { createPageRouter } from "@/bootstrap/router";

const Index = () => import("@/views/reputation/Index.vue");
const Single = () => import("@/views/reputation/Single.vue");
const Search = () => import("@/views/reputation/Search.vue");

const routes = [
    {
        name: "reputation",
        path: "/",
        component: Index,
        meta: {
            sidebar: false,
        },
    },
    {
        name: "single",
        path: "/:id(\\d+)",
        component: Single,
    },
    {
        name: "search",
        path: "/search",
        component: Search,
    },
];

export default createPageRouter("/reputation", routes);
