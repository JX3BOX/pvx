import { createPageRouter } from "@/bootstrap/router";

const qqbot = () => import("@/views/qqbot/Detail.vue");

const routes = [{ name: "qqbot-pvx-detail", path: "/pvx", component: qqbot }];

export default createPageRouter("/qqbot", routes);
