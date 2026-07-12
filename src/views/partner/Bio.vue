<template>
    <div class="m-pvx-partner-bio">
        <el-collapse v-model="activeNames" class="m-partner-bio-collapse">
            <el-collapse-item v-for="(bio, index) in bios" :key="bio.id || index" :name="index" :title="bio.title">
                <div v-html="formatDesc(bio.content)"></div>
            </el-collapse-item>

            <el-collapse-item v-if="voiceText" name="voice" :title="$t('pages.partner.ui.voiceText')">
                <div class="m-partner-voice-text" v-html="formatDesc(voiceText)"></div>
            </el-collapse-item>
        </el-collapse>

        <div v-if="!hasContent" class="u-partner-bio-empty">{{ $t("pages.partner.ui.emptyBio") }}</div>
    </div>
</template>

<script>
import { sanitizeBasicHtml } from "@/utils/sanitize-html";

export default {
    name: "PartnerBio",
    props: {
        partner: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            activeNames: [],
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
        // 计算默认展开项：传记第一项或语音（传记为空时）
        defaultActiveName() {
            if (this.bios.length > 0) {
                return [0]; // 有传记时展开第一项
            }
            if (this.voiceText) {
                return ["voice"]; // 无传记有语音时展开语音
            }
            return [];
        },
    },
    watch: {
        partner: {
            handler() {
                // 切换侠客时重置为默认展开状态
                this.activeNames = this.defaultActiveName;
            },
            deep: true,
            immediate: true, // 初始化时也设置默认展开
        },
    },
    methods: {
        formatDesc(content) {
            if (!content) return "";
            // 处理两种换行符形式：
            // 1. 字符串形式的转义字符 \\n（数据中存储为 "\n" 字符串）
            // 2. 真正的换行符 \n
            return sanitizeBasicHtml(content);
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/partner/partner-bio.less";

    .m-partner-voice-text {
        white-space: pre-wrap;
        word-break: break-all;
    }
</style>
