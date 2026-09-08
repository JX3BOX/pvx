<script>
import { DataAnalysis, MagicStick, QuestionFilled, User, ChatDotRound } from "@element-plus/icons-vue";
import Account from "@jx3box/jx3box-common/js/user";
import { getConsultationAccess } from "@/service/achievementConsultation";
import brandIcon from "@/assets/img/wiki/figma/brand.svg";
import progressIcon from "@/assets/img/wiki/figma/nav-progress.svg";
import compareIcon from "@/assets/img/wiki/figma/nav-compare.svg";
import leapIcon from "@/assets/img/wiki/figma/nav-leap.svg";

const NAV_ITEMS = Object.freeze([
    {
        routeName: "overview",
        labelKey: "pages.wiki.sidebar.progress",
        icon: "DataAnalysis",
        image: progressIcon,
    },
    {
        routeName: "compare",
        labelKey: "pages.wiki.sidebar.compare",
        icon: "User",
        image: compareIcon,
    },
    {
        routeName: "leap",
        labelKey: "pages.wiki.sidebar.plan",
        icon: "MagicStick",
        image: leapIcon,
    },
]);

export default {
    name: "AchievementWorkbenchNav",
    components: {
        DataAnalysis,
        MagicStick,
        QuestionFilled,
        User,
        ChatDotRound,
    },
    async created() {
        if (!Account.isLogin()) return;
        try {
            if ((await getConsultationAccess()).is_expert)
                this.navItems = [
                    ...NAV_ITEMS,
                    {
                        routeName: "consultation",
                        labelKey: "achievementConsultation.title",
                        icon: "ChatDotRound",
                    },
                ];
        } catch {
            /* Expert navigation stays hidden until the server confirms access. */
        }
    },
    data() {
        return {
            navItems: NAV_ITEMS,
            brandIcon,
        };
    },
    methods: {
        isActive(item) {
            return item.routeName === this.$route.name;
        },
    },
};
</script>

<template>
    <nav class="m-achievement-workbench-nav" :aria-label="$t('pages.wiki.overview.title')">
        <router-link class="m-achievement-workbench-brand" :to="{ name: 'overview' }">
            <img :src="brandIcon" alt="" />
            <span>{{ $t("pages.wiki.overview.title") }}</span>
        </router-link>
        <div class="m-achievement-workbench-nav__tabs" role="tablist">
            <router-link
                v-for="item in navItems"
                :key="item.routeName"
                class="u-achievement-workbench-tab"
                :class="{ 'is-active': isActive(item) }"
                :to="{ name: item.routeName }"
                role="tab"
                :aria-selected="isActive(item)"
                :aria-current="isActive(item) ? 'page' : undefined"
            >
                <span class="u-achievement-workbench-tab__icon" aria-hidden="true">
                    <img v-if="item.image" :src="item.image" alt="" />
                    <component v-else :is="item.icon" />
                </span>
                <span class="u-achievement-workbench-tab__label">{{ $t(item.labelKey) }}</span>
            </router-link>
        </div>

        <a
            class="u-achievement-workbench-guide"
            :href="$router.resolve({ name: 'achievement-guide' }).href"
            target="_blank"
            rel="noopener noreferrer"
        >
            <QuestionFilled aria-hidden="true" />
            <span>{{ $t("pages.wiki.sidebar.guide") }}</span>
        </a>
    </nav>
</template>

<style lang="less" scoped>
.m-achievement-workbench-nav {
    position: sticky;
    top: 60px;
    z-index: 20;
    display: flex;
    min-width: 0;
    min-height: 60px;
    align-items: flex-start;
    gap: 12px;
    padding: 0 0 12px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.96), rgba(244, 240, 232, 0.96));
}
.m-achievement-workbench-brand {
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 0 16px;
    color: #6e572c;
    font-size: 28px;
    font-weight: 700;
    text-decoration: none;
    white-space: nowrap;
    img {
        width: 28px;
        height: 32px;
        object-fit: contain;
    }
}
.m-achievement-workbench-nav__tabs {
    display: flex;
    flex: 1;
    min-width: 0;
    align-items: center;
    gap: 4px;
    overflow-x: auto;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        display: none;
    }
}
.u-achievement-workbench-tab {
    display: inline-flex;
    flex: 0 0 auto;
    min-width: 180px;
    height: 48px;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 24px;
    border: 1px solid transparent;
    border-radius: 57px;
    color: #6e572c;
    font-size: 20px;
    text-decoration: none;
    white-space: nowrap;
    &:hover {
        background: #f1e7d8;
    }
    &.is-active {
        border-color: #c3b08b;
        background: linear-gradient(90deg, #fcfbf7, #f1e7d8);
        font-weight: 700;
    }
}
.u-achievement-workbench-tab__icon {
    display: inline-flex;
    width: 24px;
    height: 24px;
    flex: none;
    img,
    svg {
        width: 24px;
        height: 24px;
        object-fit: contain;
    }
}
.u-achievement-workbench-guide {
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 6px 0;
    padding: 0 24px;
    min-height: 36px;
    border-radius: 52px;
    color: #f8f7f3;
    background: linear-gradient(90deg, #a3864c, #343434);
    font-size: 16px;
    text-decoration: none;
    white-space: nowrap;
    svg {
        width: 13px;
        height: 13px;
    }
    &:hover {
        color: #fff;
        filter: brightness(1.1);
    }
}
@media (max-width: 1400px) {
    .m-achievement-workbench-brand {
        font-size: 24px;
        gap: 8px;
        padding: 0 8px;
    }
    .u-achievement-workbench-tab {
        min-width: 136px;
        font-size: 18px;
        padding: 0 16px;
    }
    .u-achievement-workbench-guide {
        padding: 0 16px;
        font-size: 14px;
    }
}
@media (max-width: 1000px) {
    .m-achievement-workbench-nav {
        flex-wrap: wrap;
    }
    .m-achievement-workbench-nav__tabs {
        order: 3;
        flex-basis: 100%;
    }
    .m-achievement-workbench-brand {
        margin-right: auto;
    }
    .u-achievement-workbench-tab {
        flex: 1 0 auto;
    }
}
@media (max-width: @phone) {
    .m-achievement-workbench-nav {
        position: static;
        gap: 4px;
        padding-bottom: 8px;
    }
    .m-achievement-workbench-brand {
        font-size: 20px;
        min-height: 40px;
    }
    .m-achievement-workbench-brand img {
        width: 24px;
        height: 28px;
    }
    .u-achievement-workbench-tab {
        min-width: 110px;
        height: 44px;
        padding: 0 12px;
        font-size: 14px;
        gap: 6px;
    }
    .u-achievement-workbench-tab__icon,
    .u-achievement-workbench-tab__icon img,
    .u-achievement-workbench-tab__icon svg {
        width: 18px;
        height: 18px;
    }
    .u-achievement-workbench-guide {
        margin: 0;
        min-height: 44px;
        max-width: 52%;
        white-space: normal;
        text-align: center;
        padding: 0 12px;
        font-size: 13px;
    }
}
</style>
