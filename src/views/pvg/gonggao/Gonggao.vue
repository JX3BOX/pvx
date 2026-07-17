<template>
    <div
        class="p-gonggao"
        :class="{
            'is-modern': isModernPage,
            'is-daily': active === 'daily',
            'is-calendar': active === 'calendar',
            'is-server': active === 'server',
        }"
    >
        <PvxPageShell v-if="isModernPage" class="p-pvx-gonggao-daily">
            <div class="m-pvx-gonggao-daily__layout">
                <PvxSurface class="m-pvx-gonggao-daily__hero" padding="medium">
                    <PvxSectionHeader
                        :title="$t('pages.pvg.gonggao.ui.title')"
                        :description="$t('pages.pvg.gonggao.ui.description')"
                        level="h1"
                    >
                        <template #icon><Calendar /></template>
                        <template #action>
                            <span class="u-today-badge">
                                <Calendar />
                                {{ contextLabel }}
                            </span>
                        </template>
                    </PvxSectionHeader>
                </PvxSurface>

                <PvxToolbar class="m-pvx-gonggao-daily__toolbar">
                    <nav class="m-pvx-gonggao-daily__tabs" :aria-label="$t('pages.pvg.gonggao.ui.navigation')">
                        <router-link
                            v-for="item in tabs"
                            :key="item.value"
                            :to="item.to"
                            class="u-tab"
                            :class="{ 'is-active': active === item.value }"
                            :aria-current="active === item.value ? 'page' : undefined"
                        >
                            {{ item.label }}
                        </router-link>
                    </nav>
                </PvxToolbar>

                <main class="m-pvx-gonggao-daily__content">
                    <router-view></router-view>
                </main>
            </div>
        </PvxPageShell>

        <template v-else>
            <CommonToolbar
                class="m-gonggao-tabs"
                color="#53b27f"
                :types="tabs"
                :active="active"
                @update="updateToolbar"
            />
            <div class="m-content">
                <router-view></router-view>
            </div>
        </template>
    </div>
</template>

<script>
import { getMyFocusServers, getAllServers } from "@/service/pvg/server.js";
import CommonToolbar from "@/components/common/toolbar.vue";
import serverStd from "@jx3box/jx3box-data/data/server/server_std.json";
import serverOrigin from "@jx3box/jx3box-data/data/server/server_origin.json";
import serverInternational from "@jx3box/jx3box-data/data/server/server_international.json";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import { Calendar } from "@element-plus/icons-vue";

export default {
    name: "Gonggao",
    components: {
        CommonToolbar,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        PvxToolbar,
        Calendar,
    },
    data() {
        return {
            serverList: [],
        };
    },
    computed: {
        heatStateArr() {
            return [
                {
                    value: "6",
                    label: this.$t("pages.pvg.gonggao.ui.server.good"),
                    class: "is-open",
                },
                {
                    value: "7",
                    label: this.$t("pages.pvg.gonggao.ui.server.busy"),
                    class: "is-busy",
                },
                {
                    value: "8",
                    label: this.$t("pages.pvg.gonggao.ui.server.full"),
                    class: "is-full-load",
                },
                {
                    value: "3",
                    label: this.$t("pages.pvg.gonggao.ui.server.maintenance"),
                    class: "is-close",
                },
            ];
        },
        tabs() {
            const today = new Date();
            return [
                {
                    value: "daily",
                    label: this.$t("pages.pvg.gonggao.ui.tabs.daily"),
                    to: { name: "daily" },
                },
                {
                    value: "calendar",
                    label: this.$t("pages.pvg.gonggao.ui.tabs.calendar"),
                    to: {
                        name: "calendar",
                        params: {
                            year: today.getFullYear(),
                            month: today.getMonth() + 1,
                            date: today.getDate(),
                        },
                    },
                },
                {
                    value: "server",
                    label: this.$t("pages.pvg.gonggao.ui.tabs.server"),
                    to: { name: "server" },
                },
            ];
        },
        active() {
            return this.$route.name;
        },
        isDaily() {
            return this.active === "daily";
        },
        isModernPage() {
            return ["daily", "calendar", "server"].includes(this.active);
        },
        contextLabel() {
            if (this.isDaily) return this.$t("pages.pvg.gonggao.ui.today");
            return this.tabs.find((item) => item.value === this.active)?.label || "";
        },
        uid() {
            return this.$store.state.uid;
        },
        client() {
            return this.$store.state.client;
        },
    },
    methods: {
        // 获取服务器列表
        loadAllServers() {
            getAllServers().then((res) => {
                let mainServerList = (res.data || [])
                    .map((server) => {
                        return {
                            ...server,
                            connect_state_name: this.heatStateArr.find((item) => item.value === server.heat)?.label || "",
                            connect_state_class: this.heatStateArr.find((item) => item.value === server.heat)?.class || "",
                        };
                    })
                    .filter((server) => this.cansee(server));

                this.serverList = mainServerList;
                this.$store.commit("setServerList", this.serverList);
                if (this.uid) {
                    getMyFocusServers().then((data) => {
                        this.serverFav(data);
                    });
                }
            });
        },
        cansee(server) {
            const zoneName = server?.zone_name || "";
            const serverName = server?.main_server || server?.server_name || "";
            const clientType = zoneName === "缘起大区" ? "origin" : "std";
            const serverList = clientType === "origin" ? serverOrigin : [...serverStd, ...serverInternational];
            return this.client === clientType && serverList.includes(serverName);
        },
        //转服务器数据 str转换成obj
        serverFav(data) {
            if (!data) return;
            data = data.split(",");
            const favList = [];
            this.serverList.forEach((k) => {
                if (data.includes(k.main_server)) {
                    favList.push(k);
                }
            });
            this.$store.commit("setFavList", favList);
        },
        updateToolbar(data) {
            const { type } = data;
            if (!type || type === this.active) return;
            const target = this.tabs.find((item) => item.value === type)?.to;
            if (target) this.$router.push(target);
        },
    },
    created() {
        this.loadAllServers();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/modules/gonggao-daily-theme.less";
@import "~@/assets/css/modules/gonggao-calendar-theme.less";
@import "~@/assets/css/modules/gonggao-server-theme.less";

.p-gonggao {
    .pt(40px);
    .m-content {
        .pt(20px);
    }
}
.v-miniprogram,.wechat-miniprogram{
    .p-gonggao{
        padding-top:0;
    }
}
</style>
