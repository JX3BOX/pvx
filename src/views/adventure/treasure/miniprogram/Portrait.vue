<template>
    <CommonNav v-if="!isMiniProgram" :force-show="true" />
    <CommonHeader v-if="!isMiniProgram" />
    <PvxPageShell
        class="p-adventure-treasure-portrait p-pvx-treasure"
        :class="{ 'is-embedded': isMiniProgram }"
        :full-height="!isMiniProgram"
    >
        <main class="m-body m-pvx-treasure-layout" v-loading="loading">
            <PvxSurface v-if="!isLogin" class="m-pvx-treasure-state" padding="none">
                <PvxEmptyState
                    :title="$t('pages.adventure.treasure.ui.loginRequired')"
                    :description="$t('pages.adventure.treasure.ui.loginDescription')"
                >
                    <template #icon><UserFilled /></template>
                    <template #action>
                        <PvxActionButton @click="goLogin">
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
                    variant="portrait"
                    :role-list="roleList"
                    :role="currentRole"
                    :camp="currentCamp"
                    :refreshing="refreshing"
                    :show-sync-hint="!isVirtual() && !isSync"
                    :show-sync-action="false"
                    :show-save-action="false"
                    @update:role="currentRole = $event"
                    @update:camp="currentCamp = $event"
                    @refresh="onRefresh"
                    @role-setting="onRoleSet"
                />

                <div ref="stageScroll" class="m-pvx-treasure-art-scroll">
                    <div class="m-pvx-treasure-art-stage">
                        <div id="capture" ref="capture">
                            <PortraitContent
                                :__img-root="__imgRoot"
                                :user-achievement="userAchievement"
                                :role-info="roleInfo"
                                :add-class="addClass"
                                :is-over="isOver"
                                :content-zoom="contentZoom"
                                :current-camp="currentCamp"
                                :enable-detail-links="!isMiniProgram"
                            />
                        </div>
                    </div>
                </div>
            </template>
        </main>
    </PvxPageShell>
    <CommonFooter v-if="!isMiniProgram" />
</template>

<script>
import { getUserRoles, refreshAchievementsTask } from "@/service/adventure/treasure/index.js";
import getData from "@/assets/js/treasure/index.js";
import User from "@jx3box/jx3box-common/js/user";
import { __Links, __Root } from "@/utils/config";
import PortraitContent from "./PortraitContent.vue";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import { wxGoLogin } from "@/utils/minprogram";
import CommonNav from "@/components/Nav_v5.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import TreasureControlBar from "@/components/adventure/TreasureControlBar.vue";
import { ArrowRight, UserFilled } from "@element-plus/icons-vue";
export default {
    name: "portrait",
    inject: ["__imgRoot", "__imgPath"],
    components: {
        ArrowRight,
        CommonNav,
        PortraitContent,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSurface,
        TreasureControlBar,
        UserFilled,
    },
    data: () => ({
        addClass: false,
        isOver: false,
        contentZoom: "",
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
        isMiniProgram: isMiniProgram() || isApp(),
        loading: false,
        refreshing: false,
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
    created() {
        if (this.isMiniProgram && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            const elements = document.getElementsByClassName("v-miniprogram");
            for (let el of elements) {
                el.style.removeProperty("font-size");
                el.style.fontSize = "16px";
            }
        }
    },
    mounted() {
        window.addEventListener("resize", this.handleScreenWidthChange);
        this.handleScreenWidthChange();
        if (this.isLogin) this.loadRoles();
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleScreenWidthChange);
        window.clearTimeout(this.finishTimer);
    },
    methods: {
        goLogin() {
            if (this.isMiniProgram) {
                wxGoLogin();
                return;
            }
            window.location.href = this.login_url;
        },
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
                    mode: "portrait",
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
        async loadRole(userJx3Id) {
            this.loading = true;
            try {
                const res = await getData(userJx3Id, {
                    locale: this.$i18n.locale,
                    noRecordText: this.$t("pages.adventure.treasure.ui.noRecord"),
                });
                this.isSync = !!userJx3Id;
                this.userAchievement = res;
                this.addClass = false;
                this.isOver = false;
                this.$nextTick((_) => {
                    this.start();
                });
            } catch (error) {
                this.$message.error(this.$t("pages.adventure.treasure.ui.dataLoadFailed"));
            } finally {
                this.loading = false;
            }
        },
        start() {
            this.addClass = true;
            window.clearTimeout(this.finishTimer);
            this.finishTimer = window.setTimeout(() => {
                this.addClass = false;
                this.isOver = true;
            }, 2000);
            this.handleScreenWidthChange();
        },
        isVirtual() {
            return !this.currentRole?.jx3id;
        },
        handleScreenWidthChange() {
            this.$nextTick(() => {
                const availableWidth = this.$refs.stageScroll?.clientWidth || window.innerWidth - 32;
                this.contentZoom = Math.max(0.3, Math.min(1, (availableWidth - 8) / 940));
            });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/adventure/treasure/miniprogram/treasure.less";
@import "~@/assets/css/adventure/treasure/treasure-shell-theme.less";
</style>
