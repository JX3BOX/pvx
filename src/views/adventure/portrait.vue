<template>
    <div class="m-body">
        <template v-if="!isLogin">
            <div class="u-bind_role">
                <el-empty description="您还没有登录" :image="__imgPath + `/img/common/empty.png`" :image-size="200">
                    <a class="u-btn el-button el-button--primary" :href="login_url"
                        >前往登录 <i class="el-icon-arrow-right"></i
                    ></a>
                </el-empty>
            </div>
        </template>
        <template v-else-if="noRole">
            <div class="u-bind_role">
                <el-empty description="当前暂未绑定角色" :image="__imgPath + `/img/common/empty.png`" :image-size="200">
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
                    <span slot="prefix" class="u-prefix">
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
                    <span slot="prefix" class="u-prefix">所在阵营</span>
                    <el-option value="hq" label="浩气盟阵营"> </el-option>
                    <el-option value="er" label="恶人谷阵营"> </el-option>
                </el-select>
                <el-button class="u-refresh" size="small" @click="onRefresh">
                    <i class="el-icon-refresh"></i>刷新卷轴</el-button
                >
            </div>

            <div id="capture" ref="capture" v-if="!noRole">
                <portraitContent
                    :__img-root="__imgRoot"
                    :user-achievement="userAchievement"
                    :role-info="roleInfo"
                    :add-class="addClass"
                    :is-over="isOver"
                    :content-zoom="contentZoom"
                    :current-camp="currentCamp"
                ></portraitContent>
            </div>
            <!-- <button v-if="isOver" @click="saveAsImage" class="u-btn m-hide el-button el-button--primary">
                保存图片
            </button> -->
        </template>
    </div>
</template>

<script>
import { getUserRoles, refreshAchievementsTask } from "@/service/adventure/treasure.js";
import { showSchoolIcon } from "@jx3box/jx3box-common/js/utils";
import getData from "@/assets/js/treasure.js";
import User from "@jx3box/jx3box-common/js/user";
import html2canvas from "html2canvas";
import { __Links, __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
import portraitContent from "./portraitContent.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "portrait",
    inject: ["__imgRoot", "__imgPath"],
    components: {
        portraitContent,
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
        login_url: __Links.account.login + "?redirect=" + location.href,
        isMiniProgram: isMiniProgram(),
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
                setTimeout(() => {
                    el.style.fontSize = "16px";
                    setTimeout(() => {
                        el.style.fontSize = "10px";
                    }, 10000);
                }, 10000);
            }

            let metaViewport = document.querySelector('meta[name="viewport"]');
            metaViewport.setAttribute("content", "");
            metaViewport.remove();
        }
    },
    mounted() {
        getUserRoles().then((res) => {
            if (res.data.data.list.length) {
                this.noRole = false;
                this.roleList =
                    res.data?.data?.list.filter((item) => {
                        return !!item.player_id;
                    }) || [];
                if (this.roleList.length) {
                    this.currentRole = this.roleList[0];
                }
            } else {
                this.noRole = true;
                this.$message.error("未获取到角色信息");
            }
        });
    },
    methods: {
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

                const element = this.$refs.capture; // 获取需要保存为图片的元素
                const canvas = await html2canvas(element, {
                    allowTaint: true,
                    useCORS: true,
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                }); // 将元素转换成canvas

                this.contentZoom = oldZoom;
                const img = canvas.toDataURL("image/png"); // 将canvas转换成图片数据
                const a = document.createElement("a"); // 创建一个a标签
                a.href = img; // 设置下载链接
                a.download = "downloaded-image.png"; // 设置下载文件名
                a.click(); // 模拟点击触发下载
            } catch (error) {
                console.error("Error saving image:", error);
            }
        },
        loadRole(userJx3Id) {
            getData(userJx3Id).then((res) => {
                this.isSync = !!userJx3Id; // 是否在游戏中同步
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
            // 是否是虚拟角色 - 魔盒账号
            return !this.currentRole?.jx3id;
        },
        getImgUrl(item) {
            const client = "std"; // 怀旧服的奇遇图片先取正式服的
            let tgaPath = item.szOpenRewardPath?.toLowerCase();
            if (!tgaPath) return "";
            tgaPath = tgaPath.replace(/\\/g, "/").replace("ui/image/adventure/", "");
            if (!item.szRewardType) {
                let pngPath = tgaPath.replace(/\.tga$/, ".png");
                return `${this.__imgRoot}adventure/${client}/${pngPath}`;
            }
            // 传给组件的数据是修改过的
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
@import "~@/assets/css/adventure/treasure.less";
</style>
