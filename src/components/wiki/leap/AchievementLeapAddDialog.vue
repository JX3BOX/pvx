<script>
import { Plus, Search } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { markRaw } from "vue";

export default {
    name: "AchievementLeapAddDialog",
    components: {
        Plus,
    },
    props: {
        modelValue: {
            type: Boolean,
            default: false,
        },
        results: {
            type: Array,
            default: () => [],
        },
        selectedIds: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["update:modelValue", "search", "add"],
    data() {
        return {
            searchIcon: markRaw(Search),
            keyword: "",
            searched: false,
        };
    },
    computed: {
        selectedIdSet() {
            return new Set(this.selectedIds.map(String));
        },
        visibleResults() {
            return this.results.slice(0, 60);
        },
    },
    watch: {
        modelValue(value) {
            if (!value) return;
            this.keyword = "";
            this.searched = false;
        },
    },
    methods: {
        iconLink,
        getLink,
        close() {
            this.$emit("update:modelValue", false);
        },
        submitSearch() {
            const keyword = this.keyword.trim();
            if (!keyword || this.loading) return;
            this.searched = true;
            this.$emit("search", keyword);
        },
        isSelected(item) {
            return this.selectedIdSet.has(String(item.id));
        },
        formatNumber(value) {
            return Number(value || 0).toLocaleString();
        },
        formatDifficulty(value) {
            if (value === null || value === undefined) return "—";
            const stars = Math.max(0, Math.min(5, Math.round(Number(value))));
            return `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`;
        },
    },
};
</script>

<template>
    <el-dialog
        :model-value="modelValue"
        class="c-leap-add-dialog"
        width="760px"
        append-to-body
        destroy-on-close
        :title="$t('pages.wiki.leap.ui.workbench.addRouteItems')"
        @update:model-value="$emit('update:modelValue', $event)"
    >
        <div class="m-leap-add-dialog">
            <p>{{ $t("pages.wiki.leap.ui.workbench.addRouteItemsDescription") }}</p>
            <div class="m-leap-add-dialog__search">
                <el-input
                    v-model="keyword"
                    clearable
                    :prefix-icon="searchIcon"
                    :placeholder="$t('pages.wiki.leap.ui.workbench.searchRouteItemsToAdd')"
                    @keyup.enter="submitSearch"
                />
                <button type="button" :disabled="!keyword.trim() || loading" @click="submitSearch">
                    {{
                        loading
                            ? $t("pages.wiki.leap.ui.workbench.searchingRouteItems")
                            : $t("pages.wiki.leap.ui.workbench.searchRouteItems")
                    }}
                </button>
            </div>

            <div v-if="visibleResults.length" class="m-leap-add-dialog__results" v-loading="loading">
                <article v-for="item in visibleResults" :key="item.id">
                    <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer">
                        <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" />
                        <span>
                            <strong>{{ item.name || item.id }}</strong>
                            <small>{{ item.category?.subName || item.category?.name || "—" }}</small>
                        </span>
                    </a>
                    <div class="m-leap-add-dialog__meta">
                        <span>+{{ formatNumber(item.points) }}</span>
                        <small>{{ formatDifficulty(item.difficulty) }}</small>
                    </div>
                    <button type="button" :disabled="isSelected(item)" @click="$emit('add', item)">
                        <Plus />
                        {{
                            isSelected(item)
                                ? $t("pages.wiki.leap.ui.workbench.routeItemAdded")
                                : $t("pages.wiki.leap.ui.workbench.addRouteItem")
                        }}
                    </button>
                </article>
            </div>

            <div v-else class="m-leap-add-dialog__empty" v-loading="loading">
                {{
                    searched
                        ? $t("pages.wiki.leap.ui.workbench.noRouteItemsToAdd")
                        : $t("pages.wiki.leap.ui.workbench.addRouteItemsSearchHint")
                }}
            </div>
        </div>
        <template #footer>
            <button type="button" class="u-leap-add-dialog-close" @click="close">
                {{ $t("pages.wiki.leap.ui.workbench.finishAdding") }}
            </button>
        </template>
    </el-dialog>
</template>

<style lang="less">
.c-leap-add-dialog {
    max-width: calc(100vw - 32px);
}

.c-leap-add-dialog .m-leap-add-dialog {
    display: grid;
    gap: 14px;
    color: #405052;
}

.c-leap-add-dialog .m-leap-add-dialog > p {
    margin: 0;
    color: #7b8586;
    line-height: 1.65;
}

.c-leap-add-dialog .m-leap-add-dialog__search {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
}

.c-leap-add-dialog .m-leap-add-dialog__search > button,
.c-leap-add-dialog .u-leap-add-dialog-close,
.c-leap-add-dialog .m-leap-add-dialog__results article > button {
    display: inline-flex;
    min-height: 38px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 8px 14px;
    border: 1px solid #47777d;
    border-radius: 8px;
    color: #fff;
    background: #47777d;
    cursor: pointer;
}

.c-leap-add-dialog .m-leap-add-dialog__search > button:disabled,
.c-leap-add-dialog .m-leap-add-dialog__results article > button:disabled {
    border-color: #b7c0c0;
    color: #fff;
    background: #b7c0c0;
    cursor: not-allowed;
}

.c-leap-add-dialog .m-leap-add-dialog__results {
    display: grid;
    max-height: min(520px, 60vh);
    gap: 8px;
    padding-right: 4px;
    overflow-y: auto;
}

.c-leap-add-dialog .m-leap-add-dialog__results article {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border: 1px solid rgba(70, 91, 90, 0.12);
    border-radius: 10px;
    background: #fffdf8;
}

.c-leap-add-dialog .m-leap-add-dialog__results article > a {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 10px;
    color: #34484a;
    text-decoration: none;
}

.c-leap-add-dialog .m-leap-add-dialog__results img {
    width: 42px;
    height: 42px;
    flex: 0 0 auto;
    border-radius: 8px;
    object-fit: cover;
}

.c-leap-add-dialog .m-leap-add-dialog__results a > span {
    display: grid;
    min-width: 0;
    gap: 3px;
}

.c-leap-add-dialog .m-leap-add-dialog__results strong,
.c-leap-add-dialog .m-leap-add-dialog__results small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.c-leap-add-dialog .m-leap-add-dialog__results small {
    color: #899293;
}

.c-leap-add-dialog .m-leap-add-dialog__meta {
    display: grid;
    min-width: 84px;
    gap: 3px;
    color: #a88139;
    font-variant-numeric: tabular-nums;
    text-align: right;
}

.c-leap-add-dialog .m-leap-add-dialog__meta small {
    color: #93805e;
}

.c-leap-add-dialog .m-leap-add-dialog__results svg {
    width: 14px;
}

.c-leap-add-dialog .m-leap-add-dialog__empty {
    display: flex;
    min-height: 160px;
    align-items: center;
    justify-content: center;
    border: 1px dashed rgba(70, 91, 90, 0.22);
    border-radius: 10px;
    color: #929a9b;
    text-align: center;
}

.c-leap-add-dialog .u-leap-add-dialog-close {
    color: #47777d;
    background: transparent;
}

@media (max-width: 720px) {
    .c-leap-add-dialog .m-leap-add-dialog__search,
    .c-leap-add-dialog .m-leap-add-dialog__results article {
        grid-template-columns: minmax(0, 1fr);
    }

    .c-leap-add-dialog .m-leap-add-dialog__results article > button {
        min-height: 44px;
    }

    .c-leap-add-dialog .m-leap-add-dialog__meta {
        display: flex;
        text-align: left;
    }
}
</style>
