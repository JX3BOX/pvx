<!-- 外观详情路由页：顶部返回导航条与详情主体，按 key 切换外观并自动同步浏览器标题。 -->
<template>
    <div class="m-ext-single-page">
        <nav class="m-ext-single-nav">
            <PvxActionButton variant="light" @click="backToList">
                <ArrowLeft class="size-4" />{{ $t("exterior.back") }}
            </PvxActionButton>
            <span v-if="detail" class="u-nav-crumb">{{ detail.name }}</span>
        </nav>

        <PvxSurface v-if="detailLoading || detailError" v-loading="detailLoading" padding="medium" class="min-h-64">
            <PvxEmptyState v-if="detailError" :title="$t('exterior.loadError')" :description="detailError" illustrated>
                <template #action>
                    <el-button type="primary" @click="loadDetail(detailId)">{{ $t("exterior.retry") }}</el-button>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <ExteriorDetail v-else-if="detail" :key="detail.key" :item="detail" />
    </div>
</template>

<script>
import { ArrowLeft } from "@element-plus/icons-vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorDetail from "@/components/exterior/ExteriorDetail.vue";
import { getExteriorsDetail } from "@/service/exterior";

export default {
    name: "ExteriorSingle",
    components: { ArrowLeft, PvxActionButton, PvxSurface, PvxEmptyState, ExteriorDetail },
    props: { detailId: { type: String, required: true } },
    data() {
        return {
            detail: null,
            detailError: "",
            detailLoading: true,
            detailRequest: 0,
            controller: null,
        };
    },
    watch: {
        detailId: { immediate: true, handler: "loadDetail" },
    },
    beforeUnmount() {
        this.detailRequest++;
        this.controller?.abort();
    },
    methods: {
        backToList() {
            this.$router.push({ name: "exterior-list", query: { view: this.$route.query.view } });
        },
        async loadDetail(id) {
            const request = ++this.detailRequest;
            this.controller?.abort();
            const controller = (this.controller = new AbortController());
            this.detail = null;
            this.detailError = "";
            this.detailLoading = Boolean(id);

            try {
                const item = await getExteriorsDetail(id, controller.signal);
                if (request !== this.detailRequest || controller.signal.aborted) return;
                if (item) {
                    this.detail = item;
                    if (item.name) document.title = `${item.name} - ${this.$t("pages.index.ui.menus.exterior")}`;
                } else {
                    this.detailError = this.$t("exterior.empty");
                }
            } catch (error) {
                if (request !== this.detailRequest || controller.signal.aborted) return;
                this.detailError = error.code ? `${error.message} (${error.code})` : this.$t("exterior.requestError");
            } finally {
                if (request === this.detailRequest) this.detailLoading = false;
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-single-page {
    display: grid;
    min-width: 0;
    gap: 16px;
}

.m-ext-single-nav {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 14px;
    border-radius: 16px;
    background: @pvx-surface;
    border: 1px solid @pvx-border;
    box-shadow: @pvx-shadow-xs;

    .u-nav-crumb {
        font-size: 14px;
        font-weight: 600;
        color: @pvx-text-secondary;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
