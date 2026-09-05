<script>
import { Search, Refresh, Back } from "@element-plus/icons-vue";
import { fetchAchievementWorkbenchRecordsBatched, fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchTags, fetchAchievementWorkbenchTag } from "@/service/achievementWorkbench";
import { applyAchievementWorkbenchEnrichment, normalizeAchievementWorkbenchTags } from "@/utils/achievementWorkbench";
import AchievementRecommendationGroupIndex from "./AchievementRecommendationGroupIndex.vue";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";
import {
    flattenAchievementRecommendation, hydrateAchievementRecommendation, achievementRecommendationGroupLabel,
    resolveAchievementRecommendationSelection, removeAchievementRecommendationItem,
    filterAchievementRecommendationItems, enrichAchievementRecommendationRecords, achievementRecommendationFilterOptions,
    achievementRecommendationPlace, moveAchievementRecommendationItem,
    formatAchievementRecommendationDate, achievementRecommendationExclusions,
} from "@/utils/achievementRecommendation";

const emptyFilters = () => ({ keyword: "", mapIds: [], categories: [] });
const exclusionReasons = new Set(["completed", "dependency_or_series", "mount_or_body_type", "recommendation_excluded",
    "missing_dimensions", "direction_weight_zero", "category_filtered", "dimension_range"]);

export default {
    name: "AchievementLeapRecommendation",
    components: { Search, Refresh, Back, AchievementRecommendationGroupIndex, AchievementRecommendationItems },
    props: {
        dimensions: { type: Array, default: () => [] },
        hasRequested: { type: Boolean, default: false },
        canRequest: { type: Boolean, default: false },
        recommendation: { type: Object, default: null },
        loading: { type: Boolean, default: false },
        disabled: { type: Boolean, default: false },
        roleAvailable: { type: Boolean, default: false },
        client: { type: String, default: "std" },
        error: { type: String, default: "" },
        metadata: { type: Object, default: () => ({}) },
        menus: { type: Object, default: () => ({}) },
        maps: { type: Array, default: () => [] },
        targetPoints: { type: Number, required: true },
    },
    emits: ["selection-change", "refresh"],
    data() {
        return { tab: "recommended", showSelectedOnly: true, groups: [], recordCache: {}, filters: emptyFilters(), activeGroup: "",
            detailStates: {}, difficultyCache: {}, difficultyStates: {}, expandedGroups: [], contextId: 0, requestId: 0,
            tagCache: {}, tagStates: {}, eventTagCache: {}, eventTagsLoading: false, eventTagsError: false,
            filterIndex: {}, filterIndexReady: false, filterIndexLoading: false, filterIndexError: false };
    },
    computed: {
        snapshotDateLabel() { return this.dateLabel(this.recommendation?.role.snapshot_updated_at); },
        exclusions() { return achievementRecommendationExclusions(this.recommendation?.excluded_summary); },
        draftRows() {
            return this.recommendation ? flattenAchievementRecommendation({ ...this.recommendation, recommendations: this.groups }) : [];
        },
        upcomingRows() {
            return (this.recommendation?.upcoming_events || []).flatMap((event) => event.ids.map((id) => ({
                id: String(id), recommendationGroup: `event:${event.tag_id}`, nextStartAt: event.next_start_at,
            })));
        },
        draftItems() {
            // Catalog points keep plan selection independent of which groups have been visited.
            return this.draftRows.map((row) => ({ ...row, points: this.metadata[row.id]?.point }));
        },
        selectionResult() {
            return resolveAchievementRecommendationSelection(this.draftItems, this.recommendation?.role.current_points || 0, this.targetPoints);
        },
        pointsMissing() { return this.selectionResult.missingPointId !== null; },
        sourceRows() { return this.tab === "upcoming" ? this.upcomingRows : this.draftRows; },
        hasFilters() { return Boolean(this.filters.keyword.trim() || this.filters.mapIds.length || this.filters.categories.length); },
        indexedItems() { return this.sourceRows.filter((row) => this.filterIndex[row.id]).map((row) => ({ ...this.filterIndex[row.id], ...row })); },
        matchingRows() {
            const rows = this.hasFilters ? filterAchievementRecommendationItems(this.indexedItems, this.filters) : this.sourceRows;
            return this.tab === "recommended" && this.showSelectedOnly ? rows.filter((row) => this.selectedIds.has(row.id)) : rows;
        },
        activeRows() { return this.matchingRows.filter((row) => row.recommendationGroup === this.activeGroup); },
        relatedGroups() {
            const place = this.tab === "recommended" ? achievementRecommendationPlace(this.activeGroup) : null;
            return place ? this.groupIndex.filter((group) => group.group !== this.activeGroup && achievementRecommendationPlace(group.group) === place) : [];
        },
        requestedGroups() {
            return [this.activeGroup, ...this.relatedGroups.filter((group) => this.expandedGroups.includes(group.group)).map((group) => group.group)].filter(Boolean);
        },
        detailRows() {
            return this.matchingRows.filter((row) => this.requestedGroups.includes(row.recommendationGroup));
        },
        detailsLoading() { return Boolean(this.detailStates[this.activeGroup]?.loading); },
        detailsError() { return Boolean(this.detailStates[this.activeGroup]?.error); },
        loadedCount() { return this.detailStates[this.activeGroup]?.count || 0; },
        rows() {
            return this.groupRows(this.activeGroup);
        },
        filterOptions() {
            return achievementRecommendationFilterOptions(this.indexedItems, this.maps);
        },
        visibleRows() { return this.rows; },
        selectedItems() {
            return this.selectionResult.items;
        },
        selectedIds() { return new Set(this.selectedItems.map((item) => item.id)); },
        selectedPoints() { return this.selectedItems.reduce((sum, item) => sum + item.points, 0); },
        targetSummary() {
            const currentPoints = this.recommendation?.role.current_points;
            const targetPoints = Number(this.targetPoints);
            if (this.pointsMissing || !Number.isFinite(currentPoints) || !Number.isFinite(targetPoints) || targetPoints <= 0) return null;
            const projectedPoints = currentPoints + this.selectedPoints;
            return { projectedPoints, targetPoints,
                remainingPoints: Math.max(0, targetPoints - projectedPoints),
                surplusPoints: Math.max(0, projectedPoints - targetPoints) };
        },
        emptyMessage() {
            if (this.recommendation?.role.status === "no_sortable_dimensions") return "achievementRecommendation.noDimensions";
            if (this.tab === "recommended" && this.showSelectedOnly) {
                if (this.pointsMissing) return "achievementRecommendation.selectionUnavailable";
                if (!this.selectedItems.length) return "achievementRecommendation.noSelected";
            }
            return this.hasFilters ? "achievementRecommendation.noFilterResults" : "achievementRecommendation.empty";
        },
        selection() {
            return { recommendation: this.recommendation, items: this.selectedItems, ready: !this.pointsMissing && this.tab === "recommended" };
        },
        groupIndex() {
            const counts = new Map();
            this.matchingRows.forEach((row) => counts.set(row.recommendationGroup, (counts.get(row.recommendationGroup) || 0) + 1));
            const groups = this.tab === "upcoming"
                ? (this.recommendation?.upcoming_events || []).map((event) => ({ group: `event:${event.tag_id}`, label: this.eventGroupLabel(event) }))
                : this.groups.map((group) => ({ group: group.group, label: this.groupLabel(group.group) }));
            return groups.filter((group) => counts.has(group.group)).map((group) => ({ ...group, count: counts.get(group.group) }));
        },
    },
    watch: {
        recommendation: { immediate: true, handler() {
            this.contextId += 1; this.detailStates = {}; this.recordCache = {};
            this.difficultyCache = {}; this.difficultyStates = {};
            this.tagCache = {}; this.tagStates = {};
            this.eventTagCache = {}; this.eventTagsLoading = false; this.eventTagsError = false;
            this.filterIndex = {}; this.filterIndexReady = false; this.filterIndexLoading = false; this.filterIndexError = false;
            this.resetDraft();
        } },
        detailRows: { immediate: true, handler() {
            this.requestedGroups.forEach((group) => {
                this.loadDetails(group);
                this.loadDifficulty(group);
                this.loadTags(group);
            });
        } },
        selection: { immediate: true, handler(value) { this.$emit("selection-change", value); } },
        filters: { deep: true, handler() { if (this.hasFilters) this.loadFilterIndex(); this.expandedGroups = []; this.resetScroll(); } },
        showSelectedOnly() { this.expandedGroups = []; this.resetScroll(); },
        groupIndex() { this.ensureActiveGroup(); },
        tab() { this.jumpTo(this.groupIndex[0]?.group || ""); if (this.tab === "upcoming") this.loadEventTags(); },
    },
    beforeUnmount() { this.contextId += 1; },
    methods: {
        formatNumber(value) { return value.toLocaleString(this.$i18n.locale); },
        groupLabel(group) { return achievementRecommendationGroupLabel(group, this.maps, this.$t); },
        dateLabel(value) { return formatAchievementRecommendationDate(value, this.$i18n.locale); },
        exclusionLabel(reason) {
            return exclusionReasons.has(reason) ? this.$t(`achievementRecommendation.reasons.${reason}`)
                : this.$t("achievementRecommendation.unknownExclusion", { reason });
        },
        eventGroupLabel(event) {
            const name = this.eventTagCache[event.tag_id]?.label || this.$t("achievementRecommendation.eventFallback", { id: event.tag_id });
            const date = this.dateLabel(event.next_start_at);
            return `${name} · ${date ? this.$t("achievementRecommendation.opensAt", { date }) : this.$t("achievementRecommendation.eventTimeUnknown")}`;
        },
        resetDraft() {
            this.groups = (this.recommendation?.recommendations || []).map((group) => ({ ...group, ids: [...group.ids] }));
            this.filters = emptyFilters();
            this.tab = "recommended";
            this.showSelectedOnly = true;
            this.expandedGroups = [];
            this.activeGroup = this.groups[0]?.group || "";
            this.resetScroll();
        },
        restoreDraft() { if (!this.disabled) this.resetDraft(); },
        resetScroll() { this.$nextTick(() => { if (this.$refs.results) this.$refs.results.scrollTop = 0; }); },
        jumpTo(group) { this.activeGroup = group; this.expandedGroups = []; this.resetScroll(); },
        ensureActiveGroup() {
            if (!this.groupIndex.some((group) => group.group === this.activeGroup)) this.jumpTo(this.groupIndex[0]?.group || "");
        },
        async loadFilterIndex() {
            if (!this.recommendation || this.filterIndexReady || this.filterIndexLoading) return;
            const contextId = this.contextId;
            const ids = [...new Set([...flattenAchievementRecommendation(this.recommendation), ...this.upcomingRows].map((row) => row.id))];
            this.filterIndexLoading = true;
            this.filterIndexError = false;
            try {
                const records = [];
                // Global filtering needs only a small search index, never every group's full details or scores.
                for (let start = 0; start < ids.length; start += 1000) {
                    const batch = ids.slice(start, start + 1000);
                    const result = await fetchAchievementWorkbenchRecordsBatched({ ids: batch, client: "std", includeHidden: true,
                        attributes: "ID,Name,Sub,Detail,SceneID,dwMapID" }, 1000);
                    if (contextId !== this.contextId) return;
                    hydrateAchievementRecommendation(batch.map((id) => ({ id })), result);
                    records.push(...result);
                }
                this.filterIndex = Object.fromEntries(enrichAchievementRecommendationRecords(records, this.menus, this.maps).map((record) => [record.id, record]));
                this.filterIndexReady = true;
            } catch (error) {
                if (contextId === this.contextId) { this.filterIndexError = true; console.error("Failed to load recommendation filter index:", error); }
            } finally {
                if (contextId === this.contextId) this.filterIndexLoading = false;
            }
        },
        groupRows(group) {
            const rows = this.matchingRows.filter((row) => row.recommendationGroup === group);
            if (rows.some((row) => !this.recordCache[row.id])) return [];
            return applyAchievementWorkbenchEnrichment(
                hydrateAchievementRecommendation(rows, rows.map((row) => this.recordCache[row.id])),
                { difficultyById: this.difficultyCache, tagsById: this.tagCache }
            );
        },
        moveItem({ id, group, beforeId }) {
            if (this.disabled || this.tab !== "recommended") return;
            this.groups = moveAchievementRecommendationItem(this.groups, id, group, beforeId);
            if (!this.groups.some((entry) => entry.group === this.activeGroup)) this.jumpTo(group);
        },
        reorderGroups(entries) {
            if (this.disabled || this.tab !== "recommended") return;
            const byGroup = new Map(this.groups.map((group) => [group.group, group]));
            const reordered = entries.map((entry) => byGroup.get(entry.group));
            const visible = new Set(entries.map((entry) => entry.group));
            let index = 0;
            this.groups = this.groups.map((group) => visible.has(group.group) ? reordered[index++] : group);
        },
        removeItem(item) {
            if (this.disabled) return;
            const index = this.groups.findIndex((group) => group.group === this.activeGroup);
            this.groups = removeAchievementRecommendationItem(this.groups, item.id);
            if (!this.groups.some((group) => group.group === this.activeGroup)) {
                this.jumpTo(this.groups[Math.min(index, this.groups.length - 1)]?.group || "");
            }
        },
        async loadDetails(group = this.activeGroup) {
            if (this.detailStates[group]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const rows = this.matchingRows.filter((row) => row.recommendationGroup === group);
            const ids = [...new Set(rows.map((row) => row.id))].filter((id) => !this.recordCache[id]);
            this.detailStates[group] = { requestId, loading: Boolean(ids.length), error: false, count: rows.length - ids.length };
            const isCurrent = () => contextId === this.contextId && this.detailStates[group]?.requestId === requestId;
            if (!ids.length) return;
            try {
                // Expanded related groups load independently; leaving a group stops its queued batches.
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const details = await fetchAchievementWorkbenchRecordsBatched({ ids: batch, metadata: this.metadata,
                        completedIds: [], client: "std", includeHidden: true });
                    if (!isCurrent() || !this.requestedGroups.includes(group)) return;
                    hydrateAchievementRecommendation(batch.map((id) => ({ id })), details);
                    enrichAchievementRecommendationRecords(details, this.menus, this.maps).forEach((record) => {
                        this.recordCache[record.id] = record;
                    });
                    this.detailStates[group].count += batch.length;
                }
            } catch (error) {
                if (isCurrent() && this.requestedGroups.includes(group)) {
                    this.detailStates[group].error = true;
                    console.error("Failed to load recommendation details:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.detailStates[group].loading = false;
                    // A filter can change the needed IDs while the same group's request is in flight.
                    if (!this.detailStates[group].error && this.requestedGroups.includes(group) &&
                        this.matchingRows.some((row) => row.recommendationGroup === group && !this.recordCache[row.id])) this.loadDetails(group);
                }
            }
        },
        async loadDifficulty(group = this.activeGroup) {
            if (this.difficultyStates[group]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const needsDifficulty = (row) => row.recommendationGroup === group &&
                !Object.prototype.hasOwnProperty.call(this.difficultyCache, row.id);
            const ids = [...new Set(this.matchingRows.filter(needsDifficulty).map((row) => row.id))];
            this.difficultyStates[group] = { requestId, loading: Boolean(ids.length), error: false };
            const isCurrent = () => contextId === this.contextId && this.difficultyStates[group]?.requestId === requestId;
            if (!ids.length) return;
            try {
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const difficultyById = await fetchAchievementWorkbenchDifficultyMetrics(batch, { client: "std" });
                    if (!isCurrent() || !this.requestedGroups.includes(group)) return;
                    // A successful response may contain unconfigured scores (null); cache those too.
                    batch.forEach((id) => { this.difficultyCache[id] = difficultyById[id] ?? null; });
                }
            } catch (error) {
                if (isCurrent() && this.requestedGroups.includes(group)) {
                    this.difficultyStates[group].error = true;
                    console.error("Failed to load recommendation difficulty:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.difficultyStates[group].loading = false;
                    if (!this.difficultyStates[group].error && this.requestedGroups.includes(group) &&
                        this.matchingRows.some(needsDifficulty)) this.loadDifficulty(group);
                }
            }
        },
        async loadTags(group = this.activeGroup) {
            if (this.tagStates[group]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const needsTags = (row) => row.recommendationGroup === group &&
                !Object.prototype.hasOwnProperty.call(this.tagCache, row.id);
            const ids = [...new Set(this.matchingRows.filter(needsTags).map((row) => row.id))];
            this.tagStates[group] = { requestId, loading: Boolean(ids.length), error: false };
            const isCurrent = () => contextId === this.contextId && this.tagStates[group]?.requestId === requestId;
            if (!ids.length) return;
            try {
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const tagsById = await fetchAchievementWorkbenchTags(batch, { client: "std" });
                    if (!isCurrent() || !this.requestedGroups.includes(group)) return;
                    batch.forEach((id) => { this.tagCache[id] = tagsById[id] || normalizeAchievementWorkbenchTags([]); });
                }
            } catch (error) {
                if (isCurrent() && this.requestedGroups.includes(group)) {
                    this.tagStates[group].error = true;
                    console.error("Failed to load recommendation tags:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.tagStates[group].loading = false;
                    if (!this.tagStates[group].error && this.requestedGroups.includes(group) &&
                        this.matchingRows.some(needsTags)) this.loadTags(group);
                }
            }
        },
        async loadEventTags() {
            if (this.tab !== "upcoming" || this.eventTagsLoading) return;
            const contextId = this.contextId;
            const ids = [...new Set((this.recommendation?.upcoming_events || []).map((event) => String(event.tag_id)))]
                .filter((id) => !Object.prototype.hasOwnProperty.call(this.eventTagCache, id));
            this.eventTagsLoading = Boolean(ids.length);
            this.eventTagsError = false;
            // Load names only when the activities tab is opened, with bounded concurrency.
            let cursor = 0;
            const worker = async () => {
                while (contextId === this.contextId && this.tab === "upcoming" && cursor < ids.length) {
                    const id = ids[cursor++];
                    try {
                        const tag = await fetchAchievementWorkbenchTag(id, { client: "std" });
                        if (contextId === this.contextId) this.eventTagCache[id] = tag;
                    } catch (error) {
                        if (contextId === this.contextId) {
                            this.eventTagsError = true;
                            console.error("Failed to load upcoming event name:", error);
                        }
                    }
                }
            };
            await Promise.all(Array.from({ length: Math.min(ids.length, 3) }, worker));
            if (contextId === this.contextId) this.eventTagsLoading = false;
        },
    },
};
</script>

<template>
    <div class="m-server-recommendation" :aria-label="$t('achievementRecommendation.preview')" :aria-busy="loading || detailsLoading">
        <header class="m-server-recommendation__header">
            <h2>{{ $t('achievementRecommendation.preview') }}</h2>
            <div class="m-server-recommendation__header-actions">
            <el-tooltip v-if="hasRequested" :content="$t('achievementRecommendation.refreshHint')">
                <el-button :disabled="!canRequest" :loading="loading" @click="$emit('refresh')">
                    <el-icon v-if="!loading"><Refresh /></el-icon>
                    <span>{{ $t('achievementRecommendation.refresh') }}</span>
                </el-button>
            </el-tooltip>
            <el-tooltip v-if="recommendation" :content="$t('achievementRecommendation.restoreDraftHint')">
                <el-button :disabled="disabled || !recommendation || detailsLoading" :aria-label="$t('achievementRecommendation.restoreDraft')" @click="restoreDraft">
                    <el-icon><Back /></el-icon>
                    <span>{{ $t('achievementRecommendation.restoreDraft') }}</span>
                </el-button>
            </el-tooltip>
            </div>
        </header>
        <div v-if="!hasRequested" class="m-server-recommendation__start">
            <el-button type="primary" size="large" :disabled="!canRequest" @click="$emit('refresh')">
                {{ $t('achievementRecommendation.start') }}
            </el-button>
        </div>
        <p v-if="client !== 'std'" role="status">{{ $t('achievementRecommendation.stdOnly') }}</p>
        <p v-else-if="!roleAvailable" role="status">{{ $t('achievementRecommendation.roleRequired') }}</p>
        <p v-else-if="loading" role="status">{{ $t('achievementRecommendation.loading') }}</p>
        <el-alert v-else-if="error" :title="error" type="error" :closable="false" />
        <template v-else-if="recommendation">
            <div class="m-server-recommendation__summary">
                <span>{{ $t('achievementRecommendation.points', { count: recommendation.role.current_points }) }}</span>
                <span>{{ $t(`achievementRecommendation.stages.${recommendation.role.stage}`) }}</span>
                <el-tooltip v-if="recommendation.role.snapshot_stale" :content="$t('achievementRecommendation.stale')">
                    <span class="u-recommendation-warning">{{ $t('achievementRecommendation.staleLabel') }}</span>
                </el-tooltip>
            </div>
            <div class="m-recommendation-snapshot">
                <span>{{ $t('achievementRecommendation.snapshot') }}：{{ snapshotDateLabel ? `${snapshotDateLabel} (UTC+8)` : $t('achievementRecommendation.snapshotUnknown') }}</span>
                <a href="https://www.jx3box.com/dashboard/role/sync" target="_blank" rel="noopener noreferrer"
                    :title="$t('achievementRecommendation.syncGuideHint')">{{ $t('achievementRecommendation.syncGuide') }}</a>
                <span class="m-recommendation-snapshot__hint">{{ $t('achievementRecommendation.syncGuideHint') }}</span>
            </div>
            <details v-if="exclusions.length" class="m-recommendation-exclusions">
                <summary>{{ $t('achievementRecommendation.exclusions') }}</summary>
                <div class="m-recommendation-exclusions__content">
                    <p>{{ $t('achievementRecommendation.exclusionsHint') }}</p>
                    <dl><div v-for="entry in exclusions" :key="entry.reason">
                        <dt>{{ exclusionLabel(entry.reason) }}</dt><dd>{{ formatNumber(entry.count) }}</dd>
                    </div></dl>
                </div>
            </details>
            <el-tabs v-model="tab" class="m-server-recommendation__tabs">
                <el-tab-pane name="recommended" :label="$t('achievementRecommendation.available', { count: draftRows.length })" />
                <el-tab-pane name="upcoming" :label="$t('achievementRecommendation.upcoming', { count: upcomingRows.length })" />
            </el-tabs>
            <template v-if="tab === 'upcoming'">
                <p v-if="eventTagsLoading" role="status">{{ $t('achievementRecommendation.loadingEventNames') }}</p>
                <div v-else-if="eventTagsError" class="m-recommendation-difficulty-error" role="alert">
                    <span>{{ $t('achievementRecommendation.eventNamesFailed') }}</span>
                    <el-button text :disabled="disabled" @click="loadEventTags">{{ $t('achievementRecommendation.retry') }}</el-button>
                </div>
            </template>
            <div v-if="tab === 'recommended'" class="m-recommendation-selection" aria-live="polite">
                <template v-if="!pointsMissing">
                    <strong>{{ $t('achievementRecommendation.selectedSummary', { count: formatNumber(selectedItems.length), points: formatNumber(selectedPoints) }) }}</strong>
                    <span class="m-recommendation-selection__hint">{{ $t('achievementRecommendation.saveSelectedHint') }}</span>
                    <div v-if="targetSummary" class="m-recommendation-selection__target">
                        <span>{{ $t('achievementRecommendation.projectedSummary', { projected: formatNumber(targetSummary.projectedPoints), target: formatNumber(targetSummary.targetPoints) }) }}</span>
                        <strong v-if="targetSummary.remainingPoints" class="u-recommendation-warning">{{ $t('achievementRecommendation.targetShortfall', { points: formatNumber(targetSummary.remainingPoints) }) }}</strong>
                        <strong v-else-if="targetSummary.surplusPoints">{{ $t('achievementRecommendation.targetSurplus', { points: formatNumber(targetSummary.surplusPoints) }) }}</strong>
                        <strong v-else>{{ $t('achievementRecommendation.targetReached') }}</strong>
                    </div>
                </template>
                <span v-else>{{ $t('achievementRecommendation.selectionUnavailable') }}</span>
            </div>
            <div class="m-server-recommendation__filters">
                <el-cascader v-model="filters.categories" :options="filterOptions.categories" :props="{ multiple: true, checkStrictly: true }"
                    clearable filterable collapse-tags @visible-change="($event) => $event && loadFilterIndex()" :placeholder="$t('achievementRecommendation.filterCategories')" />
                <el-select v-model="filters.mapIds" multiple clearable filterable collapse-tags :loading="filterIndexLoading"
                    @visible-change="($event) => $event && loadFilterIndex()" :placeholder="$t('achievementRecommendation.filterMaps')">
                    <el-option v-for="map in filterOptions.maps" :key="map.id" :value="map.id" :label="map.name" />
                </el-select>
                <el-input v-model="filters.keyword" clearable @focus="loadFilterIndex" :placeholder="$t('achievementRecommendation.filterName')">
                    <template #prefix><Search /></template>
                </el-input>
            </div>
            <p v-if="filterIndexLoading" role="status">{{ $t('achievementRecommendation.loadingFilterIndex') }}</p>
            <div v-else-if="filterIndexError" role="alert">
                {{ $t('achievementRecommendation.filterIndexFailed') }}
                <el-button text @click="loadFilterIndex">{{ $t('achievementRecommendation.retry') }}</el-button>
            </div>
            <div class="m-server-recommendation__counts">
                <el-radio-group v-if="tab === 'recommended'" v-model="showSelectedOnly" size="small" :disabled="disabled"
                    class="m-recommendation-view-scope" :aria-label="$t('achievementRecommendation.viewScope')">
                    <el-radio-button :label="true">{{ $t('achievementRecommendation.selectedOnly') }}</el-radio-button>
                    <el-radio-button :label="false">{{ $t('achievementRecommendation.allCandidates', { count: formatNumber(draftRows.length) }) }}</el-radio-button>
                </el-radio-group>
                <span>{{ $t('achievementRecommendation.groupVisibleCount', { count: visibleRows.length }) }}</span>
            </div>
            <p v-if="tab === 'recommended'" class="m-recommendation-candidate-hint">{{ $t('achievementRecommendation.candidateHint') }}</p>
            <el-alert v-if="pointsMissing" :title="$t('achievementRecommendation.pointsMissing', { id: selectionResult.missingPointId })" type="error" :closable="false" />
            <AchievementRecommendationGroupIndex v-if="groupIndex.length" :groups="groupIndex" :active="activeGroup" :disabled="disabled"
                :editable="tab === 'recommended'" @jump="jumpTo" @reorder="reorderGroups" />
            <div ref="results" class="m-server-recommendation__results">
                <p v-if="hasFilters && !filterIndexReady" role="status">{{ $t(filterIndexError ? 'achievementRecommendation.filterIndexFailed' : 'achievementRecommendation.loadingFilterIndex') }}</p>
                <p v-else-if="detailsLoading" role="status">{{ $t('achievementRecommendation.loadingDetails', { count: loadedCount, total: activeRows.length }) }}</p>
                <div v-else-if="detailsError" role="alert">
                    <p>{{ $t('achievementRecommendation.detailsFailed') }}</p>
                    <el-button @click="loadDetails()">{{ $t('achievementRecommendation.retry') }}</el-button>
                </div>
                <p v-else-if="!rows.length" role="status">{{ $t(emptyMessage) }}</p>
                <template v-else>
                    <h3 class="m-recommendation-active-group">{{ tab === 'upcoming' ? groupIndex.find((group) => group.group === activeGroup)?.label : groupLabel(activeGroup) }}</h3>
                    <p v-if="difficultyStates[activeGroup]?.loading" role="status">{{ $t('achievementRecommendation.loadingDifficulty') }}</p>
                    <div v-else-if="difficultyStates[activeGroup]?.error" class="m-recommendation-difficulty-error" role="alert">
                        <span>{{ $t('achievementRecommendation.difficultyFailed') }}</span>
                        <el-button text :disabled="disabled" @click="loadDifficulty()">{{ $t('achievementRecommendation.retryDifficulty') }}</el-button>
                    </div>
                    <p v-if="tagStates[activeGroup]?.loading" role="status">{{ $t('achievementRecommendation.loadingTags') }}</p>
                    <div v-else-if="tagStates[activeGroup]?.error" class="m-recommendation-difficulty-error" role="alert">
                        <span>{{ $t('achievementRecommendation.tagsFailed') }}</span>
                        <el-button text :disabled="disabled" @click="loadTags()">{{ $t('achievementRecommendation.retryTags') }}</el-button>
                    </div>
                    <AchievementRecommendationItems :items="visibleRows" :group="activeGroup" :selected-ids="selectedIds"
                        :dimensions="dimensions"
                        :disabled="disabled" :editable="tab === 'recommended'" @move="moveItem" @remove="removeItem" />
                </template>
                <section v-if="relatedGroups.length" class="m-recommendation-related">
                    <h3>{{ $t('achievementRecommendation.samePlaceGroups') }}</h3>
                    <el-collapse v-model="expandedGroups">
                        <el-collapse-item v-for="group in relatedGroups" :key="group.group" :name="group.group">
                            <template #title><span>{{ groupLabel(group.group) }} · {{ group.count }}</span></template>
                            <template v-if="expandedGroups.includes(group.group)">
                                <p v-if="detailStates[group.group]?.loading" role="status">{{ $t('achievementRecommendation.loadingDetails', { count: detailStates[group.group].count, total: group.count }) }}</p>
                                <div v-else-if="detailStates[group.group]?.error" role="alert">
                                    <p>{{ $t('achievementRecommendation.detailsFailed') }}</p>
                                    <el-button @click="loadDetails(group.group)">{{ $t('achievementRecommendation.retry') }}</el-button>
                                </div>
                                <template v-else>
                                    <p v-if="difficultyStates[group.group]?.loading" role="status">{{ $t('achievementRecommendation.loadingDifficulty') }}</p>
                                    <div v-else-if="difficultyStates[group.group]?.error" class="m-recommendation-difficulty-error" role="alert">
                                        <span>{{ $t('achievementRecommendation.difficultyFailed') }}</span>
                                        <el-button text :disabled="disabled" @click="loadDifficulty(group.group)">{{ $t('achievementRecommendation.retryDifficulty') }}</el-button>
                                    </div>
                                    <p v-if="tagStates[group.group]?.loading" role="status">{{ $t('achievementRecommendation.loadingTags') }}</p>
                                    <div v-else-if="tagStates[group.group]?.error" class="m-recommendation-difficulty-error" role="alert">
                                        <span>{{ $t('achievementRecommendation.tagsFailed') }}</span>
                                        <el-button text :disabled="disabled" @click="loadTags(group.group)">{{ $t('achievementRecommendation.retryTags') }}</el-button>
                                    </div>
                                    <AchievementRecommendationItems :items="groupRows(group.group)" :group="group.group"
                                        :dimensions="dimensions"
                                        :selected-ids="selectedIds" :disabled="disabled" :promote-to="activeGroup" @move="moveItem" @remove="removeItem" />
                                </template>
                            </template>
                        </el-collapse-item>
                    </el-collapse>
                </section>
            </div>
        </template>
    </div>
</template>

<style lang="less" scoped>
.m-server-recommendation { height: 100%; min-height: 0; min-width: 0; display: flex; flex-direction: column; color: #314043;
    p { font-size: 13px; color: #7a8586; }
}
.m-server-recommendation__header { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: space-between; flex: none;
    h2 { margin: 0; font-size: 18px; line-height: 1.4; } }
.m-server-recommendation__header-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 4px; }
.m-recommendation-candidate-hint { flex: none; margin: 0 0 10px; font-size: 12px; line-height: 1.5; }
.m-server-recommendation__start { flex: 1; display: flex; align-items: center; justify-content: center; }
.m-server-recommendation__summary { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 12px; color: #697374; padding: 8px 0; flex: none; }
.u-recommendation-warning { color: #ae3b40 !important; }
.m-recommendation-snapshot { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; padding-bottom: 8px;
    flex: none; font-size: 12px; line-height: 1.5; color: #697374;
    a { color: #47777d; text-decoration: underline; text-underline-offset: 2px; }
}
.m-recommendation-snapshot__hint { width: 100%; color: #7a8586; }
.m-recommendation-exclusions { flex: none; font-size: 12px; margin-bottom: 8px; border: 1px solid #e2e8e6; border-radius: 6px;
    summary { padding: 7px 10px; cursor: pointer; color: #47777d; }
    dl { display: flex; flex-wrap: wrap; gap: 6px 20px; margin: 0;
        div { display: flex; gap: 8px; min-width: 0; } dt { overflow-wrap: anywhere; } dd { margin: 0; font-variant-numeric: tabular-nums; font-weight: 600; }
    }
    p { margin: 0 0 8px; line-height: 1.5; }
}
.m-recommendation-exclusions__content { padding: 0 10px 10px; max-height: 120px; overflow-y: auto; }
.m-server-recommendation__tabs { flex: none; :deep(.el-tabs__header) { margin-bottom: 10px; } :deep(.el-tabs__content) { display: none; } }
.m-recommendation-selection { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 12px; flex: none; margin-bottom: 10px; padding: 10px 12px;
    background: #f3f8f6; border: 1px solid #e2e8e6; border-radius: 6px; font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums;
    strong { color: #47777d; font-weight: 600; }
}
.m-recommendation-selection__hint { color: #697374; }
.m-recommendation-selection__target { display: flex; flex-wrap: wrap; gap: 4px 12px; width: 100%; }
.m-recommendation-view-scope { max-width: 100%; :deep(.el-radio-button__inner) { white-space: normal; line-height: 1.5; } }
.m-server-recommendation__filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; flex: none;
    .el-cascader, .el-select, .el-input { width: 100%; min-width: 0; } svg { width: 16px; height: 16px; }
}
.m-server-recommendation__counts { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 0; font-size: 12px; color: #697374; flex: none;
    strong { font-weight: 500; color: #47777d; }
}
.m-server-recommendation__results { flex: 1; min-height: 0; border-top: 1px solid #e2e8e6; overflow-y: auto; overscroll-behavior: contain; }
.m-recommendation-active-group { margin: 0; padding: 10px; font-size: 12px; font-weight: 500; color: #697374; }
.m-recommendation-difficulty-error { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 4px 10px; font-size: 13px; color: #ae3b40; }
.m-recommendation-related { margin-top: 20px;
    h3 { font-size: 14px; margin: 0; padding: 12px 10px; background: #f3f6f4; color: #365f64; }
    :deep(.el-collapse-item__header) { padding-inline: 10px; color: #365f64; }
    :deep(.el-collapse-item__content) { padding-bottom: 0; }
}
@media (max-width: 760px) {
    .m-server-recommendation__filters { grid-template-columns: repeat(2, minmax(0, 1fr)); .el-input { grid-column: 1 / -1; } }
}
</style>
