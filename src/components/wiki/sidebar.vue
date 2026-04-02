<template>
    <div v-if="!isMiniProgram()" class="m-achievement-sidebar" :class="{ is_mobile: mobile }">
        <img class="u-title_img" src="@/assets/img/wiki/overview/title.png" alt="" />
        <ul class="m-sidebar-nav">
            <li :class="{ active: $route.name === 'overview' }">
                <router-link
                    :to="{
                        name: 'overview',
                    }"
                    >完成进度</router-link
                >
                <ul v-show="$route.name === 'overview'">
                    <li>
                        <router-link class="is-child" :to="{ name: 'overview' }">{{
                            viewAchievementsName ? viewAchievementsName + "资历" : "总览"
                        }}</router-link>
                    </li>
                </ul>
            </li>
            <li :class="{ active: $route.name === 'compare' }">
                <router-link
                    :to="{
                        name: 'compare',
                    }"
                    >亲友对比</router-link
                >
            </li>
            <li :class="{ active: $route.name === 'leap' }">
                <router-link
                    :to="{
                        name: 'leap',
                    }"
                    >渡劫方案</router-link
                >
            </li>
        </ul>
        <div class="u-img-btn">
            <a href="https://www.jx3box.com/notice/95651" target="_blank">
                <img src="@/assets/img/wiki/zlbdzn.png" alt="" class="u-img-guide" />
            </a>
            <a class="u-wiki-btn" href="/cj" v-show="!mobile">
                <p class="u-text">
                    已收录资历点：<span>{{ count }}</span>
                </p>
            </a>
        </div>
    </div>
</template>

<script>
import { getAchievementsTotal } from "@/service/achievement";
import { isApp, isMiniProgram } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "AchievementCount",
    // 监听路由变化
    watch: {
        $route: {
            handler(to, from) {
                if (from.name == "overview") {
                    this.$store.commit("SET_STATE", { key: "viewAchievementsName", value: "" });
                }
            },
        },
    },
    data() {
        return {
            count: 0,
        };
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone", "miniprogram"];
            return mobileKeywords.some((keyword) => userAgent.includes(keyword)) || isApp();
        },
        viewAchievementsName() {
            return this.$store.state.viewAchievementsName;
        },
    },
    methods: {
        isMiniProgram,
    },
    created() {
        // 获取成就统计信息
        getAchievementsTotal().then((data) => {
            const count = data.data.data.count;
            this.count = ~~count?.general + ~~count?.armor_point;
            this.$store.commit("SET_STATE", { key: "generalTotal", value: ~~count["general"] });
            this.$store.commit("SET_STATE", { key: "armorTotal", value: ~~count["armor"] });
        });
    },
};
</script>

<style lang="less" scoped>
.m-achievement-sidebar {
    height: 100%;
    &::after {
        .size(320px,176px);
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        background: url(~@/assets/img/wiki/overview/bamboo.svg) no-repeat;
        background-size: cover;
        z-index: 0;
    }
    ul {
        padding: 0;
        // margin: 0 0 10px 18px;
        .mt(0);
    }
    .m-sidebar-nav {
        .mb(18px);
        .flex;
        flex-direction: column;
        gap: 8px;
        li {
            list-style: none;
            .flex;
            flex-direction: column;
            gap: 8px;
            ul {
                .ml(18px);
            }
            &.active {
                a {
                    font-weight: bold;
                    color: rgba(245, 224, 201, 1);
                    border-color: rgba(245, 224, 201, 1);
                }
            }
            a {
                padding-left: 12px;
                color: rgba(255, 255, 255, 0.5);
                line-height: 24px;
                border-left: 4px solid;
                border-color: rgba(255, 255, 255, 0.5);
                &:hover {
                    background: rgba(255, 255, 255, 0.25);
                    border-color: rgba(245, 224, 201, 0.75);
                }
            }
        }
    }
    .u-img-btn {
        // .pa;
        // bottom: 18px;
    }
    .u-wiki-btn {
        .mt(8px);
        .db;
        .size(180px, 120px);
        .r(5px);
        cursor: pointer;
        color: rgba(150, 150, 150, 1);
        font-size: 12px;
        background: url(~@/assets/img/wiki/overview/wiki-btn.png) no-repeat;
        background-size: cover;
        position: relative;
        .u-text {
            text-align: center;
            width: 100%;
            position: absolute;
            margin: 0;
            bottom: 28px;
            span {
                font-weight: bold;
                color: rgba(204, 161, 108, 1);
            }
        }
    }
    .u-title_img {
        .w(180px);
    }
    .u-img-guide {
        .size(180px,50px);
        object-fit: cover;
        .r(5px);
    }
    &.is_mobile {
        .w(137px);
        .h(calc(100vh - 120px));
        .pl(20px);
        .pt(52px);
        box-sizing: border-box;
        .u-title_img {
            .w(50px);
        }
    }
}
</style>
