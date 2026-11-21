<template>
    <div class="grid min-w-0 gap-6 max-md:gap-4">
        <PvxSurface
            tag="nav"
            padding="none"
            radius="medium"
            class="flex items-center px-4 py-3 max-md:px-3 max-md:py-2"
        >
            <PvxActionButton variant="light" @click="backToList">
                <ArrowLeft class="size-4" />{{ $t("exterior.back") }}
            </PvxActionButton>
        </PvxSurface>
        <PvxSurface v-if="detailLoading || detailError" v-loading="detailLoading" padding="medium" class="min-h-48">
            <PvxEmptyState v-if="detailError" :title="$t('exterior.loadError')" :description="detailError" illustrated>
                <template #action>
                    <el-button @click="loadDetail(detailId)">{{ $t("exterior.retry") }}</el-button>
                </template>
            </PvxEmptyState>
        </PvxSurface>
        <ExteriorDetail v-else-if="detail" :key="detail.id" :item="detail" />
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
        return { detail: null, detailError: "", detailLoading: true, detailRequest: 0 };
    },
    watch: {
        detailId: { immediate: true, handler: "loadDetail" },
    },
    beforeUnmount() {
        this.detailRequest++;
    },
    methods: {
        backToList() {
            this.$router.push({ name: "exterior-list", query: { view: this.$route.query.view } });
        },
        async loadDetail(id) {
            const request = ++this.detailRequest;
            this.detail = null;
            this.detailError = "";
            this.detailLoading = Boolean(id);

            try {
                const item = await getExteriorsDetail(id);
                if (request !== this.detailRequest) return;
                if (item) this.detail = item;
                else this.detailError = this.$t("exterior.empty");
            } catch (error) {
                if (request !== this.detailRequest) return;
                this.detailError = error.code ? `${error.message} (${error.code})` : this.$t("exterior.requestError");
            } finally {
                if (request === this.detailRequest) this.detailLoading = false;
            }
        },
    },
};
</script>
