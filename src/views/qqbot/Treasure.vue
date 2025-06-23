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
import { getRoleGameAchievementsByRoleAndServer } from "@/service/adventure/treasure";
import { __imgPath } from "@jx3box/jx3box-common/data/jx3box.json";
import treasureCommon from "@/assets/js/treasure.js";
import landscapeContent from "@/views/adventure/landscapeContent.vue";
import portraitContent from "@/views/adventure/portraitContent.vue";
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
                name: this.role,
                mount: this.mount || "",
            };
        },
    },
    watch: {
        params: {
            immediate: true,
            deep: true,
            handler(params) {
                getRoleGameAchievementsByRoleAndServer(params).then((res) => {
                    const data = res.data?.data || {};
                    const userJx3Id = data.jx3id || "";
                    this.mount = data.mount || "";
                    if (userJx3Id) {
                        treasureCommon(userJx3Id).then((res) => {
                            if (this.isLandscape) {
                                this.isSync = !!userJx3Id; // 是否在游戏中同步
                                res.pet = this.splitArrayIntoChunks(res.pet, 5);
                                res.normal = this.splitArrayIntoChunks(res.normal, 3);
                                this.userAchievement = res;
                                this.$nextTick((_) => {
                                    this.addClass = false;
                                    this.reelAddClass = "";
                                    this.isOver = false;
                                    setTimeout(() => {
                                        this.start();
                                    }, 500);
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
                    }
                });
            },
        },
    },
    methods: {
        start() {
            this.addClass = true;
            this.reelAddClass = "start";
            setTimeout(() => {
                this.isOver = true;
                this.addClass = false;
                this.reelAddClass = "";
                window.__READY__ = true;
            }, 3000);
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
