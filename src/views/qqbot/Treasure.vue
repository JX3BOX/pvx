<template>
    <div class="p-qqbot-treasure" v-if="userAchievement">
        <div id="capture" ref="capture">
            <landscapeContent
                v-if="isLandscape"
                :__img-root="imgRoot"
                :user-achievement="userAchievement"
                :role-info="roleInfo"
                :add-class="addClass"
                :is-over="isOver"
                :content-zoom="contentZoom"
                :current-camp="currentCamp"
                :reel-add-class="reelAddClass"
            ></landscapeContent>
            <portraitContent
                v-else
                :__img-root="imgRoot"
                :user-achievement="userAchievement"
                :role-info="roleInfo"
                :add-class="addClass"
                :is-over="isOver"
                :content-zoom="contentZoom"
                :current-camp="currentCamp"
                :reel-add-class="reelAddClass"
            ></portraitContent>
        </div>
    </div>
</template>

<script>
import { getRoleGameAchievementsByRoleAndServer, getUserRoles } from "@/service/adventure/treasure";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import treasureCommon from "@/assets/js/treasure.js";
import landscapeContent from "@/views/adventure/landscapeContent.vue";
import portraitContent from "@/views/adventure/portraitContent.vue";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";
export default {
    name: "QQBotTreasure",
    components: {
        landscapeContent,
        portraitContent,
    },
    data() {
        return {
            userAchievement: false,
            addClass: false,
            reelAddClass: false,
            contentZoom: "",
            currentCamp: "hq",
            isOver: false,
            imgRoot: __imgPath + "adventure/",
            mount: "",
            defaultRole: "",
            isMiniProgram: isMiniProgram(),
        };
    },
    computed: {
        isLandscape() {
            return this.$route.query.mode === "landscape";
        },
        role() {
            return this.$route.query.role || "";
        },
        server() {
            return this.$route.query.server || "";
        },
        params() {
            return {
                role: this.role,
                server: this.server,
            };
        },
        roleInfo() {
            return {
                name: this.role || this.defaultRole,
                mount: this.mount || "",
            };
        },
    },
    created() {
        document.title = "奇遇珍卷 - JX3BOX";

        if (this.isMiniProgram && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            document.documentElement.style.removeProperty("font-size");
            document.documentElement.style.fontSize = "16px";
            document.documentElement.classList.add("is-ios");
        }

        let metaViewport = document.querySelector('meta[name="viewport"]');
        metaViewport?.setAttribute("content", "");
        metaViewport?.remove();
    },
    watch: {
        params: {
            immediate: true,
            deep: true,
            handler(params) {
                if (params.role && params.server) {
                    this.getRoleGameAchievements(params);
                } else {
                    getUserRoles()
                        .then((res) => {
                            if (res.data.data.list.length) {
                                const roleList =
                                    res.data?.data?.list.filter((item) => {
                                        return !!item.player_id;
                                    }) || [];
                                if (roleList.length) {
                                    this.defaultRole = roleList[0].name;
                                    const params = {
                                        role: roleList[0].name,
                                        server: roleList[0].server,
                                    };
                                    this.getRoleGameAchievements(params);
                                }
                            } else {
                                window.__DATA_READY__ = false;
                                console.log(
                                    "未获取到角色信息,",
                                    "已设置window.__DATA_READY__ = ",
                                    window.__DATA_READY__
                                );
                                this.$message.error("未获取到角色信息");
                            }
                        })
                        .catch((err) => {
                            window.__DATA_READY__ = false;
                            console.log(
                                "获取角色信息失败",
                                err,
                                "已设置window.__DATA_READY__ = ",
                                window.__DATA_READY__
                            );
                            this.$message.error("获取角色信息失败，请稍后再试");
                        });
                }
            },
        },
    },
    methods: {
        getRoleGameAchievements(params) {
            getRoleGameAchievementsByRoleAndServer(params).then((res) => {
                const data = res.data?.data || {};
                const userJx3Id = data.jx3id || "";
                this.mount = data.mount || "";
                if (userJx3Id) {
                    this.getData(userJx3Id);
                } else {
                    // 没有userJx3Id设置全局变量__DATA_READY__为false
                    window.__DATA_READY__ = false;
                    console.log("未获取到jx3id", "已设置window.__DATA_READY__ = ", window.__DATA_READY__);
                    this.$message.warning("请先在游戏中同步数据");
                }
            });
        },
        getData(userJx3Id) {
            treasureCommon(userJx3Id).then((res) => {
                // 获取到数据设置全局变量__DATA_READY__
                window.__DATA_READY__ = true;
                console.log("已获取到jx3id = ", userJx3Id, "已设置window.__DATA_READY__ = ", window.__DATA_READY__);
                if (this.isLandscape) {
                    this.isSync = !!userJx3Id; // 是否在游戏中同步
                    res.pet = this.splitArrayIntoChunks(res.pet, 5);
                    res.normal = this.splitArrayIntoChunks(res.normal, 3);
                    this.userAchievement = res;
                    this.$nextTick((_) => {
                        this.addClass = false;
                        this.reelAddClass = "";
                        this.isOver = false;

                        this.start();
                    });
                } else {
                    this.isSync = !!userJx3Id; // 是否在游戏中同步
                    this.userAchievement = res;
                    this.addClass = false;
                    this.isOver = false;
                    this.$nextTick((_) => {
                        this.start();
                    });
                }
            });
        },
        start() {
            this.addClass = true;
            this.reelAddClass = "start";
            setTimeout(() => {
                this.isOver = true;
                this.addClass = false;
                this.reelAddClass = "";
                window.__READY__ = true;
            }, 500);
            window.addEventListener("resize", this.handleScreenWidthChange);
            window.addEventListener("load", this.handleScreenWidthChange);
            this.handleScreenWidthChange();
        },
        handleScreenWidthChange() {
            if (!this.isLandscape) {
                this.handlePortraitScreenWidthChange();
            } else {
                this.handleLandscapeScreenWidthChange();
            }
        },
        handlePortraitScreenWidthChange() {
            var screenWidth = window.innerWidth - 40;
            var boxWidth = 900;
            var scale = screenWidth / boxWidth;
            var zoom = 1;
            if (screenWidth <= boxWidth) {
                zoom = scale;
            }
            this.contentZoom = zoom;
        },
        handleLandscapeScreenWidthChange() {
            var screenWidth = window.innerWidth - 80;
            var boxWidth = 1920;
            var scale = screenWidth / boxWidth;
            var zoom = 1;
            if (screenWidth <= boxWidth) {
                zoom = scale;
            }
            this.contentZoom = zoom;
        },
        splitArrayIntoChunks(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        },
    },
};
</script>

<style lang="less">
.p-qqbot-treasure {
    width: 100%;
    min-height: 100vh;
    text-align: center;
    margin: 0 auto;

    #capture {
        padding: 20px;
        width: max-content;
        margin: 0 auto;
        user-select: none;
        overflow: hidden;
    }
}
</style>
