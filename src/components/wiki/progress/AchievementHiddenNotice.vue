<script>
import { ArrowDown } from "@element-plus/icons-vue";
import { getBreadcrumb } from "@jx3box/jx3box-common/js/system";
import noticeIcon from "@/assets/img/pvg/notice.svg";

export default {
    name: "AchievementHiddenNotice",
    components: { ArrowDown },
    data() {
        return { noticeIcon, html: "" };
    },
    async mounted() {
        try {
            this.html = await getBreadcrumb("achievements_hidden_ac");
        } catch (error) {
            this.html = "";
        }
    },
};
</script>

<template>
    <details v-if="html" class="m-hidden-notice" open>
        <summary>
            <img :src="noticeIcon" alt="" aria-hidden="true" />
            <strong>{{ $t('achievementAppearance.hiddenNoticeTitle') }}</strong>
            <span class="u-hidden-notice-toggle">
                <span class="is-expand">{{ $t('achievementAppearance.expand') }}</span>
                <span class="is-collapse">{{ $t('achievementAppearance.collapse') }}</span>
                <ArrowDown aria-hidden="true" />
            </span>
        </summary>
        <div class="m-hidden-notice-content" v-html="html"></div>
    </details>
</template>

<style lang="less" scoped>
.m-hidden-notice {
    min-width: 0;
    border-radius: 16px;
    background: #fff;
    box-shadow: 0 2px 10px #0000000d;
    color: #333;
    font-size: 14px;
    summary {
        display: flex;
        align-items: center;
        gap: 12px;
        min-height: 44px;
        padding: 10px 20px;
        list-style: none;
        cursor: pointer;
        &::-webkit-details-marker { display: none; }
        &:focus-visible { outline: 2px solid #5a7e84; outline-offset: 3px; border-radius: 16px; }
        > img { width: 17px; height: 16px; flex: none; }
        strong { font-weight: 500; }
    }
    .m-hidden-notice-content {
        padding: 0 20px 16px;
        overflow-wrap: anywhere;
        :deep(ol) { list-style: decimal; }
        :deep(ul) { list-style: disc; }
    }
    .is-collapse { display: none; }
    &[open] {
        .is-collapse { display: inline; }
        .is-expand { display: none; }
        .u-hidden-notice-toggle svg { transform: rotate(180deg); }
    }
}
.u-hidden-notice-toggle {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: auto;
    color: #5a7e84;
    white-space: nowrap;
    svg { width: 16px; height: 16px; }
}
</style>
