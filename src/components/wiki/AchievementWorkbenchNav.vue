<script>
import { DataAnalysis, MagicStick, QuestionFilled, User } from "@element-plus/icons-vue";

const NAV_ITEMS = Object.freeze([
    {
        routeName: "overview",
        labelKey: "pages.wiki.sidebar.progress",
        icon: "DataAnalysis",
    },
    {
        routeName: "compare",
        labelKey: "pages.wiki.sidebar.compare",
        icon: "User",
    },
    {
        routeName: "leap",
        labelKey: "pages.wiki.sidebar.plan",
        icon: "MagicStick",
    },
]);

export default {
    name: "AchievementWorkbenchNav",
    components: {
        DataAnalysis,
        MagicStick,
        QuestionFilled,
        User,
    },
    data() {
        return {
            guideUrl: "/notice/95651",
            navItems: NAV_ITEMS,
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
                    <component :is="item.icon" />
                </span>
                <span class="u-achievement-workbench-tab__label">{{ $t(item.labelKey) }}</span>
            </router-link>
        </div>

        <a class="u-achievement-workbench-guide" :href="guideUrl" target="_blank" rel="noopener noreferrer">
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
    min-height: 58px;
    align-items: stretch;
    justify-content: space-between;
    gap: 16px;
    padding: 0 18px;
    border-bottom: 1px solid rgba(55, 74, 76, 0.13);
    border-radius: 14px 14px 0 0;
    background: rgba(252, 250, 245, 0.96);
    box-shadow: 0 8px 24px rgba(69, 61, 46, 0.05);
    backdrop-filter: blur(14px);
}

.m-achievement-workbench-nav__tabs {
    display: flex;
    min-width: 0;
    align-items: stretch;
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scrollbar-width: none;

    &::-webkit-scrollbar {
        display: none;
    }
}

.u-achievement-workbench-tab {
    position: relative;
    display: inline-flex;
    min-width: max-content;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 0 20px;
    color: #718083;
    font-size: 15px;
    line-height: 1;
    text-decoration: none;
    transition: color 160ms ease, background-color 160ms ease;

    &::after {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 2px;
        content: "";
        background: transparent;
        transform: scaleX(0.45);
        transition: background-color 160ms ease, transform 160ms ease;
    }

    &:hover {
        color: #315e66;
        background: rgba(47, 101, 109, 0.045);
    }

    &:focus-visible {
        outline: 2px solid rgba(47, 101, 109, 0.72);
        outline-offset: -3px;
    }

    &.is-active {
        color: #2f626b;
        font-weight: 650;

        &::after {
            background: #47777d;
            transform: scaleX(1);
        }
    }
}

.u-achievement-workbench-tab__icon {
    display: inline-flex;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    color: currentColor;
    background: rgba(47, 98, 107, 0.08);

    svg {
        width: 13px;
        height: 13px;
    }
}

.u-achievement-workbench-guide {
    display: inline-flex;
    min-width: max-content;
    align-items: center;
    justify-content: center;
    gap: 7px;
    align-self: center;
    padding: 8px 11px;
    border: 1px solid rgba(107, 88, 53, 0.17);
    border-radius: 8px;
    color: #776443;
    background: rgba(255, 253, 248, 0.72);
    font-size: 13px;
    text-decoration: none;
    transition: border-color 160ms ease, color 160ms ease, background-color 160ms ease;

    svg {
        width: 15px;
        height: 15px;
    }

    &:hover {
        border-color: rgba(107, 88, 53, 0.34);
        color: #594725;
        background: #fffdf8;
    }

    &:focus-visible {
        outline: 2px solid rgba(47, 101, 109, 0.72);
        outline-offset: 2px;
    }
}

@media (max-width: 720px) {
    .m-achievement-workbench-nav {
        min-height: 52px;
        gap: 8px;
        padding: 0 8px 0 4px;
        border-radius: 10px 10px 0 0;
    }

    .u-achievement-workbench-tab {
        gap: 6px;
        min-height: 52px;
        padding: 0 12px;
        font-size: 13px;
    }

    .u-achievement-workbench-tab__icon {
        width: 18px;
        height: 18px;
    }

    .u-achievement-workbench-guide {
        width: 36px;
        height: 36px;
        min-width: 36px;
        padding: 0;

        span {
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        }
    }
}

@media (prefers-reduced-motion: reduce) {
    .u-achievement-workbench-tab,
    .u-achievement-workbench-tab::after,
    .u-achievement-workbench-guide {
        transition: none;
    }
}
</style>
