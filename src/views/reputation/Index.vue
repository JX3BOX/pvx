<template>
    <PvxPageShell class="p-pvx-reputation-list" v-loading="loading">
        <div class="m-pvx-reputation-layout">
            <PvxSearch
                class="m-pvx-reputation-toolbar"
                :items="searchItems"
                :init-value="searchInitValue"
                variant="modern"
                inline-search-icon
                i18n-scope="pages.reputation.ui.search"
                @search="handleSearch"
            >
                <template #default>
                    <div class="u-pvx-reputation-version" :class="{ 'is-active': dlc !== 'all' }">
                        <label for="reputation-version">{{ $t("pages.reputation.ui.version") }}</label>
                        <el-select
                            id="reputation-version"
                            v-model="dlc"
                            :placeholder="$t('pages.reputation.ui.selectVersion')"
                        >
                            <el-option value="all" :label="$t('pages.reputation.ui.all')" />
                            <el-option
                                v-for="item in localizedVersions"
                                :key="item.value"
                                :value="item.value"
                                :label="item.label"
                            />
                        </el-select>
                    </div>
                </template>
            </PvxSearch>

            <PvxSurface
                v-if="showNewest"
                class="m-pvx-reputation-section m-pvx-reputation-section--newest"
                padding="medium"
            >
                <PvxSectionHeader
                    :title="$t('pages.reputation.ui.newest')"
                    level="h2"
                    class="m-pvx-reputation-section-header"
                >
                    <template #action>
                        <span class="u-pvx-reputation-count">
                            {{ $t("pages.reputation.ui.resultCount", { count: newsList.length }) }}
                        </span>
                    </template>
                </PvxSectionHeader>
                <div class="m-pvx-reputation-grid">
                    <ReputationItem
                        v-for="item in newsList"
                        :key="item.dwForceID"
                        :item="item"
                        variant="modern"
                    />
                </div>
            </PvxSurface>

            <PvxSurface
                v-for="group in showList"
                :key="group.value"
                class="m-pvx-reputation-section"
                padding="medium"
            >
                <PvxSectionHeader :title="group.label" level="h2" class="m-pvx-reputation-section-header">
                    <template #action>
                        <span class="u-pvx-reputation-count">
                            {{ $t("pages.reputation.ui.resultCount", { count: group.list.length }) }}
                        </span>
                    </template>
                </PvxSectionHeader>
                <div class="m-pvx-reputation-grid">
                    <ReputationItem
                        v-for="item in group.list"
                        :key="item.dwForceID"
                        :item="item"
                        variant="modern"
                    />
                </div>
            </PvxSurface>

            <PvxSurface v-if="showEmpty" class="m-pvx-reputation-empty" padding="medium">
                <PvxEmptyState
                    illustrated
                    :title="$t('pages.reputation.ui.empty.title')"
                    :description="$t('pages.reputation.ui.empty.description')"
                />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import PvxSearch from "@/components/PvxSearch.vue";
import ReputationItem from "@/components/reputation/ReputationItem.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { loadReputationList } from "@/service/reputation-data";
import { cloneDeep } from "lodash";

export default {
    name: "ReputationIndex",
    components: {
        PvxSearch,
        ReputationItem,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
    },
    data() {
        return {
            loading: false,
            newsList: [],
            versions: [],
            versionList: [],
            keyword: "",
            dlc: "all",
            searchInitValue: {
                keyword: "",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        searchItems() {
            return [
                {
                    key: "keyword",
                    name: this.$t("pages.reputation.ui.keyword"),
                },
            ];
        },
        localizedVersions() {
            return this.versions.map((item) => ({
                ...item,
                label: this.getVersionLabel(item),
            }));
        },
        showList() {
            let list = cloneDeep(this.versionList);
            if (this.dlc !== "all") {
                list = list.filter((item) => item.value === Number(this.dlc));
            }
            if (this.keyword) {
                const keyword = this.keyword.trim();
                list = list
                    .map((item) => ({
                        ...item,
                        list: item.list.filter((reputation) => reputation.szName.includes(keyword)),
                    }))
                    .filter((item) => item.list.length);
            }
            return list.map((item) => ({
                ...item,
                label: this.getVersionLabel(item),
            }));
        },
        showNewest() {
            return this.dlc === "all" && !this.keyword && this.newsList.length;
        },
        showEmpty() {
            return !this.loading && !this.showNewest && !this.showList.length;
        },
    },
    watch: {
        client() {
            this.loadData();
        },
    },
    methods: {
        handleSearch(data) {
            this.keyword = data.keyword || "";
        },
        getVersionLabel(item) {
            if (!item.mapName) return item.label;
            return this.$t("pages.reputation.ui.versionLabel", {
                name: item.mapName,
                level: item.level,
            });
        },
        loadData() {
            this.loading = true;
            loadReputationList(this.client, 50)
                .then(({ versions, newsList, versionList }) => {
                    this.versions = versions;
                    this.newsList = newsList;
                    this.versionList = versionList;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    mounted() {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/home.less";
@import "~@/assets/css/modules/reputation-list-theme.less";
</style>
