<script>
import { Compass, ArrowLeft, CopyDocument, Refresh } from "@element-plus/icons-vue";
import { ElImageViewer } from "element-plus";
import progressImage from "@/assets/img/wiki/guide/progress.png";
import compareImage from "@/assets/img/wiki/guide/compare.png";
import leapImage from "@/assets/img/wiki/guide/leap.png";
import consultationImage from "@/assets/img/wiki/guide/consultation.png";
import PvxSurface from "@/components/design/PvxSurface.vue";
import User from "@jx3box/jx3box-common/js/user";
import { getRoleBindToken } from "@/service/team";

export default {
    name: "AchievementGuidePage",
    components: { PvxSurface, Compass, ArrowLeft, CopyDocument, Refresh, ElImageViewer },
    data() {
        return {
            previewImage: null,
            bindToken: "",
            tokenLoading: false,
            tokenError: false,
            tokenExpiresAt: 0,
            isLogin: User.isLogin(),
            screenshots: [
                [
                    { src: "https://cdn.jx3box.com/design/user/img/bind-step1.jpg", caption: 1 },
                ],
                [{ src: "https://cdn.jx3box.com/config/sync_ac.png", caption: 2 }],
                [],
            ],
            sections: ["sync", "usage", "faq", "points-difference"],
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
        onBindFlowToggle(event, index) {
            if (index === 1 && event.target.open && (!this.bindToken || Date.now() >= this.tokenExpiresAt)) {
                this.loadBindToken();
            }
        },
        async loadBindToken() {
            this.isLogin = User.isLogin();
            if (!this.isLogin || this.tokenLoading) return;
            this.tokenLoading = true;
            this.tokenError = false;
            this.bindToken = "";
            try {
                const res = await getRoleBindToken();
                this.bindToken = res.data.data.token || "";
                this.tokenError = !this.bindToken;
                this.tokenExpiresAt = Date.now() + 10 * 60 * 1000;
            } catch {
                this.tokenError = true;
            } finally {
                this.tokenLoading = false;
            }
        },
        async copyBindToken() {
            if (!this.bindToken || this.tokenLoading) return;
            if (Date.now() >= this.tokenExpiresAt) {
                this.$message.warning(this.$t("achievementGuide.bindFlow.expired"));
                await this.loadBindToken();
                return;
            }
            try {
                await navigator.clipboard.writeText(this.bindToken);
                this.$message.success(this.$t("achievementGuide.bindFlow.copied"));
            } catch {
                this.$message.error(this.$t("achievementGuide.bindFlow.copyFailed"));
            }
        },
        loginForBinding() {
            User.toLogin();
        },
        scrollToSection() {
            const section = this.$route.hash.slice(1);
            if (!this.sections.includes(section)) return;
            this.$nextTick(() => this.$el.querySelector(`#${section}`)?.scrollIntoView({ block: "start" }));
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
                        <div v-if="index === 1" class="m-guide-role-actions">
                            <a href="/dashboard/role" target="_blank" rel="noopener noreferrer">
                                {{ $t("achievementGuide.bind") }} ↗
                            </a>
                            <a href="/dashboard/role/bind" class="u-guide-bind-new" target="_blank" rel="noopener noreferrer">
                                {{ $t("achievementGuide.bindNew") }} ↗
                            </a>
                        </div>
                        <details v-if="screenshots[index - 1].length" class="m-guide-screenshot-disclosure" @toggle="onBindFlowToggle($event, index)">
                            <summary>{{ $t(index === 1 ? "achievementGuide.bindFlow.title" : "achievementAppearance.screenshots") }}</summary>
                            <div v-if="index === 1" class="m-guide-bind-flow">
                                <ol>
                                    <li v-for="step in 3" :key="step">
                                        {{ $t(`achievementGuide.bindFlow.steps.${step - 1}`) }}
                                        <div v-if="step === 2" class="m-guide-token" aria-live="polite">
                                            <button v-if="!isLogin" type="button" @click="loginForBinding">
                                                {{ $t("achievementGuide.bindFlow.login") }}
                                            </button>
                                            <template v-else>
                                                <span v-if="tokenLoading">{{ $t("achievementGuide.bindFlow.loading") }}</span>
                                                <span v-else-if="tokenError">{{ $t("achievementGuide.bindFlow.loadFailed") }}</span>
                                                <button v-else-if="bindToken" type="button" class="u-guide-token" :aria-label="$t('achievementGuide.bindFlow.copy')" @click="copyBindToken">
                                                    <code>{{ bindToken }}</code>
                                                    <span class="u-guide-copy-label"><CopyDocument aria-hidden="true" />{{ $t("achievementGuide.bindFlow.copy") }}</span>
                                                </button>
                                                <button type="button" :disabled="tokenLoading" @click="loadBindToken">
                                                    <Refresh aria-hidden="true" />
                                                    {{ $t("achievementGuide.bindFlow.refresh") }}
                                                </button>
                                            </template>
                                        </div>
                                        <p v-if="step === 2">（{{ $t("achievementGuide.bindFlow.note") }}）</p>
                                    </li>
                                </ol>
                            </div>
                            <div class="m-guide-screenshots">
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
                <div
                    v-for="(_, index) in $tm('achievementGuide.questions')"
                    :id="index === 3 ? 'points-difference' : undefined"
                    :key="index"
                    class="m-guide-question"
                >
                    <h3>{{ $t(`achievementGuide.questions.${index}.title`) }}</h3>
                    <p>{{ $t(`achievementGuide.questions.${index}.text`) }}</p>
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
    > li {
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
        &.u-guide-bind-new {
            background: #e7eef0;
            color: #47666c;
        }
    }
}
.m-guide-role-actions {
    display: flex;
    flex-wrap: wrap;
    column-gap: 12px;
}
.m-guide-bind-flow {
    margin-top: 16px;
    font-size: 14px;
    ol {
        margin: 0;
        padding-left: 22px;
    }
    li + li {
        margin-top: 8px;
    }
    p {
        margin-top: 12px;
        color: #777;
    }
}
.m-guide-token {
    display: flex;
    flex-wrap: wrap;
    align-items: stretch;
    gap: 12px;
    margin-top: 12px;
    button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        min-height: 48px;
        box-sizing: border-box;
        padding: 8px 14px;
        border: 0;
        border-radius: 8px;
        background: #e7eef0;
        color: #47666c;
        font: inherit;
        cursor: pointer;
        &:disabled { opacity: .6; cursor: wait; }
        &:focus-visible { outline: 2px solid #5a7e84; outline-offset: 3px; }
    }
    svg {
        width: 16px;
        height: 16px;
        flex: none;
    }
    .u-guide-copy-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
    }
    .u-guide-token {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 12px;
        max-width: 100%;
        code { font-size: 20px; user-select: text; overflow-wrap: anywhere; }
    }
}
.p-achievement-guide .m-guide-note {
    padding: 12px 24px;
    margin-top: 16px;
    border-left: 2px solid #5a7e84;
    background: #eeebe2;
    color: #6e572c;
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
    scroll-margin-top: 84px;
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
    .m-guide-steps > li,
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
    .m-guide-steps > li,
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
