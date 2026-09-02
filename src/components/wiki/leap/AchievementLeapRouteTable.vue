<script>
import { Delete, Search } from "@element-plus/icons-vue";
import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { markRaw } from "vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { formatAchievementWorkbenchValue } from "@/utils/achievementWorkbench";

export default {
    name: "AchievementLeapRouteTable",
    components: {
        Delete,
        PvxEmptyState,
        PvxSurface,
    },
    props: {
        items: {
            type: Array,
            default: () => [],
        },
        loading: {
            type: Boolean,
            default: false,
        },
        removable: {
            type: Boolean,
            default: false,
        },
    },
    emits: ["remove"],
    data() {
        return {
            searchIcon: markRaw(Search),
            keyword: "",
            categoryId: "all",
            costTier: "all",
            completion: "all",
            sort: "route",
            page: 1,
            pageSize: 30,
        };
    },
    computed: {
        categories() {
            const categoryMap = new Map();
            this.items.forEach((item) => {
                const id = String(item.category?.id || "");
                if (id && !categoryMap.has(id)) categoryMap.set(id, item.category?.name || id);
            });
            return [...categoryMap].map(([id, name]) => ({ id, name }));
        },
        hasDifficulty() {
            return this.items.some((item) => item.difficulty !== null && item.difficulty !== undefined);
        },
        hasEstimatedMinutes() {
            return this.items.some((item) => item.estimatedMinutes !== null && item.estimatedMinutes !== undefined);
        },
        hasCostScore() {
            return this.items.some((item) => item.costScore !== null && item.costScore !== undefined);
        },
        filteredItems() {
            const keyword = this.keyword.trim().toLowerCase();
            const source = this.items
                .map((item, routeIndex) => ({ ...item, routeIndex }))
                .filter((item) => {
                    if (keyword) {
                        const haystack = [item.name, item.shortDescription, item.guideNote, item.map?.name]
                            .filter(Boolean)
                            .join(" ")
                            .toLowerCase();
                        if (!haystack.includes(keyword)) return false;
                    }
                    if (this.categoryId !== "all" && String(item.category?.id) !== this.categoryId) return false;
                    if (this.costTier !== "all" && item.costTier !== this.costTier) return false;
                    if (
                        this.completion !== "all" &&
                        (this.completion === "completed") !== Boolean(item.completed)
                    ) {
                        return false;
                    }
                    return true;
                });

            source.sort((left, right) => {
                if (this.sort === "points-desc") return right.points - left.points;
                if (this.sort === "difficulty-asc") {
                    return this.compareNullable(left.difficulty, right.difficulty) || right.points - left.points;
                }
                if (this.sort === "time-asc") {
                    return this.compareNullable(left.estimatedMinutes, right.estimatedMinutes) || right.points - left.points;
                }
                if (this.sort === "cost-asc") {
                    return this.compareNullable(left.costScore, right.costScore) || right.points - left.points;
                }
                return left.routeIndex - right.routeIndex;
            });
            return source;
        },
        visibleItems() {
            const start = (this.page - 1) * this.pageSize;
            return this.filteredItems.slice(start, start + this.pageSize);
        },
    },
    watch: {
        keyword() {
            this.page = 1;
        },
        categoryId() {
            this.page = 1;
        },
        costTier() {
            this.page = 1;
        },
        completion() {
            this.page = 1;
        },
        sort() {
            this.page = 1;
        },
        items() {
            this.page = 1;
        },
    },
    methods: {
        iconLink,
        getLink,
        compareNullable(left, right) {
            const leftMissing = left === null || left === undefined;
            const rightMissing = right === null || right === undefined;
            if (leftMissing && !rightMissing) return 1;
            if (!leftMissing && rightMissing) return -1;
            if (leftMissing && rightMissing) return 0;
            return Number(left) - Number(right);
        },
        formatValue(value) {
            return formatAchievementWorkbenchValue(value);
        },
        formatDifficulty(value) {
            if (value === null || value === undefined) return "—";
            const stars = Math.max(0, Math.min(5, Math.round(Number(value))));
            return `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`;
        },
        formatCost(dimension, value) {
            if (value === null || value === undefined) return "—";
            return this.$t(`pages.wiki.leap.ui.workbench.costLevels.${dimension}.${value}`);
        },
        costTierLabel(value) {
            return value ? this.$t(`pages.wiki.leap.ui.workbench.costTiers.${value}`) : "—";
        },
        categoryLabel(item) {
            return item.category?.subName || item.category?.name || "—";
        },
        removeItem(item) {
            this.$emit("remove", item);
        },
    },
};
</script>

<template>
    <PvxSurface class="m-leap-route" padding="medium" v-loading="loading">
        <header class="m-leap-route__header">
            <div>
                <span>{{ $t("pages.wiki.leap.ui.workbench.costLedger") }}</span>
                <h2>{{ $t("pages.wiki.leap.ui.workbench.routeList") }}</h2>
                <p>{{ $t("pages.wiki.leap.ui.workbench.costLedgerDescription") }}</p>
            </div>
            <strong>{{ $t("pages.wiki.leap.ui.achievementCount", { count: filteredItems.length }) }}</strong>
        </header>

        <div class="m-leap-route__filters">
            <el-input
                v-model="keyword"
                clearable
                :prefix-icon="searchIcon"
                :placeholder="$t('pages.wiki.leap.ui.workbench.searchRoute')"
            />
            <el-select v-model="categoryId">
                <el-option :label="$t('pages.wiki.leap.ui.workbench.allCategories')" value="all" />
                <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id" />
            </el-select>
            <el-select v-model="costTier">
                <el-option :label="$t('pages.wiki.leap.ui.workbench.allCostTiers')" value="all" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.costTiers.free')" value="free" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.costTiers.good')" value="good" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.costTiers.grind')" value="grind" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.costTiers.trap')" value="trap" />
            </el-select>
            <el-select v-model="completion">
                <el-option :label="$t('pages.wiki.leap.ui.all')" value="all" />
                <el-option :label="$t('pages.wiki.leap.ui.incomplete')" value="incomplete" />
                <el-option :label="$t('pages.wiki.leap.ui.completed')" value="completed" />
            </el-select>
            <el-select v-model="sort">
                <el-option :label="$t('pages.wiki.leap.ui.workbench.routeOrder')" value="route" />
                <el-option :label="$t('pages.wiki.leap.ui.workbench.pointsDescending')" value="points-desc" />
                <el-option
                    :label="$t('pages.wiki.leap.ui.workbench.difficultyAscending')"
                    value="difficulty-asc"
                    :disabled="!hasDifficulty"
                />
                <el-option
                    :label="$t('pages.wiki.leap.ui.workbench.timeAscendingPending')"
                    value="time-asc"
                    :disabled="!hasEstimatedMinutes"
                />
                <el-option
                    :label="$t('pages.wiki.leap.ui.workbench.costAscendingPending')"
                    value="cost-asc"
                    :disabled="!hasCostScore"
                />
            </el-select>
        </div>

        <div v-if="filteredItems.length" class="m-leap-route__scroll">
            <table>
                <thead>
                    <tr>
                        <th>{{ $t("pages.wiki.leap.ui.status") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.achievementName") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.category") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.points") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.money") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.timeCost") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.luck") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.difficulty") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.costPerformance") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.schoolRestriction") }}</th>
                        <th>{{ $t("pages.wiki.leap.ui.workbench.routeNote") }}</th>
                        <th v-if="removable" class="u-leap-route-action">
                            {{ $t("pages.wiki.leap.ui.workbench.action") }}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in visibleItems" :key="item.id" :class="{ 'is-completed': item.completed }">
                        <td>
                            <span class="u-leap-status" :class="{ 'is-completed': item.completed }">
                                {{
                                    item.completed
                                        ? $t("pages.wiki.leap.ui.completed")
                                        : $t("pages.wiki.leap.ui.incomplete")
                                }}
                            </span>
                        </td>
                        <td class="u-leap-achievement-cell">
                            <a :href="getLink('achievement', item.id)" target="_blank" rel="noopener noreferrer">
                                <img v-if="item.iconId" :src="iconLink(item.iconId)" alt="" />
                                <span>
                                    <strong>{{ item.name || item.id }}</strong>
                                    <small v-if="item.map?.name">{{ item.map.name }}</small>
                                </span>
                            </a>
                        </td>
                        <td>{{ categoryLabel(item) }}</td>
                        <td class="u-leap-number">{{ formatValue(item.points) }}</td>
                        <td>{{ formatCost("money", item.cost?.money) }}</td>
                        <td>{{ formatCost("time", item.cost?.time) }}</td>
                        <td>{{ formatCost("luck", item.cost?.luck) }}</td>
                        <td class="u-leap-difficulty">{{ formatDifficulty(item.difficulty) }}</td>
                        <td>
                            <span v-if="item.costTier" class="u-leap-cost-tier" :class="`is-${item.costTier}`">
                                {{ costTierLabel(item.costTier) }}
                            </span>
                            <span v-else>—</span>
                        </td>
                        <td>{{ formatValue(item.restriction?.school) }}</td>
                        <td class="u-leap-note">{{ formatValue(item.guideNote) }}</td>
                        <td v-if="removable" class="u-leap-route-action">
                            <button
                                type="button"
                                class="u-leap-remove-button"
                                :aria-label="$t('pages.wiki.leap.ui.workbench.removeRouteItemLabel', { name: item.name || item.id })"
                                @click="removeItem(item)"
                            >
                                <Delete aria-hidden="true" />
                                {{ $t("pages.wiki.leap.ui.workbench.removeRouteItem") }}
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <PvxEmptyState
            v-else-if="!loading"
            class="m-leap-route__empty"
            :title="$t('pages.wiki.leap.ui.noAchievements')"
            :description="$t('pages.wiki.leap.ui.workbench.noRouteResults')"
        >
            <template #icon><Search /></template>
        </PvxEmptyState>

        <div v-if="filteredItems.length > pageSize" class="m-leap-route__pagination">
            <el-pagination
                v-model:current-page="page"
                background
                layout="prev, pager, next"
                :page-size="pageSize"
                :total="filteredItems.length"
            />
        </div>

        <p class="u-leap-route-hint">{{ $t("pages.wiki.leap.ui.workbench.costFormulaHint") }}</p>
    </PvxSurface>
</template>

<style lang="less" scoped>
.m-leap-route {
    min-width: 0;
    color: #344143;
}

.m-leap-route__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 16px;
}

.m-leap-route__header span {
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-leap-route__header h2 {
    margin: 4px 0;
    font-size: 20px;
}

.m-leap-route__header p {
    margin: 0;
    color: #7a8586;
    line-height: 1.6;
}

.m-leap-route__header > strong {
    color: #547277;
    font-size: 13px;
    white-space: nowrap;
}

.m-leap-route__filters {
    display: grid;
    grid-template-columns: minmax(220px, 1.6fr) repeat(4, minmax(140px, 1fr));
    gap: 10px;
    margin-bottom: 12px;
}

.m-leap-route__scroll {
    width: 100%;
    max-width: 100%;
    border: 1px solid rgba(68, 86, 84, 0.13);
    border-radius: 11px;
    overflow-x: auto;
}

table {
    width: 100%;
    min-width: 1360px;
    border-collapse: collapse;
    background: #fffdf8;
}

th,
td {
    padding: 11px 12px;
    border-bottom: 1px solid rgba(68, 86, 84, 0.1);
    color: #687274;
    font-size: 12px;
    text-align: left;
    white-space: nowrap;
}

th {
    position: sticky;
    top: 0;
    z-index: 1;
    color: #405659;
    background: #f0ece3;
    font-weight: 700;
}

tbody tr:last-child td {
    border-bottom: 0;
}

tbody tr.is-completed {
    opacity: 0.62;
}

.u-leap-status,
.u-leap-cost-tier {
    display: inline-flex;
    padding: 4px 8px;
    border-radius: 999px;
    color: #a3543f;
    background: #f8e8e3;
    font-size: 11px;
    font-weight: 700;
}

.u-leap-status.is-completed {
    color: #356b5c;
    background: #e5f0ea;
}

.u-leap-cost-tier.is-free {
    color: #356b5c;
    background: #e5f0ea;
}

.u-leap-cost-tier.is-good {
    color: #47777d;
    background: #e4eff0;
}

.u-leap-cost-tier.is-grind {
    color: #946c2f;
    background: #f5ecd8;
}

.u-leap-cost-tier.is-trap {
    color: #a3543f;
    background: #f8e8e3;
}

.u-leap-achievement-cell a {
    display: flex;
    max-width: 300px;
    align-items: center;
    gap: 9px;
    color: #34484a;
    text-decoration: none;
}

.u-leap-achievement-cell img {
    width: 34px;
    height: 34px;
    border-radius: 7px;
    object-fit: cover;
}

.u-leap-achievement-cell span {
    display: grid;
    min-width: 0;
    gap: 2px;
}

.u-leap-achievement-cell strong,
.u-leap-achievement-cell small {
    overflow: hidden;
    text-overflow: ellipsis;
}

.u-leap-achievement-cell small {
    color: #9aa2a2;
}

.u-leap-number,
.u-leap-difficulty {
    color: #8e6d32;
    font-variant-numeric: tabular-nums;
}

.u-leap-note {
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
}

.u-leap-route-action {
    position: sticky;
    right: 0;
    width: 82px;
    background: #fffdf8;
    box-shadow: -8px 0 12px rgba(52, 65, 67, 0.05);
    text-align: center;
}

th.u-leap-route-action {
    z-index: 2;
    background: #f0ece3;
}

.u-leap-remove-button {
    display: inline-flex;
    min-height: 30px;
    align-items: center;
    justify-content: center;
    gap: 5px;
    padding: 5px 9px;
    border: 1px solid rgba(163, 84, 63, 0.2);
    border-radius: 7px;
    color: #a3543f;
    background: #fff7f4;
    cursor: pointer;
}

.u-leap-remove-button:hover,
.u-leap-remove-button:focus-visible {
    border-color: #a3543f;
    background: #f8e8e3;
}

.u-leap-remove-button svg {
    width: 14px;
}

.m-leap-route__pagination {
    display: flex;
    justify-content: center;
    margin-top: 16px;
}

.u-leap-route-hint {
    margin: 12px 0 0;
    color: #939b9b;
    font-size: 12px;
    line-height: 1.6;
}

@media (max-width: 1120px) {
    .m-leap-route__filters {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }
}

@media (max-width: 720px) {
    .m-leap-route__header {
        display: grid;
    }

    .m-leap-route__filters {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
