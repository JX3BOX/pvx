import { createApp } from "vue";
import ElementPlus from "element-plus";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import { install as installJx3boxUi } from "@jx3box/jx3box-ui";
import { installClipboardDirective } from "./clipboard";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import "@jx3box/jx3box-common/css/normalize.css";
import "element-plus/dist/index.css";
import "@/assets/css/tailwind.css";

let sharedInstalled = false;

function installShared(app, { useClipboard = false } = {}) {
    app.use(ElementPlus, {
        locale: zhCn,
    });
    installJx3boxUi(app);

    if (useClipboard) {
        installClipboardDirective(app);
    }
}

export function mountPage(App, { router, store, useClipboard = false, components = {} } = {}) {
    const app = createApp(App);

    if (router) app.use(router);
    if (store) app.use(store);

    installShared(app, { useClipboard });

    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component);
    }

    Object.entries(components).forEach(([name, component]) => {
        app.component(name, component);
    });

    if (!sharedInstalled) {
        sharedInstalled = true;
    }

    app.mount("#app");
    return app;
}
