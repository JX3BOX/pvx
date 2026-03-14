import { createRouter, createWebHistory } from "vue-router";

export function createPageRouter(base, routes) {
    const router = createRouter({
        history: createWebHistory(base),
        routes,
        scrollBehavior(to, from, savedPosition) {
            if (savedPosition) {
                return savedPosition;
            }

            return {
                left: 0,
                top: 0,
            };
        },
    });

    router.beforeEach((to) => {
        if (to.fullPath.includes("/#")) {
            return to.fullPath.replace("/#", "");
        }
        return true;
    });

    return router;
}
