<script>
import myRolesImage from "@/assets/img/wiki/guide/my-roles.png";
import bindRoleImage from "@/assets/img/wiki/guide/bind-role.png";
import syncAchievementsImage from "@/assets/img/wiki/guide/sync-achievements.png";
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    name: "AchievementGuidePage",
    components: { PvxSurface },
    data() {
        return { screenshots: [[{ src: myRolesImage, caption: 0, width: 808, height: 960 }, { src: bindRoleImage, caption: 1, width: 678, height: 476 }], [{ src: syncAchievementsImage, caption: 2, width: 987, height: 644 }], []], sections: ["sync", "usage", "faq"], featureRoutes: ["overview", "compare", "leap"] };
    },
    mounted() {
        this.scrollToSection();
    },
    watch: {
        "$route.hash"() {
            this.scrollToSection();
        },
    },
    methods: {
        scrollToSection() {
            const section = this.$route.hash.slice(1);
            if (!this.sections.includes(section)) return;
            this.$nextTick(() => this.$refs[section]?.$el?.scrollIntoView({ block: "start" }));
        },
    },
};
</script>

<template>
    <article class="p-achievement-guide">
        <header class="m-guide-header">
            <router-link :to="{ name: 'overview' }" class="u-guide-back">← {{ $t('achievementGuide.back') }}</router-link>
            <h1>{{ $t('achievementGuide.title') }}</h1>
            <p>{{ $t('achievementGuide.intro') }}</p>
            <nav class="m-guide-contents" :aria-label="$t('achievementGuide.title')">
                <router-link v-for="(section, index) in sections" :key="section" :to="{ hash: `#${section}` }">
                    <span>0{{ index + 1 }}</span>{{ $t(`achievementGuide.${section}`) }}
                </router-link>
            </nav>
        </header>

        <PvxSurface id="sync" ref="sync" class="m-guide-section" radius="medium">
            <h2><span>01</span>{{ $t('achievementGuide.sync') }}</h2>
            <ol class="m-guide-steps">
                <li v-for="index in 3" :key="index">
                    <h3>{{ $t(`achievementGuide.steps.${index - 1}.title`) }}</h3>
                    <p>{{ $t(`achievementGuide.steps.${index - 1}.text`) }}</p>
                    <a v-if="index === 1" href="https://www.jx3box.com/dashboard/role" target="_blank" rel="noopener noreferrer">
                        {{ $t('achievementGuide.bind') }} ↗
                    </a>
                    <p v-if="index === 2" class="m-guide-note m-guide-sync-required">
                        <strong>{{ $t('achievementGuide.syncRequired') }}</strong>
                    </p>
                    <div v-if="screenshots[index - 1].length" class="m-guide-screenshots" :class="{ 'is-pair': index === 1 }">
                        <figure v-for="shot in screenshots[index - 1]" :key="shot.caption">
                            <a :href="shot.src" target="_blank" rel="noopener noreferrer">
                                <img :src="shot.src" :alt="$t(`achievementGuide.screenshots.${shot.caption}`)"
                                    :width="shot.width" :height="shot.height" loading="lazy" />
                            </a>
                            <figcaption>{{ $t(`achievementGuide.screenshots.${shot.caption}`) }}</figcaption>
                        </figure>
                    </div>
                </li>
            </ol>
            <p class="m-guide-note">{{ $t('achievementGuide.syncNote') }}</p>
        </PvxSurface>

        <PvxSurface id="usage" ref="usage" class="m-guide-section" radius="medium">
            <h2><span>02</span>{{ $t('achievementGuide.usage') }}</h2>
            <div class="m-guide-features">
                <section v-for="(route, index) in featureRoutes" :key="route">
                    <h3>{{ $t(`achievementGuide.features.${index}.title`) }}</h3>
                    <p>{{ $t(`achievementGuide.features.${index}.text`) }}</p>
                    <router-link :to="{ name: route }">{{ $t(`achievementGuide.features.${index}.action`) }} →</router-link>
                </section>
            </div>
        </PvxSurface>

        <PvxSurface id="faq" ref="faq" class="m-guide-section" radius="medium">
            <h2><span>03</span>{{ $t('achievementGuide.faq') }}</h2>
            <div v-for="index in 3" :key="index" class="m-guide-question">
                <h3>{{ $t(`achievementGuide.questions.${index - 1}.title`) }}</h3>
                <p>{{ $t(`achievementGuide.questions.${index - 1}.text`) }}</p>
            </div>
        </PvxSurface>
    </article>
</template>

<style lang="less" scoped>
.p-achievement-guide {
    max-width: 1040px;
    margin: 0 auto;
    color: #3c4849;
    line-height: 1.8;
    overflow-wrap: anywhere;

    a {
        color: #47777d;
        text-underline-offset: 4px;
        &:hover { color: #2f626b; text-decoration: underline; }
        &:focus-visible { outline: 2px solid #47777d; outline-offset: 4px; }
    }
    h1, h2, h3, p { margin: 0; }
    h1 { margin-top: 20px; font-size: 28px; line-height: 1.4; }
    h2 { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; font-size: 20px; }
    h2 > span { color: #a18a60; font-size: 14px; font-variant-numeric: tabular-nums; }
    h3 { margin-bottom: 6px; font-size: 16px; }
    p { color: #687573; font-size: 14px; }
}
.m-guide-header { padding: 12px 0 24px; }
.m-guide-header > p { margin-top: 10px; }
.u-guide-back { font-size: 13px; }
.m-guide-contents {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
    a { display: inline-flex; gap: 8px; align-items: center; padding: 8px 14px; border: 1px solid rgba(71,119,125,.18); border-radius: 8px; background: #fffdf8; font-size: 14px; }
    span { color: #a18a60; font-size: 12px; }
}
.m-guide-section {
    margin-bottom: 20px;
    scroll-margin-top: 88px;
    background: #fffef9;
    border-color: rgba(70,74,66,.13);
}
.m-guide-steps {
    margin: 0;
    padding-left: 24px;
    list-style: decimal;
    li { padding-left: 10px; margin-bottom: 24px; }
    li::marker { color: #47777d; font-weight: 600; }
    a { display: inline-block; margin-top: 8px; font-size: 14px; }
}
.p-achievement-guide .m-guide-note { padding: 14px 18px; border-left: 3px solid #a18a60; border-radius: 0 8px 8px 0; background: #f5f1e8; color: #796647; }
.m-guide-sync-required { margin-top: 16px !important; }
.m-guide-screenshots {
    display: grid;
    gap: 20px;
    margin-top: 16px;
    &.is-pair { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    figure { min-width: 0; margin: 0; }
    a { display: block; margin-top: 0; }
    img { display: block; width: 100%; height: auto; border: 1px solid rgba(70, 74, 66, .13); border-radius: 8px; }
    figcaption { margin-top: 8px; color: #687573; font-size: 12px; }
}
.m-guide-features {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    section { display: flex; flex-direction: column; align-items: flex-start; }
    p { flex: 1; margin-bottom: 16px; }
    a { font-size: 14px; }
}
.m-guide-question + .m-guide-question { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(70,74,66,.1); }
@media (max-width: 768px) {
    .p-achievement-guide h1 { font-size: 24px; }
    .m-guide-screenshots.is-pair { grid-template-columns: minmax(0, 1fr); }
    .m-guide-features { grid-template-columns: minmax(0, 1fr); }
    .m-guide-contents { gap: 8px; }
    .m-guide-contents a { padding: 8px 10px; }
}
</style>
