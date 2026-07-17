<template>
    <PvxPageShell
        class="m-pvx-facedata m-pvx-fb-parse"
        :class="[`p-pvx-${type}-parse`, { on: done }]"
    >
        <div class="m-pvx-fb-parse__content">
            <PvxSurface class="m-pvx-fb-parse__hero" padding="large">
                <PvxSectionHeader
                    :title="$t(`${localeBase}.title`)"
                    :description="$t(`${localeBase}.description`)"
                    level="h1"
                >
                    <template #icon><DataAnalysis /></template>
                    <template #action>
                        <span class="m-pvx-fb-parse__privacy">
                            <el-icon><Lock /></el-icon>
                            {{ $t("pages.faceBody.parse.localOnly") }}
                        </span>
                    </template>
                </PvxSectionHeader>
            </PvxSurface>

            <PvxSurface class="m-pvx-fb-parse__upload-panel" padding="large">
                <div class="m-pvx-fb-parse__section-header">
                    <span class="u-step">01</span>
                    <div>
                        <h2>{{ $t(`${localeBase}.importTitle`) }}</h2>
                        <p>{{ $t(`${localeBase}.importDescription`) }}</p>
                    </div>
                    <span v-if="done" class="u-status is-success">
                        <el-icon><CircleCheckFilled /></el-icon>
                        {{ $t("pages.faceBody.parse.complete") }}
                    </span>
                </div>

                <div class="m-pvx-fb-parse__upload-stage" :class="{ 'is-done': done }">
                    <template v-if="!done">
                        <span class="u-upload-icon"><UploadFilled /></span>
                        <strong>{{ $t(`${localeBase}.selectFile`) }}</strong>
                        <p>{{ $t(`${localeBase}.formats`) }}</p>
                    </template>
                    <Upload :type="type" @success="handleSuccess">
                        <template #guide>
                            <a class="u-help" :href="guideUrl" target="_blank" rel="noopener noreferrer">
                                <el-icon><Collection /></el-icon>
                                {{ $t(`${localeBase}.guide`) }}
                            </a>
                        </template>
                    </Upload>
                </div>

                <div class="m-pvx-fb-parse__tips">
                    <div class="u-tip-item">
                        <el-icon><Document /></el-icon>
                        <span>
                            <b>{{ $t("pages.faceBody.parse.compatibility") }}</b>
                            <small>{{ $t(`${localeBase}.compatibilityDescription`) }}</small>
                        </span>
                    </div>
                    <div class="u-tip-item">
                        <el-icon><Lock /></el-icon>
                        <span>
                            <b>{{ $t("pages.faceBody.parse.privacy") }}</b>
                            <small>{{ $t("pages.faceBody.parse.privacyDescription") }}</small>
                        </span>
                    </div>
                </div>
            </PvxSurface>

            <PvxSurface v-if="done" class="m-pvx-fb-parse__result-panel" padding="large">
                <div class="m-pvx-fb-parse__section-header">
                    <span class="u-step">02</span>
                    <div>
                        <h2>{{ $t("pages.faceBody.parse.result") }}</h2>
                        <p>{{ $t(`${localeBase}.resultDescription`) }}</p>
                    </div>
                </div>
                <component
                    :is="parserComponent"
                    class="m-pvx-fb-parse__preview"
                    :data="data"
                    :lock="parserLocked"
                />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import Facedat from "@jx3box/jx3box-facedat/src/Facedat";
import Bodydat from "@jx3box/jx3box-facedat/src/Bodydat.vue";
import Upload from "@jx3box/jx3box-facedat/src/Upload";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import {
    CircleCheckFilled,
    Collection,
    DataAnalysis,
    Document,
    Lock,
    UploadFilled,
} from "@element-plus/icons-vue";

const GUIDE_URL = {
    face: "/tool/746",
    body: "/tool/67546",
};

export default {
    name: "FaceBodyParsePage",
    components: {
        Facedat,
        Bodydat,
        Upload,
        PvxPageShell,
        PvxSurface,
        PvxSectionHeader,
        CircleCheckFilled,
        Collection,
        DataAnalysis,
        Document,
        Lock,
        UploadFilled,
    },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ["face", "body"].includes(value),
        },
    },
    data() {
        return {
            data: "",
            done: false,
        };
    },
    computed: {
        localeBase() {
            return `pages.${this.type}.ui.parse`;
        },
        guideUrl() {
            return GUIDE_URL[this.type];
        },
        parserComponent() {
            return this.type === "face" ? "Facedat" : "Bodydat";
        },
        parserLocked() {
            return this.type === "face";
        },
    },
    methods: {
        handleSuccess(data) {
            this.data = data;
            this.done = Boolean(data?.json);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/parse.less";
</style>
