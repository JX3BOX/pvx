<template>
    <PvxPageShell class="m-pvx-facedata p-pvx-face-parse m-pvx-fb-parse" :class="{ on: done }">
        <div class="m-pvx-fb-parse__content">
            <PvxSurface class="m-pvx-fb-parse__hero" padding="large">
                <PvxSectionHeader
                    title="捏脸数据解析器"
                    description="读取本地文件，快速查看脸型骨骼、妆容与参数明细"
                    level="h1"
                >
                    <template #icon><DataAnalysis /></template>
                    <template #action>
                        <span class="m-pvx-fb-parse__privacy">
                            <el-icon><Lock /></el-icon>
                            仅在本地解析
                        </span>
                    </template>
                </PvxSectionHeader>
            </PvxSurface>

            <PvxSurface class="m-pvx-fb-parse__upload-panel" padding="large">
                <div class="m-pvx-fb-parse__section-header">
                    <span class="u-step">01</span>
                    <div>
                        <h2>导入脸型数据文件</h2>
                        <p>选择需要查看的游戏脸型文件，解析完成后将在下方展示详细参数。</p>
                    </div>
                    <span v-if="done" class="u-status is-success">
                        <el-icon><CircleCheckFilled /></el-icon>
                        解析完成
                    </span>
                </div>

                <div class="m-pvx-fb-parse__upload-stage" :class="{ 'is-done': done }">
                    <template v-if="!done">
                        <span class="u-upload-icon"><UploadFilled /></span>
                        <strong>选择一个脸型数据文件</strong>
                        <p>支持 .dat、.jx3dat 与 .ini 格式</p>
                    </template>
                    <Upload type="face" @success="handleSuccess">
                        <template #guide>
                            <a class="u-help" href="/tool/746" target="_blank" rel="noopener noreferrer">
                                <el-icon><Collection /></el-icon>
                                游戏脸型导入导出指南
                            </a>
                        </template>
                    </Upload>
                </div>

                <div class="m-pvx-fb-parse__tips">
                    <div class="u-tip-item">
                        <el-icon><Document /></el-icon>
                        <span><b>文件兼容</b><small>支持正式服、怀旧服及编辑器脸型数据</small></span>
                    </div>
                    <div class="u-tip-item">
                        <el-icon><Lock /></el-icon>
                        <span><b>隐私保护</b><small>文件只在当前浏览器中读取，不会上传到服务器</small></span>
                    </div>
                </div>
            </PvxSurface>

            <PvxSurface v-if="done" class="m-pvx-fb-parse__result-panel" padding="large">
                <div class="m-pvx-fb-parse__section-header">
                    <span class="u-step">02</span>
                    <div>
                        <h2>解析结果</h2>
                        <p>切换分类查看各项脸型参数，滑杆仅用于直观展示数据位置。</p>
                    </div>
                </div>
                <Facedat class="m-pvx-fb-parse__preview" :data="data" :lock="true" />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import Facedat from "@jx3box/jx3box-facedat/src/Facedat";
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
    name: "FacedataParse",
    props: [],
    data: function () {
        return {
            data: "",
            done: false,
        };
    },
    computed: {
        json: function () {
            return this.data && this.data.json;
        },
    },
    methods: {
        handleSuccess: function (data) {
            this.data = data;
            this.done = Boolean(data?.json);
        },
    },
    mounted: function () {},
    components: {
        Facedat,
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
