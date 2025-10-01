<template>
    <div class="m-facedata">
        <div class="m-face-parse" :class="{ on: done }">
            <h1 class="m-face-parse-title">捏脸数据解析器</h1>
            <Upload type="face" @success="handleSuccess">
                <template #guide>
                    <a class="u-help" href="/tool/746" target="_blank">
                        <i class="el-icon-collection"></i> 游戏脸型导入导出指南
                    </a>
                </template>
            </Upload>
            <Facedat class="m-face-parse-preview" :data="data" :lock="true" v-if="data" />
        </div>
    </div>
</template>

<script>
import Facedat from "@jx3box/jx3box-facedat/src/Facedat";
import Upload from "@jx3box/jx3box-facedat/src/Upload";
import { __imgPath } from "@/utils/config";
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
            if (data?.json) {
                this.done = true;
            } else {
                this.done = false;
            }
        },
    },
    mounted: function () {},
    components: {
        Facedat,
        Upload,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/parse.less";
</style>
