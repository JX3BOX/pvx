<template>
    <PvxToolbar class="m-price-tabs">
        <nav class="m-price-tabs__navigation" :aria-label="$t('pages.pvg.price.ui.navigation')">
            <button
                v-for="tab in tabs"
                :key="tab.value"
                type="button"
                class="u-tab"
                :class="{ active: params.currentTab === tab.value }"
                :aria-current="params.currentTab === tab.value ? 'page' : undefined"
                @click="changeTab(tab)"
            >
                {{ tab.label }}
            </button>
        </nav>

        <div v-if="params.currentTab !== 'gold'" class="u-search">
            <el-input
                :model-value="params.keywords"
                @update:modelValue="updateKeywords"
                :placeholder="$t('pages.pvg.price.ui.searchPlaceholder')"
                clearable
                class="u-search-input"
            >
                <template #prefix>
                    <el-icon class="el-input__icon">
                        <Search />
                    </el-icon>
                </template>
            </el-input>
        </div>
    </PvxToolbar>
</template>
<script>
import PvxToolbar from "@/components/design/PvxToolbar.vue";
import { Search } from "@element-plus/icons-vue";

export default {
    name: "PriceTabs",
    components: { PvxToolbar, Search },
    props: {
        params: { type: Object, required: true },
    },
    emits: ["update:params", "changeTab"],
    computed: {
        tabs() {
            return [
                { label: this.$t("pages.pvg.price.ui.tabs.overview"), value: "" },
                { label: this.$t("pages.pvg.price.ui.tabs.gold"), value: "gold" },
                { label: this.$t("pages.pvg.price.ui.tabs.goods"), value: "goods" },
            ];
        },
    },
    methods: {
        changeTab(tab) {
            this.$emit("update:params", {
                ...this.params,
                currentTab: tab.value,
                keywords: tab.value === "" ? "" : this.params.keywords,
            });
            this.$emit("changeTab", tab.value);
        },
        updateKeywords(val) {
            if (val === this.params.keywords) return;
            const next = { ...this.params, keywords: val };
            if (this.params.currentTab === "" && val) {
                next.currentTab = "goods";
                this.$emit("changeTab", "goods");
            }
            this.$emit("update:params", next);
        },
    },
};
</script>
