import { createPageRouter } from "@/bootstrap/router";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";

const List = () => import("@/views/pet/PetList.vue");
const Single = () => import("@/views/pet/PetSingle.vue");
const ListMobile = () => import("@/views/pet/mobile/PetList.vue");
const SingleMobile = () => import("@/views/pet/mobile/PetSingle.vue");
const Search = () => import("@/views/pet/mobile/PetSearch.vue");

const routes = [
    { name: "list", path: "/", component: isMiniProgram() || isApp() ? ListMobile : List },
    { name: "single", path: "/:id(\\d+)", component: isMiniProgram() || isApp() ? SingleMobile : Single },
    { name: "search", path: "/search", component: Search },
];

export default createPageRouter("/pet", routes);
