<template>
    <div class="m-achievement-sidebar" :class="{ is_mobile: mobile }">
        <img class="u-title_img" src="@/assets/img/wiki/overview/title.png" alt="" />
        <ul class="m-sidebar-nav">
            <li :class="{ active: $route.name === 'overview' }">
                <router-link
                    :to="{
                        name: 'overview',
                    }"
                    >{{ $t("pages.wiki.sidebar.progress") }}</router-link
                >
            </li>
            <li :class="{ active: $route.name === 'compare' }">
                <router-link
                    :to="{
                        name: 'compare',
                    }"
                    >{{ $t("pages.wiki.sidebar.compare") }}</router-link
                >
            </li>
            <li :class="{ active: $route.name === 'leap' }">
                <router-link
                    :to="{
                        name: 'leap',
                    }"
                    >{{ $t("pages.wiki.sidebar.plan") }}</router-link
                >
            </li>
        </ul>
        <div class="u-img-btn">
            <a
                href="/notice/95651"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="$t('pages.wiki.sidebar.guide')"
            >
                <img
                    src="@/assets/img/wiki/zlbdzn.png"
                    :alt="$t('pages.wiki.sidebar.guide')"
                    class="u-img-guide"
                />
            </a>
            <a
                class="u-wiki-btn"
                href="/cj"
                v-show="!mobile"
                :aria-label="
                    $t('pages.wiki.sidebar.wikiWithPoints', {
                        count: formattedTotalSeniorityPoints,
                    })
                "
            >
                <p class="u-text">
                    <span class="u-label">
                        {{ $t("pages.wiki.sidebar.recordedSeniorityPoints") }}
                    </span>
                    <strong class="u-count">{{ formattedTotalSeniorityPoints }}</strong>
                </p>
            </a>
        </div>
    </div>
</template>

<script>
import { getAchievementPointsV2 } from "@/service/achievement";
import { normalizeAchievementMetadata } from "@/utils/achievementStatistics";

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
            totalSeniorityPoints: 0,
        };
    },
    computed: {
        mobile() {
            const userAgent = navigator.userAgent.toLowerCase();
            const mobileKeywords = ["android", "iphone", "ipad", "ipod", "windows phone", "miniprogram"];
            return mobileKeywords.some((keyword) => userAgent.includes(keyword));
        },
        viewAchievementsName() {
            return this.$store.state.viewAchievementsName;
        },
        formattedTotalSeniorityPoints() {
            const locale = typeof this.$i18n?.locale === "string" ? this.$i18n.locale : undefined;
            return new Intl.NumberFormat(locale).format(this.totalSeniorityPoints);
        },
    },
    created() {
        // 与资历总览统一：只统计可见且 point > 0 的常规、五甲成就。
        getAchievementPointsV2(this.$store.state.client || "std").then((response) => {
            const metadata = normalizeAchievementMetadata(response.data?.data?.points || {});
            const visibleAchievements = Object.values(metadata).filter((item) => item.visible && item.point > 0);
            const generalAchievements = visibleAchievements.filter((item) => item.general === 1);
            const armorAchievements = visibleAchievements.filter((item) => item.general === 2);

            this.totalSeniorityPoints = [...generalAchievements, ...armorAchievements].reduce(
                (total, item) => total + item.point,
                0
            );
            this.$store.commit("SET_STATE", { key: "generalTotal", value: generalAchievements.length });
            this.$store.commit("SET_STATE", { key: "armorTotal", value: armorAchievements.length });
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
            .u-count {
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
