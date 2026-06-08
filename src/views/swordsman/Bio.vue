<template>
    <div class="m-pvx-swordsman-bio">
        <el-collapse v-model="activeNames" class="m-swordsman-bio-collapse">
            <el-collapse-item
                v-for="(bio, index) in bios"
                :key="bio.id || index"
                :name="index"
                :title="bio.title"
            >
                <div v-html="formatDesc(bio.content)"></div>
            </el-collapse-item>

            <el-collapse-item v-if="voiceText" name="voice" title="语音">
                <div class="m-swordsman-voice-text">{{ voiceText }}</div>
            </el-collapse-item>
        </el-collapse>

        <div v-if="!hasContent" class="u-swordsman-bio-empty">暂无传记</div>
    </div>
</template>

<script>
export default {
    name: "SwordsmanBio",
    props: {
        partner: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            activeNames: [0],
        };
    },
    computed: {
        bios() {
            return this.partner?.bios || [];
        },
        voiceText() {
            return this.partner?.voiceText || "";
        },
        hasContent() {
            return this.bios.length > 0 || !!this.voiceText;
        },
    },
    watch: {
        partner: {
            handler() {
                this.activeNames = [0];
            },
            deep: true,
        },
    },
    methods: {
        formatDesc(content) {
            if (!content) return "";
            return String(content).replace(/\n/g, "<br>");
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/swordsman/swordsman-bio.less";

.m-swordsman-voice-text {
    white-space: pre-wrap;
    word-break: break-all;
}
</style>