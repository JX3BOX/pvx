<script>
import { ArrowLeft, Hide, Reading } from "@element-plus/icons-vue";
import AchievementProgressPage from "@/components/wiki/progress/AchievementProgressPage.vue";
import { __Root } from "@/utils/config";

export default {
    name: "WikiAchievementHidden",
    components: { AchievementProgressPage, ArrowLeft, Hide, Reading },
    data() {
        return { summary: null };
    },
    computed: {
        description() {
            if (!this.summary) return this.$t("achievementAppearance.hiddenDescriptionPending");
            const key = this.summary.relatedCount === null ? "hiddenDescriptionCountOnly" : "hiddenDescription";
            const format = new Intl.NumberFormat(this.$i18n.locale);
            return this.$t(`achievementAppearance.${key}`, {
                count: format.format(this.summary.count),
                relatedCount: format.format(this.summary.relatedCount || 0),
            });
        },
        guideUrl() {
            return `${__Root}community/496`;
        },
    },
};
</script>

<template>
    <article class="p-achievement-hidden">
        <router-link :to="{ name: 'overview' }" class="u-hidden-back">
            <ArrowLeft aria-hidden="true" />{{ $t('achievementAppearance.backToProgress') }}
        </router-link>
        <div class="m-hidden-document">
            <header class="m-hidden-hero">
                <div class="m-hidden-hero__content">
                    <h1><Hide aria-hidden="true" />{{ $t('pages.wiki.overview.ui.workbench.hiddenTier') }}</h1>
                    <p>{{ description }}</p>
                </div>
                <a class="u-hidden-guide" :href="guideUrl" target="_blank" rel="noopener noreferrer">
                    <Reading aria-hidden="true" />{{ $t('achievementAppearance.viewGuide') }}
                </a>
            </header>
            <AchievementProgressPage hidden @hidden-summary="summary = $event" />
        </div>
    </article>
</template>

<style lang="less" scoped>
.p-achievement-hidden {
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
    gap: 8px;
    min-height: 36px;
    padding: 6px 18px;
    border-radius: 24px;
    background: linear-gradient(90deg, #a3864c, #343434);
    color: #fff;
    font-size: 14px;
    svg { width: 16px; height: 16px; }
}
.m-hidden-document {
    display: grid;
    gap: 24px;
    width: 100%;
    min-width: 0;
    margin: 12px auto 72px;
}
.m-hidden-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
    padding: 24px;
    border-radius: 16px;
    background: #fff;
    h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 0;
        color: #6e572c;
        font-size: 32px;
        line-height: 1.4;
        svg { width: 32px; height: 32px; color: #333; flex: none; }
    }
    p { margin: 12px 0 0; color: #999; font-size: 16px; }
}
.u-hidden-guide {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 40px;
    padding: 8px 24px;
    border-radius: 24px;
    background: #5a7e84;
    color: #fff;
    font-size: 14px;
    svg { width: 18px; height: 18px; }
    &:hover { background: #47777d; }
}
@media (max-width: @phone) {
    .m-hidden-document { gap: 16px; margin-bottom: 32px; }
    .m-hidden-hero { padding: 20px; h1 { font-size: 26px; } }
}
</style>
