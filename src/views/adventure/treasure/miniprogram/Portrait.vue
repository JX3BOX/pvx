<template>
    <div class="p-adventure-treasure-portrait">
        <div class="m-body">
            <template v-if="!isLogin">
                <div class="u-bind_role">
                    <el-empty description="您还没有登录" :image="__imgPath + `/img/common/empty.png`" :image-size="200">
                        <div class="u-btn el-button el-button--primary" @click="goLogin">
                            前往登录 <i class="el-icon-arrow-right"></i>
                        </div>
                    </el-empty>
                </div>
            </template>
            <template v-else-if="noRole">
                <div class="u-bind_role">
                    <el-empty
                        description="当前暂未绑定角色"
                        :image="__imgPath + `/img/common/empty.png`"
                        :image-size="200"
                    >
                        <a class="u-btn el-button el-button--primary" href="/team/role/bind"
                            >前往绑定 <i class="el-icon-arrow-right"></i
                        ></a>
                    </el-empty>
                </div>
            </template>
            <template v-else>
                <div class="m-related-roles">
                    <el-select
                        v-model="currentRole"
                        value-key="ID"
                        placeholder="请选择当前角色"
                        :disabled="!isLogin"
                        popper-class="m-related-roles-options"
                        size="small"
                    >
                        <template #prefix>
                            <span class="u-prefix">
                                角色名称
                                <el-tooltip
                                    v-if="!isVirtual && !isSync"
                                    class="item"
                                    effect="dark"
                                    content="请先在游戏中同步成就"
                                    placement="top"
                                >
                                    <a href="/tool/74559" target="_blank"><i class="el-icon-warning-outline"></i></a>
                                </el-tooltip>
                            </span>
                        </template>
                        <el-option v-for="role in roleList" :key="role.ID" :value="role" :label="role.name">
                            <span class="u-role">
                                <span class="u-role-name"
                                    ><img class="u-role-icon" :src="showSchoolIcon(role.mount)" />{{ role.name }}</span
                                >
                                <span class="u-role-server">{{ role.server }}</span>
                            </span>
                        </el-option>
                    </el-select>
                    <el-select
                        v-model="currentCamp"
                        placeholder="请选择阵营"
                        popper-class="m-related-roles-options"
                        size="small"
                    >
                        <template #prefix>
                            <span class="u-prefix">所在阵营</span>
                        </template>
                        <el-option value="hq" label="浩气盟阵营"> </el-option>
                        <el-option value="er" label="恶人谷阵营"> </el-option>
                    </el-select>
                    <div class="u-action">
                        <el-tooltip content="刷新QQ机器人等渠道快照图片">
                            <el-button class="u-refresh" size="small" @click="onRefresh">
                                <i class="el-icon-refresh"></i>刷新卷轴</el-button
                            >
                        </el-tooltip>
                        <el-button class="u-role-setting" size="small" @click="onRoleSet">
                            <i class="el-icon-setting"></i>角色管理</el-button
                        >
                    </div>
                </div>

                <div id="capture" ref="capture" v-if="!noRole">
                    <PortraitContent
                        :__img-root="__imgRoot"
                        :user-achievement="userAchievement"
                        :role-info="roleInfo"
                        :add-class="addClass"
                        :is-over="isOver"
                        :content-zoom="contentZoom"
                        :current-camp="currentCamp"
                    ></PortraitContent>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
import { getUserRoles, refreshAchievementsTask } from "@/service/adventure/treasure/index.js";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import getData from "@/assets/js/treasure/index.js";
import User from "@jx3box/jx3box-common/js/user";
import html2canvas from "html2canvas";
import { __cdn, __Root } from "@/utils/config";
import PortraitContent from "./PortraitContent.vue";
import { isMiniProgram, isApp } from "@jx3box/jx3box-common/js/utils";
import { wxGoLogin } from "@/utils/minprogram";
export default {
    name: "portrait",
    inject: ["__imgRoot", "__imgPath"],
    components: {
        PortraitContent,
    },
    data: () => ({
        addClass: false,
        isOver: false,
        contentZoom: "",
        userAchievement: false,
        roleList: [],
        noRole: false,
        currentRole: "",
        currentCamp: "",
        roleInfo: {},
        isLogin: User.isLogin(),
        virtualRole: {
            ...User.getInfo(),
            jx3id: 0,
            ID: ~~User.getInfo().uid,
        },
        isSync: false,
        isMiniProgram: isMiniProgram() || isApp(),
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
        if (!this.isLogin) return;
        getUserRoles().then((res) => {
            if (res.data.data.list.length) {
                this.noRole = false;
                this.roleList =
                    res.data?.data?.list.filter((item) => {
                        return !!item.player_id;
                    }) || [];
                if (this.roleList.length) {
                    this.currentRole = this.roleList.find((item) => item.is_default_role) || this.roleList[0];
                }
            } else {
                this.noRole = true;
                try {
                    this.$message.error("未获取到角色信息");
                } catch (e) {
                    console.log(e);
                }
            }
        });
    },
    methods: {
        goLogin() {
            wxGoLogin();
        },
        onRoleSet() {
            window.open(`${__Root}dashboard/role`, "_blank");
        },
        onRefresh() {
            refreshAchievementsTask({
                mode: "portrait",
                role: this.currentRole.name,
                server: this.currentRole.server,
            }).then(() => {
                this.$message.success("刷新卷轴成功");
            });
        },
        async saveAsImage() {
            try {
                let oldZoom = this.contentZoom;
                this.contentZoom = 1;
                await new Promise((resolve) => {
                    this.$nextTick(() => {
                        resolve();
                    });
                });
                const element = this.$refs.capture;
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                });

                this.contentZoom = oldZoom;
                const img = canvas.toDataURL("image/png");
                const a = document.createElement("a");
                a.href = img;
                a.download = "downloaded-image.png";
                a.click();
            } catch (error) {
                console.error("Error saving image:", error);
            }
        },
        loadRole(userJx3Id) {
            getData(userJx3Id).then((res) => {
                this.isSync = !!userJx3Id;
                this.userAchievement = res;
                this.addClass = false;
                this.isOver = false;
                this.$nextTick((_) => {
                    this.start();
                });
            });
        },
        start() {
            this.addClass = true;
            setTimeout(() => {
                this.addClass = false;
                this.isOver = true;
            }, 2000);
            window.addEventListener("resize", this.handleScreenWidthChange);
            window.addEventListener("load", this.handleScreenWidthChange);
            this.handleScreenWidthChange();
        },
        isVirtual() {
            return !this.currentRole?.jx3id;
        },
        getImgUrl(item) {
            const client = "std";
            let tgaPath = item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            tgaPath = tgaPath.replace(/\/[^\/]+?\.tga$/, "");
            if (item.szRewardType === "camp")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/camp_${this.camp}_open.png`;
            if (item.szRewardType === "school")
                return `${this.__imgRoot}adventure/${client}/${tgaPath}/school_${this.force}_open.png`;
            return defaultImg;
        },
        handleScreenWidthChange() {
            var screenWidth = window.innerWidth - 40;
            var boxWidth = 900;
            var scale = screenWidth / boxWidth;
            var zoom = 1;
            if (screenWidth <= boxWidth) {
                zoom = scale;
            }
            this.contentZoom = zoom;
        },
        showSchoolIcon,
        getCdnImgUrl(img) {
            return `${__cdn}design/treasure/${img}`;
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/app.less";
@import "~@/assets/css/adventure/treasure/miniprogram/treasure.less";
</style>
