<script>
import { Compass, ArrowLeft } from "@element-plus/icons-vue";
import { ElImageViewer } from "element-plus";
import myRolesImage from "@/assets/img/wiki/guide/my-roles.png";
import bindRoleImage from "@/assets/img/wiki/guide/bind-role.png";
import syncAchievementsImage from "@/assets/img/wiki/guide/sync-achievements.png";
import progressImage from "@/assets/img/wiki/guide/progress.png";
import compareImage from "@/assets/img/wiki/guide/compare.png";
import leapImage from "@/assets/img/wiki/guide/leap.png";
import consultationImage from "@/assets/img/wiki/guide/consultation.png";
import PvxSurface from "@/components/design/PvxSurface.vue";

export default {
    name: "AchievementGuidePage",
    components: { PvxSurface, Compass, ArrowLeft, ElImageViewer },
    data() {
        return {
            previewImage: null,
            screenshots: [
                [
                    { src: myRolesImage, caption: 0, width: 808, height: 960 },
                    { src: bindRoleImage, caption: 1, width: 678, height: 476 },
                ],
                [{ src: syncAchievementsImage, caption: 2, width: 948, height: 485 }],
                [],
            ],
            sections: ["sync", "usage", "faq"],
            featureRoutes: ["overview", "compare", "leap", "consultation"],
            featureScreenshots: [progressImage, compareImage, leapImage, consultationImage],
        };
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
        <router-link :to="{ name: 'overview' }" class="u-guide-back"
            ><ArrowLeft aria-hidden="true" />{{ $t("achievementGuide.back") }}</router-link
        >
        <div class="m-guide-document">
            <header class="m-guide-header">
                <h1><Compass aria-hidden="true" />{{ $t("achievementGuide.title") }}</h1>
                <p>{{ $t("achievementGuide.intro") }}</p>
            </header>

            <PvxSurface id="sync" ref="sync" class="m-guide-section" radius="medium">
                <h2><span>1.</span>{{ $t("achievementGuide.sync") }}</h2>
                <ol class="m-guide-steps">
                    <li v-for="index in 3" :key="index">
                        <h3>{{ $t(`achievementGuide.steps.${index - 1}.title`) }}</h3>
                        <p>{{ $t(`achievementGuide.steps.${index - 1}.text`) }}</p>
                        <a
                            v-if="index === 1"
                            href="https://www.jx3box.com/dashboard/role"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {{ $t("achievementGuide.bind") }} ↗
                        </a>
                        <p v-if="index === 2" class="m-guide-note m-guide-sync-required">
                            <strong>{{ $t("achievementGuide.syncRequired") }}</strong>
                        </p>
                        <details v-if="screenshots[index - 1].length" class="m-guide-screenshot-disclosure">
                            <summary>{{ $t("achievementAppearance.screenshots") }}</summary>
                            <div class="m-guide-screenshots" :class="{ 'is-pair': index === 1 }">
                                <figure v-for="shot in screenshots[index - 1]" :key="shot.caption">
                                    <button type="button" class="u-guide-image-preview" @click="previewImage = shot.src">
                                        <img
                                            :src="shot.src"
                                            :alt="$t(`achievementGuide.screenshots.${shot.caption}`)"
                                            :width="shot.width"
                                            :height="shot.height"
                                            loading="lazy"
                                        />
                                    </button>
                                    <figcaption>{{ $t(`achievementGuide.screenshots.${shot.caption}`) }}</figcaption>
                                </figure>
                            </div>
                        </details>
                    </li>
                </ol>
                <p class="m-guide-note">{{ $t("achievementGuide.syncNote") }}</p>
            </PvxSurface>

            <PvxSurface id="usage" ref="usage" class="m-guide-section" radius="medium">
                <h2><span>2.</span>{{ $t("achievementGuide.usage") }}</h2>
                <div class="m-guide-features">
                    <section v-for="(route, index) in featureRoutes" :key="route">
                        <h3>{{ $t(`achievementGuide.features.${index}.title`) }}</h3>
                        <p>{{ $t(`achievementGuide.features.${index}.text`) }}</p>
                        <router-link :to="{ name: route }" class="u-guide-feature-action"
                            >{{ $t(`achievementGuide.features.${index}.action`) }} →</router-link
                        >
                        <details class="m-guide-screenshot-disclosure">
                            <summary>{{ $t("achievementAppearance.screenshots") }}</summary>
                            <div class="m-guide-screenshots">
                                <figure>
                                    <button type="button" class="u-guide-image-preview" @click="previewImage = featureScreenshots[index]">
                                        <img :src="featureScreenshots[index]" :alt="$t(`achievementGuide.featureScreenshots.${index}`)" loading="lazy" />
                                    </button>
                                    <figcaption>{{ $t(`achievementGuide.featureScreenshots.${index}`) }}</figcaption>
                                </figure>
                            </div>
                        </details>
                    </section>
                </div>
            </PvxSurface>

            <PvxSurface id="faq" ref="faq" class="m-guide-section" radius="medium">
                <h2><span>3.</span>{{ $t("achievementGuide.faq") }}</h2>
                <div v-for="index in 3" :key="index" class="m-guide-question">
                    <h3>{{ $t(`achievementGuide.questions.${index - 1}.title`) }}</h3>
                    <p>{{ $t(`achievementGuide.questions.${index - 1}.text`) }}</p>
                </div>
            </PvxSurface>
        </div>
        <ElImageViewer
            v-if="previewImage"
            :url-list="[previewImage]"
            teleported
            hide-on-click-modal
            @close="previewImage = null"
        />
    </article>
</template>

<style lang="less" scoped>
.p-achievement-guide {
    width: 100%;
    color: #333;
    line-height: 1.6;
    overflow-wrap: anywhere;
    h1,
    h2,
    h3,
    p {
        margin: 0;
    }
    a {
        text-decoration: none;
        &:focus-visible {
            outline: 2px solid #5a7e84;
            outline-offset: 4px;
        }
    }
    h1 {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #6e572c;
        font-size: 32px;
        line-height: 1.4;
        svg {
            width: 32px;
            height: 32px;
            color: #333;
            flex: none;
        }
    }
    h2 {
        display: flex;
        align-items: baseline;
        gap: 8px;
        margin-bottom: 24px;
        font-size: 24px;
        font-weight: 400;
    }
    h3 {
        margin-bottom: 16px;
        color: #6e572c;
        font-size: 18px;
        font-weight: 600;
    }
    p {
        color: #333;
        font-size: 14px;
    }
    .u-guide-back {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        min-height: 36px;
        padding: 6px 18px;
        border-radius: 24px;
        background: linear-gradient(90deg, #a3864c, #343434);
        color: #fff;
        font-size: 14px;
        svg {
            width: 16px;
            height: 16px;
        }
    }
}
.m-guide-document {
    display: grid;
    gap: 24px;
    width: 100%;
    max-width: 1440px;
    margin: 12px auto 72px;
}
.m-guide-header {
    padding: 24px;
    border-radius: 16px;
    background: #fff;
    > p {
        margin-top: 12px;
        color: #999;
        font-size: 16px;
    }
}
.m-guide-section {
    padding: 24px;
    border: 0;
    border-radius: 16px;
    background: #fff;
    box-shadow: none;
    scroll-margin-top: 84px;
}
.m-guide-steps {
    display: grid;
    gap: 24px;
    margin: 0;
    padding: 0;
    list-style: none;
    li {
        min-width: 0;
        padding: 36px;
        border-radius: 16px;
        background: #f8f7f3;
    }
    a:not(.m-guide-screenshots a) {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 8px 24px;
        margin-top: 12px;
        border-radius: 24px;
        background: #5a7e84;
        color: #fff;
        font-size: 14px;
    }
}
.p-achievement-guide .m-guide-note {
    padding: 12px 24px;
    margin-top: 16px;
    border-left: 2px solid #5a7e84;
    background: #eeebe2;
    color: #6e572c;
}
.m-guide-sync-required strong {
    font-weight: 400;
}
.m-guide-screenshot-disclosure {
    margin-top: 16px;
    summary {
        width: fit-content;
        color: #5a7e84;
        font-size: 14px;
        cursor: pointer;
    }
}
.m-guide-screenshots {
    display: grid;
    gap: 24px;
    margin-top: 16px;
    &.is-pair {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    figure {
        min-width: 0;
        margin: 0;
    }
    .u-guide-image-preview {
        display: block;
        max-width: 100%;
        padding: 0;
        border: 0;
        background: transparent;
        cursor: zoom-in;
        &:focus-visible {
            outline: 2px solid #5a7e84;
            outline-offset: 4px;
        }
    }
    img {
        display: block;
        width: auto;
        max-width: 100%;
        max-height: 560px;
        height: auto;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
    }
    figcaption {
        margin-top: 8px;
        color: #999;
        font-size: 13px;
    }
}
.m-guide-features {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
    gap: 24px;
    section {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        min-width: 0;
        min-height: 235px;
        padding: 36px;
        border-radius: 16px;
        background: #f8f7f3;
    }
    p {
        margin-bottom: 24px;
    }
    .u-guide-feature-action {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 40px;
        padding: 8px 24px;
        border-radius: 24px;
        background: #5a7e84;
        color: #fff;
        font-size: 14px;
    }
}
.m-guide-question {
    padding: 36px;
    border-radius: 16px;
    background: #f8f7f3;
    & + & {
        margin-top: 24px;
    }
    h3 {
        margin-bottom: 12px;
    }
}
@media (max-width: 1000px) {
    .m-guide-steps li,
    .m-guide-features section,
    .m-guide-question {
        padding: 24px;
    }
    .m-guide-features {
        gap: 16px;
    }
}
@media (max-width: @phone) {
    .m-guide-document {
        gap: 16px;
        margin-bottom: 32px;
    }
    .m-guide-header,
    .m-guide-section {
        padding: 16px;
    }
    .p-achievement-guide {
        h1 {
            font-size: 24px;
            svg {
                width: 28px;
                height: 28px;
            }
        }
        h2 {
            font-size: 20px;
            margin-bottom: 16px;
        }
        h3 {
            font-size: 16px;
        }
        .u-guide-back {
            min-height: 44px;
        }
    }
    .m-guide-steps li,
    .m-guide-features section,
    .m-guide-question {
        padding: 20px 16px;
    }
    .m-guide-steps {
        gap: 16px;
    }
    .m-guide-features,
    .m-guide-screenshots.is-pair {
        grid-template-columns: minmax(0, 1fr);
    }
    .m-guide-features section {
        min-height: 0;
    }
    .m-guide-screenshot-disclosure summary,
    .m-guide-steps a:not(.m-guide-screenshots a),
    .m-guide-features a {
        min-height: 44px;
    }
    .m-guide-screenshot-disclosure summary {
        padding: 10px 0;
    }
    .p-achievement-guide .m-guide-note {
        padding: 12px;
    }
}
</style>
