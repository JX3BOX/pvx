<script>
import { ArrowLeft, Reading } from "@element-plus/icons-vue";
import AchievementProgressPage from "@/components/wiki/progress/AchievementProgressPage.vue";
import AchievementHiddenNotice from "@/components/wiki/progress/AchievementHiddenNotice.vue";
import { __Root } from "@/utils/config";

export default {
    name: "WikiAchievementHidden",
    components: { AchievementProgressPage, AchievementHiddenNotice, ArrowLeft, Reading },
    computed: {
        guideUrl() {
            return `${__Root}community/496`;
        },
    },
};
</script>

<template>
    <article class="p-achievement-hidden">
        <header class="m-hidden-toolbar">
            <router-link :to="{ name: 'overview' }" class="u-hidden-back"
                :title="$t('achievementAppearance.backToProgress')"
                :aria-label="$t('achievementAppearance.backToProgress')">
                <ArrowLeft aria-hidden="true" />
            </router-link>
            <h1>{{ $t('pages.wiki.overview.ui.workbench.hiddenTier') }}</h1>
            <a class="u-hidden-guide" :href="guideUrl" target="_blank" rel="noopener noreferrer">
                <Reading aria-hidden="true" />{{ $t('achievementAppearance.viewGuide') }}
            </a>
        </header>
        <div class="m-hidden-document">
            <AchievementHiddenNotice />
            <AchievementProgressPage hidden />
        </div>
    </article>
</template>

<style lang="less" scoped>
.p-achievement-hidden {
    display: grid;
    gap: 12px;
    width: 100%;
    color: #333;
    line-height: 1.6;
    overflow-wrap: anywhere;
    a {
        text-decoration: none;
        &:focus-visible { outline: 2px solid #5a7e84; outline-offset: 4px; }
    }
}
.u-hidden-back {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border: 1px solid #e5e0d6;
    border-radius: 12px;
    background: #fff;
    color: #6e572c;
    svg { width: 18px; height: 18px; }
    &:hover { border-color: #b7a582; background: #f5f2eb; }
}
.m-hidden-document {
    display: grid;
    gap: 12px;
    width: 100%;
    min-width: 0;
    margin: 0 auto 72px;
}
.m-hidden-toolbar {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    h1 {
        min-width: 0;
        margin: 0;
        color: #6e572c;
        font-size: 24px;
        font-weight: 600;
        line-height: 1.4;
    }
}
.u-hidden-guide {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    min-height: 40px;
    padding: 8px 18px;
    border-radius: 24px;
    background: #5a7e84;
    color: #fff;
    font-size: 14px;
    white-space: nowrap;
    svg { width: 18px; height: 18px; }
    &:hover { background: #47777d; }
}
@media (max-width: @phone) {
    .m-hidden-document { margin-bottom: 32px; }
    .m-hidden-toolbar { gap: 10px; h1 { font-size: 20px; } }
    .u-hidden-back { width: 44px; height: 44px; }
    .u-hidden-guide { min-height: 44px; padding: 8px 12px; }
}
</style>
