<template>
    <div class="p-adventure-single" v-if="id" v-loading="loading">
        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{ hideType: hideType }">
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item" @click="showCatalogDrawer = true">
                        <img class="u-icon" src="@/assets/img/adventure/catalog_icon.svg" />
                        <span>导航目录</span>
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <!-- 导航目录 -->
        <el-drawer v-model="showCatalogDrawer" direction="btt" :with-header="false" :modal-append-to-body="false"
            append-to-body class="c-drawer p-adventure-drawer">
            <div class="u-drawer-title">导航</div>
            <div class="m-drawer-nav">
                <div class="u-nav-item" v-for="(item, index) in drawerNav" :key="index"
                    :class="drawerNavCurrentId === item.id ? 'is-active' : ''" v-show="item.show"
                    @click="drawerNavCurrentIdHref(item.id)">
                    {{ item.label }}
                </div>
            </div>
        </el-drawer>

        <div class="m-pvx-adventure-navigation m-navigation">
            <div class="u-goback" @click="goBack">返回列表</div>
            <PvxSingleAdminDrop></PvxSingleAdminDrop>
        </div>
        <div class="m-pvx-adventure-header">
            <span class="u-pvx-adventure-title">{{ title }}</span>
        </div>
        <div class="m-pvx-adventure-content">
            <task :id="id" :info="data" />
        </div>
        <PvxUserMiniprogram :id="achieve_id" name="奇遇" type="achievement">
        </PvxUserMiniprogram>
    </div>
</template>

<script>
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure/adventure";
import task from "@/components/adventure/task.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
export default {
    name: "adventureSingleMini",
    props: ["sourceId"],
    components: { task, PvxUserMiniprogram, SuspendCommon, PvxSingleAdminDrop },
    data: function () {
        return {
            hideType: ["collect", "rss", "laterOn", "pin", "user", "report"],
            type: "adventure",
            achieve_id: "",
            data: "",
            loading: false,
            showCatalogDrawer: false,
            drawerNav: [
                { label: "奇遇故事", id: "mini-task-container", show: true },
                { label: "攻略", id: "mini-wiki-post-panel", show: true },
                { label: "评论", id: "mini-wiki-comments", show: true },
            ],
            drawerNavCurrentId: "mini-task-container",
        };
    },
    computed: {
        id() {
            return this.$route.params.id || this.sourceId;
        },
        title() {
            return this.data?.szName || "";
        },
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                if (val) this.getData();
            },
        },
    },
    methods: {
        goBack() {
            this.$router.push({ name: "list" });
        },
        getData() {
            this.loading = true;
            getAdventure(this.id, { client: this.$store.state.client })
                .then((res) => {
                    this.data = res.data;
                    document.title = this.data.szName + this.$t("pages.common.appendTitle");
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
            getSerendipityAchievementId(this.id, { client: this.$store.state.client }).then((res) => {
                this.achieve_id = res.data?.achievement_id;
            });
        },
        drawerNavCurrentIdHref(id) {
            let nav = document.getElementById(id);
            if (nav) {
                nav.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        },
        handleScroll() {
            const navElements = this.drawerNav.map((item) => document.getElementById(item.id)).filter(Boolean);
            for (const nav of navElements) {
                const rect = nav.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    this.drawerNavCurrentId = nav.id;
                    break;
                }
            }
        },
    },
    mounted: function () {
        if (!document.getElementById("mini-wiki-comments")) {
            this.drawerNav[2].show = false;
        }
        window.addEventListener("scroll", this.handleScroll);
    },
    unmounted() {
        window.removeEventListener("scroll", this.handleScroll);
    },
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/miniprogram/single.less";
@import "~@/assets/css/common/drawer.less";
</style>
