<template>
    <CommonNav :force-show="true"></CommonNav>
    <CommonHeader></CommonHeader>
    <PvxPageShell class="p-adventure-treasure-landscape p-pvx-treasure">
        <main class="m-body m-pvx-treasure-layout" v-loading="loading">
            <PvxSurface v-if="!isLogin" class="m-pvx-treasure-state" padding="none">
                <PvxEmptyState
                    :title="$t('pages.adventure.treasure.ui.loginRequired')"
                    :description="$t('pages.adventure.treasure.ui.loginDescription')"
                >
                    <template #icon><UserFilled /></template>
                    <template #action>
                        <PvxActionButton :href="login_url">
                            {{ $t("pages.adventure.treasure.ui.goLogin") }}
                            <ArrowRight />
                        </PvxActionButton>
                    </template>
                </PvxEmptyState>
            </PvxSurface>

            <PvxSurface v-else-if="noRole" class="m-pvx-treasure-state" padding="none">
                <PvxEmptyState
                    :title="$t('pages.adventure.treasure.ui.noRole')"
                    :description="$t('pages.adventure.treasure.ui.noRoleDescription')"
                >
                    <template #icon><UserFilled /></template>
                    <template #action>
                        <PvxActionButton href="/team/role/bind">
                            {{ $t("pages.adventure.treasure.ui.bindRole") }}
                            <ArrowRight />
                        </PvxActionButton>
                    </template>
                </PvxEmptyState>
            </PvxSurface>

            <template v-else>
                <TreasureControlBar
                    variant="landscape"
                    :role-list="roleList"
                    :role="currentRole"
                    :camp="currentCamp"
                    :refreshing="refreshing"
                    :can-save="isOver"
                    :show-sync-hint="!isVirtual() && !isSync"
                    @update:role="currentRole = $event"
                    @update:camp="currentCamp = $event"
                    @refresh="onRefresh"
                    @role-setting="onRoleSet"
                    @save="saveAsImage"
                />

                <div class="m-pvx-treasure-art-scroll">
                    <div class="m-pvx-treasure-art-stage">
                        <div id="capture" ref="capture">
                            <LandscapeContent
                                :__img-root="__imgRoot"
                                :user-achievement="userAchievement"
                                :role-info="roleInfo"
                                :add-class="addClass"
                                :is-over="isOver"
                                :content-zoom="contentZoom"
                                :current-camp="currentCamp"
                                :reel-add-class="reelAddClass"
                                enable-detail-links
                            />
                        </div>
                    </div>
                </div>
            </template>
        </main>
    </PvxPageShell>
    <CommonFooter></CommonFooter>
</template>

<script>
import { getUserRoles, refreshAchievementsTask } from "@/service/adventure/treasure/index.js";
import treasureCommon from "@/assets/js/treasure/index.js";
import User from "@jx3box/jx3box-common/js/user";
import html2canvas from "html2canvas";
import { __Links, __cdn, __Root } from "@/utils/config";
import LandscapeContent from "./LandscapeContent.vue";
import CommonNav from "@/components/Nav_v5.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import TreasureControlBar from "@/components/adventure/TreasureControlBar.vue";
import { ArrowRight, UserFilled } from "@element-plus/icons-vue";
export default {
    name: "landscape",
    inject: ["__imgRoot", "__imgPath"],
    components: {
        LandscapeContent,
        CommonNav,
        ArrowRight,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSurface,
        TreasureControlBar,
        UserFilled,
    },
    data: () => ({
        addClass: false,
        reelAddClass: false,
        contentZoom: 1,
        userAchievement: false,
        roleList: [],
        noRole: false,
        currentRole: "",
        currentCamp: "hq",
        roleInfo: {},
        isLogin: User.isLogin(),
        virtualRole: {
            ...User.getInfo(),
            jx3id: 0,
            ID: ~~User.getInfo().uid,
        },
        isSync: false,
        isOver: false,
        loading: false,
        refreshing: false,
        startTimer: null,
        finishTimer: null,
        login_url: __Links.account.login + "?redirect=" + location.href,
    }),
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    watch: {
        currentRole: {
            deep: true,
            handler(val) {
                this.roleInfo = val;
                if (val.jx3id) {
                    this.loadRole(val.jx3id);
                }
            },
        },
        virtualRole: {
            immediate: true,
            deep: true,
            handler(virtualRole) {
                this.currentRole = virtualRole;
            },
        },
    },
    mounted() {
        // isphone
        const isPhone = window.innerWidth < 768;
        if (isPhone) {
            this.$router.push({ name: "portrait" });
            return;
        }
        if (this.isLogin) this.loadRoles();
    },
    beforeUnmount() {
        window.clearTimeout(this.startTimer);
        window.clearTimeout(this.finishTimer);
    },
    methods: {
        async loadRoles() {
            this.loading = true;
            try {
                const res = await getUserRoles();
                this.roleList = res.data?.data?.list?.filter((item) => !!item.player_id) || [];
                this.noRole = !this.roleList.length;
                if (this.roleList.length) {
                    this.currentRole = this.roleList.find((item) => item.is_default_role) || this.roleList[0];
                } else {
                    this.$message.error(this.$t("pages.adventure.treasure.ui.roleLoadEmpty"));
                }
            } catch (error) {
                this.noRole = true;
                this.$message.error(this.$t("pages.adventure.treasure.ui.roleLoadFailed"));
            } finally {
                this.loading = false;
            }
        },
        onRoleSet() {
            window.open(`${__Root}dashboard/role`, "_blank");
        },
        async onRefresh() {
            if (!this.currentRole?.name || this.refreshing) return;
            this.refreshing = true;
            try {
                await refreshAchievementsTask({
                    mode: "landscape",
                    role: this.currentRole.name,
                    server: this.currentRole.server,
                });
                this.$message.success(this.$t("pages.adventure.treasure.ui.refreshSuccess"));
            } catch (error) {
                this.$message.error(this.$t("pages.adventure.treasure.ui.refreshFailed"));
            } finally {
                this.refreshing = false;
            }
        },
        async saveAsImage() {
            const oldZoom = this.contentZoom;
            try {
                this.contentZoom = 1;
                await this.$nextTick();

                const element = this.$refs.capture;
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                });

                const img = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = img;
                a.download = "adventure-treasure-landscape.png";
                a.click();
            } catch (error) {
                this.$message.error(this.$t("pages.adventure.treasure.ui.saveFailed"));
            } finally {
                this.contentZoom = oldZoom;
            }
        },
        async loadRole(userJx3Id) {
            this.loading = true;
            try {
                const res = await treasureCommon(userJx3Id, {
                    locale: this.$i18n.locale,
                    noRecordText: this.$t("pages.adventure.treasure.ui.noRecord"),
                });
                this.isSync = !!userJx3Id;
                res.pet = this.splitArrayIntoChunks(res.pet, 5);
                res.normal = this.splitArrayIntoChunks(res.normal, 3);
                this.userAchievement = res;
                this.$nextTick((_) => {
                    this.addClass = false;
                    this.reelAddClass = "";
                    this.isOver = false;
                    window.clearTimeout(this.startTimer);
                    this.startTimer = window.setTimeout(() => {
                        this.start();
                    }, 500);
                });
            } catch (error) {
                this.$message.error(this.$t("pages.adventure.treasure.ui.dataLoadFailed"));
            } finally {
                this.loading = false;
            }
        },
        start() {
            this.addClass = true;
            this.reelAddClass = "start";
            window.clearTimeout(this.finishTimer);
            this.finishTimer = window.setTimeout(() => {
                this.isOver = true;
                this.addClass = false;
                this.reelAddClass = "";
            }, 3000);
        },
        isVirtual() {
            return !this.currentRole?.jx3id;
        },
        splitArrayIntoChunks(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        },
        getCdnImgUrl(img) {
            return `${__cdn}design/treasure/${img}`;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/adventure/treasure/pc/treasure.less";
@import "~@/assets/css/adventure/treasure/treasure-shell-theme.less";
</style>
