<template>
    <PvxPageShell class="m-pvx-facedata p-pvx-body-parse m-pvx-fb-parse" :class="{ on: done }">
        <div class="m-pvx-fb-parse__content">
            <PvxSurface class="m-pvx-fb-parse__hero" padding="large">
                <PvxSectionHeader
                    :title="$t('pages.body.ui.parse.title')"
                    :description="$t('pages.body.ui.parse.description')"
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
                        <h2>{{ $t("pages.body.ui.parse.importTitle") }}</h2>
                        <p>{{ $t("pages.body.ui.parse.importDescription") }}</p>
                    </div>
                    <span v-if="done" class="u-status is-success">
                        <el-icon><CircleCheckFilled /></el-icon>
                        {{ $t("pages.faceBody.parse.complete") }}
                    </span>
                </div>

                <div class="m-pvx-fb-parse__upload-stage" :class="{ 'is-done': done }">
                    <template v-if="!done">
                        <span class="u-upload-icon"><UploadFilled /></span>
                        <strong>{{ $t("pages.body.ui.parse.selectFile") }}</strong>
                        <p>{{ $t("pages.body.ui.parse.formats") }}</p>
                    </template>
                    <Upload type="body" @success="handleSuccess">
                        <template #guide>
                            <a class="u-help" href="/tool/67546" target="_blank" rel="noopener noreferrer">
                                <el-icon><Collection /></el-icon>
                                {{ $t("pages.body.ui.parse.guide") }}
                            </a>
                        </template>
                    </Upload>
                </div>

                <div class="m-pvx-fb-parse__tips">
                    <div class="u-tip-item">
                        <el-icon><Document /></el-icon>
                        <span><b>{{ $t("pages.faceBody.parse.compatibility") }}</b><small>{{ $t("pages.body.ui.parse.compatibilityDescription") }}</small></span>
                    </div>
                    <div class="u-tip-item">
                        <el-icon><Lock /></el-icon>
                        <span><b>{{ $t("pages.faceBody.parse.privacy") }}</b><small>{{ $t("pages.faceBody.parse.privacyDescription") }}</small></span>
                    </div>
                </div>
            </PvxSurface>

            <PvxSurface v-if="done" class="m-pvx-fb-parse__result-panel" padding="large">
                <div class="m-pvx-fb-parse__section-header">
                    <span class="u-step">02</span>
                    <div>
                        <h2>{{ $t("pages.faceBody.parse.result") }}</h2>
                        <p>{{ $t("pages.body.ui.parse.resultDescription") }}</p>
                    </div>
                </div>
                <Bodydat class="m-pvx-fb-parse__preview" :data="json" :lock="false" />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
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

export default {
    name: "BodyDataParse",
    data: function () {
        return {
            data: "",
            done: false,
        };
    },
    computed: {
        json: function () {
            return this.data || "";
        },
    },
    methods: {
        handleSuccess: function (data) {
            this.data = data;
            this.done = Boolean(data?.json);
        },
    },
    components: {
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
};
</script>

<style lang="less">
@import "~@/assets/css/common/face-body/parse.less";
</style>
