<!-- 外观详情路由页：顶部返回导航条与详情主体，按 key 切换外观并自动同步浏览器标题。 -->
<template>
    <div class="m-ext-single-page">
        <ExteriorBackNav
            show-favorites
            :to="{ name: 'exterior-list', query: { view: $route.query.view } }"
            @open-favorites="favoritesVisible = true"
        />
        <ExteriorStarDrawer v-model="favoritesVisible" view="favorites" @select="favoritesVisible = false" />

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
import ExteriorStarDrawer from "@/components/exterior/ExteriorStarDrawer.vue";
import ExteriorBackNav from "@/components/exterior/ExteriorBackNav.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import ExteriorDetail from "@/components/exterior/ExteriorDetail.vue";
import { getExteriorsDetail } from "@/service/exterior";

export default {
    name: "ExteriorSingle",
    components: { ExteriorStarDrawer, ExteriorBackNav, PvxSurface, PvxEmptyState, ExteriorDetail },
    props: { detailId: { type: String, required: true } },
    data() {
        return {
            favoritesVisible: false,
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
    gap: @pvx-space-5;

    @media (max-width: @phone) {
        gap: 14px;
    }
}
</style>
