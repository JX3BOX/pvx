<script>
import { Search, Refresh, Back, Plus } from "@element-plus/icons-vue";
import { fetchAchievementWorkbenchRecordsBatched, fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchTags, fetchAchievementWorkbenchTag } from "@/service/achievementWorkbench";
import { applyAchievementWorkbenchEnrichment, normalizeAchievementWorkbenchTags } from "@/utils/achievementWorkbench";
import AchievementRecommendationItems from "./AchievementRecommendationItems.vue";
import AchievementRecommendationCandidatesDialog from "./AchievementRecommendationCandidatesDialog.vue";
import AchievementRecommendationActionDialog from "./AchievementRecommendationActionDialog.vue";
import AchievementLeapAddDialog from "./AchievementLeapAddDialog.vue";
import {
    flattenAchievementRecommendation, hydrateAchievementRecommendation, arrangeAchievementRecommendationGroups,
    resolveAchievementRecommendationSelection,
    filterAchievementRecommendationItems, enrichAchievementRecommendationRecords, achievementRecommendationFilterOptions,
    moveAchievementRecommendationItem, achievementRecommendationPlace,
    formatAchievementRecommendationDate, achievementRecommendationExclusions,
} from "@/utils/achievementRecommendation";

const emptyFilters = () => ({ keyword: "", mapIds: [], categories: [] });
const exclusionReasons = new Set(["completed", "dependency_or_series", "mount_or_body_type", "recommendation_excluded",
    "missing_dimensions", "direction_weight_zero", "category_filtered", "dimension_range"]);

export default {
    name: "AchievementLeapRecommendation",
    components: { Search, Refresh, Back, Plus, AchievementLeapAddDialog, AchievementRecommendationItems, AchievementRecommendationCandidatesDialog, AchievementRecommendationActionDialog },
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
        completedIds: { type: Array, default: () => [] },
        schoolEligibility: { type: Object, default: null },
        menus: { type: Object, default: () => ({}) },
        maps: { type: Array, default: () => [] },
        targetPoints: { type: Number, required: true },
    },
    emits: ["selection-change", "refresh"],
    data() {
        return { tab: "recommended", candidatesVisible: false, addVisible: false, selectedDraftIds: null, autoFillExcludedIds: [], pendingAction: null, groups: [], recordCache: {}, filters: emptyFilters(),
            detailStates: {}, difficultyCache: {}, difficultyStates: {}, contextId: 0, requestId: 0,
            tagCache: {}, tagStates: {}, eventTagCache: {}, eventTagsLoading: false, eventTagsError: false,
            filterIndex: {}, filterIndexReady: false, filterIndexLoading: false, filterIndexError: false };
    },
    computed: {
        hasPreview() { return Boolean(this.recommendation) && this.client === "std" && this.roleAvailable && !this.loading && !this.error; },
        snapshotDateLabel() { return this.dateLabel(this.recommendation?.role.snapshot_updated_at); },
        exclusions() { return achievementRecommendationExclusions(this.recommendation?.excluded_summary); },
        draftRows() {
            return this.recommendation ? flattenAchievementRecommendation({ ...this.recommendation, recommendations: this.groups }) : [];
        },
        upcomingRows() {
            return (this.recommendation?.upcoming_events || []).flatMap((event) => event.ids.map((id) => ({
                id: String(id), recommendationGroup: `event:${event.tag_id}`, nextStartAt: event.next_start_at,
                eventLabel: this.eventGroupLabel(event),
            })));
        },
        draftItems() {
            // Catalog points keep plan selection independent of detail loading and filters.
            return this.draftRows.map((row) => ({ ...row, points: this.metadata[row.id]?.point }));
        },
        selectionResult() {
            const currentPoints = this.recommendation?.role.current_points || 0;
            if (this.selectedDraftIds !== null) {
                // Keep explicit membership, including extras and replacements chosen after a removal.
                const ids = new Set(this.selectedDraftIds);
                return resolveAchievementRecommendationSelection(this.draftItems.filter((item) => ids.has(item.id)), currentPoints, currentPoints, this.selectedDraftIds);
            }
            return resolveAchievementRecommendationSelection(this.draftItems, currentPoints, this.targetPoints);
        },
        pointsMissing() { return this.selectionResult.missingPointId !== null; },
        sourceRows() { return this.tab === "upcoming" ? this.upcomingRows : this.draftRows; },
        hasFilters() { return Boolean(this.filters.keyword.trim() || this.filters.mapIds.length || this.filters.categories.length); },
        indexedItems() { return this.sourceRows.filter((row) => this.filterIndex[row.id]).map((row) => ({ ...this.filterIndex[row.id], ...row })); },
        matchingRows() {
            const rows = this.filterRows(this.sourceRows, this.indexedItems);
            return this.tab === "recommended" ? rows.filter((row) => this.selectedIds.has(row.id)) : rows;
        },
        detailRows() { return this.matchingRows; },
        candidateRows() { return this.pointsMissing ? [] : this.draftRows.filter((row) => !this.selectedIds.has(row.id)); },
        indexedCandidates() { return this.candidateRows.filter((row) => this.filterIndex[row.id]).map((row) => ({ ...this.filterIndex[row.id], ...row })); },
        matchingCandidates() {
            return this.filterRows(this.candidateRows, this.indexedCandidates);
        },
        candidateDetailRows() { return this.candidatesVisible ? this.matchingCandidates : []; },
        visibleCandidates() { return this.hydrateRows(this.matchingCandidates); },
        originalGroupById() {
            return Object.fromEntries([...this.draftRows.map((row) => [row.id, row.recommendationGroup]),
                ...(this.recommendation?.recommendations || []).flatMap(({ group, ids }) => ids.map((id) => [String(id), group]))]);
        },
        relatedActionRows() {
            if (!this.pendingAction) return [];
            if (this.pendingAction.source === "manual") return [this.pendingAction.item];
            const group = this.originalGroupById[this.pendingAction.id];
            const key = achievementRecommendationPlace(group) || group;
            const rows = this.pendingAction.source === "selected" ? this.draftRows.filter((row) => this.selectedIds.has(row.id)) : this.candidateRows;
            return rows.filter((row) => {
                const originalGroup = this.originalGroupById[row.id];
                return (achievementRecommendationPlace(originalGroup) || originalGroup) === key;
            });
        },
        actionRows() {
            return this.pendingAction?.scope === "related" ? this.relatedActionRows
                : this.relatedActionRows.filter((row) => row.id === this.pendingAction?.id);
        },
        actionItems() {
            return this.actionRows.map((row) => ({ ...row, selected: this.selectedIds.has(row.id),
                name: row.name || this.recordCache[row.id]?.name || this.filterIndex[row.id]?.name || `#${row.id}` }));
        },
        actionMissingPointId() {
            return this.pendingAction?.type === "add" ? this.actionRows.find((row) => {
                const point = this.metadata[row.id]?.point;
                return !Number.isFinite(point) || point < 0;
            })?.id || null : null;
        },
        detailsLoading() { return Boolean(this.detailStates[this.tab]?.loading); },
        detailsError() { return Boolean(this.detailStates[this.tab]?.error); },
        loadedCount() { return this.rows.length; },
        rows() { return this.hydrateRows(this.matchingRows); },
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
            if (this.tab === "recommended") {
                if (this.pointsMissing) return "achievementRecommendation.selectionUnavailable";
                if (!this.selectedItems.length) return "achievementRecommendation.noSelected";
            }
            return this.hasFilters ? "achievementRecommendation.noFilterResults" : "achievementRecommendation.empty";
        },
        selection() {
            return { recommendation: this.recommendation, items: this.selectedItems, includedIds: [...(this.selectedDraftIds || [])], ready: !this.pointsMissing && this.tab === "recommended" };
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
            this.loadDetails();
            this.loadDifficulty();
            this.loadTags();
        } },
        selection: { immediate: true, handler(value) { this.$emit("selection-change", value); } },
        filters: { deep: true, handler() { if (this.hasFilters) this.loadFilterIndex(); this.resetScroll(); } },
        candidateDetailRows: { handler() {
            if (!this.candidatesVisible) return;
            this.loadDetails("candidates"); this.loadDifficulty("candidates"); this.loadTags("candidates");
        } },
        tab() { this.resetScroll(); if (this.tab === "upcoming") this.loadEventTags(); },
    },
    beforeUnmount() { this.contextId += 1; },
    methods: {
        formatNumber(value) { return value.toLocaleString(this.$i18n.locale); },
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
            this.groups = arrangeAchievementRecommendationGroups(this.recommendation?.recommendations || []);
            this.selectedDraftIds = null;
            this.autoFillExcludedIds = [];
            this.pendingAction = null;
            this.filters = emptyFilters();
            this.tab = "recommended";
            this.candidatesVisible = false;
            this.addVisible = false;
            this.resetScroll();
        },
        restoreDraft() { if (!this.disabled) this.resetDraft(); },
        resetScroll() {
            this.$nextTick(() => {
                const results = this.$refs.results;
                const toolbar = this.$refs.toolbar;
                if (!results || !toolbar || !this.$el?.getClientRects().length) return;
                const toolbarTop = Number.parseFloat(window.getComputedStyle(toolbar).top) || 0;
                const offset = results.getBoundingClientRect().top - toolbar.offsetHeight - toolbarTop;
                // Only move upward when filtering would leave the first result above the sticky controls.
                if (offset < 0) window.scrollBy({ top: offset, behavior: "instant" });
            });
        },
        hydrateRows(rows) {
            // Reveal a continuous prefix as batches arrive, without skipping unloaded rows.
            const firstMissing = rows.findIndex((row) => !this.recordCache[row.id]);
            const loaded = firstMissing < 0 ? rows : rows.slice(0, firstMissing);
            return applyAchievementWorkbenchEnrichment(
                hydrateAchievementRecommendation(loaded, loaded.map((row) => this.recordCache[row.id])),
                { difficultyById: this.difficultyCache, tagsById: this.tagCache }
            );
        },
        filterRows(rows, indexedItems) {
            if (!this.hasFilters) return rows;
            const ids = new Set(filterAchievementRecommendationItems(indexedItems, this.filters).map((item) => item.id));
            // The lightweight index decides membership only; its empty fields must not replace full details.
            return rows.filter((row) => ids.has(row.id));
        },
        rowsForScope(scope) { return scope === "candidates" ? this.matchingCandidates : this.matchingRows; },
        scopeActive(scope) { return scope === "candidates" ? this.candidatesVisible : scope === this.tab; },
        requestManualAdd(item) {
            const id = String(item.id);
            if (this.disabled || this.pointsMissing || !this.addVisible || this.tab !== "recommended" ||
                this.selectedIds.has(id) || this.completedIds.map(String).includes(id)) return;
            const point = this.metadata[id]?.point;
            if (!Number.isFinite(point) || point <= 0 || Number(this.metadata[id]?.general) !== 1) return;
            this.pendingAction = { type: "add", id, source: "manual", scope: "single", item: { ...item, id } };
        },
        requestAction(type, item, source) {
            if (this.disabled || this.tab !== "recommended" || !["add", "remove"].includes(type)) return;
            if (!["selected", "candidates"].includes(source) || (type === "add" && source !== "candidates")) return;
            const rows = source === "selected" ? this.selectedItems : this.candidateRows;
            if (!rows.some((row) => row.id === item.id) || (type === "add" && !this.candidatesVisible)) return;
            this.pendingAction = { type, id: item.id, source, scope: "single" };
            this.loadFilterIndex();
        },
        confirmAction() {
            if (this.disabled || !this.pendingAction || !this.actionRows.length || this.actionMissingPointId) return;
            const ids = new Set(this.actionRows.map((row) => row.id));
            const type = this.pendingAction.type;
            const selected = this.selectedItems.map((item) => item.id);
            let filled = 0;
            if (type === "add") {
                if (this.pendingAction.source === "manual") {
                    const item = this.pendingAction.item;
                    if (this.completedIds.map(String).includes(item.id) || this.selectedIds.has(item.id)) { this.pendingAction = null; return; }
                    // Only confirmation extends the draft; cancelled additions leave membership untouched.
                    this.recordCache[item.id] = item;
                    this.filterIndex[item.id] = item;
                    if (!this.draftRows.some((row) => row.id === item.id)) {
                        const group = this.originalGroupById[item.id] || `manual:${item.id}`;
                        const existing = this.groups.find((entry) => entry.group === group);
                        this.groups = existing ? this.groups.map((entry) => entry === existing ? { ...entry, ids: [...entry.ids, item.id] } : entry)
                            : [...this.groups, { group, ids: [item.id] }];
                    }
                }
                this.selectedDraftIds = [...new Set([...selected, ...ids])];
                this.autoFillExcludedIds = this.autoFillExcludedIds.filter((id) => !ids.has(id));
            } else if (this.pendingAction.source === "selected") filled = this.removeSelectedItems(ids);
            else {
                this.selectedDraftIds = selected;
                this.groups = this.groups.map((group) => ({ ...group, ids: group.ids.filter((id) => !ids.has(String(id))) }))
                    .filter((group) => group.ids.length);
            }
            const message = this.$t(type === "add" ? "achievementRecommendation.candidatesAdded"
                : this.pendingAction.source === "selected" ? (filled ? "achievementRecommendation.selectionRefilled" : "achievementRecommendation.selectionRemoved")
                    : "achievementRecommendation.candidatesRemoved", { count: ids.size, filled });
            this.pendingAction = null;
            this.$message.success(message);
        },
        removeSelectedItems(ids) {
            const removed = new Set([...ids].map(String));
            const selected = this.selectedItems;
            if (!selected.some((item) => removed.has(item.id))) return 0;
            const kept = selected.filter((item) => !removed.has(item.id));
            this.autoFillExcludedIds = [...new Set([...this.autoFillExcludedIds, ...removed])];
            const excluded = new Set([...this.autoFillExcludedIds, ...kept.map((item) => item.id)]);
            let projected = this.recommendation.role.current_points + kept.reduce((sum, item) => sum + item.points, 0);
            const replacements = [];
            // Fill only the deficit, preserving existing extras and ignoring display filters.
            for (const item of this.draftItems) {
                if (projected >= this.targetPoints) break;
                if (excluded.has(item.id)) continue;
                replacements.push(item.id);
                // Include the unknown required item so selection validation blocks saving instead of skipping it.
                if (!Number.isFinite(item.points) || item.points < 0) break;
                projected += item.points;
            }
            this.selectedDraftIds = [...kept.map((item) => item.id), ...replacements];
            return this.pointsMissing ? 0 : replacements.length;
        },
        async loadFilterIndex() {
            if (!this.recommendation || this.filterIndexReady || this.filterIndexLoading) return;
            const contextId = this.contextId;
            const ids = [...new Set([...this.draftRows, ...this.upcomingRows].map((row) => row.id))];
            this.filterIndexLoading = true;
            this.filterIndexError = false;
            try {
                const records = [];
                // Global filtering needs only a small search index, never every group's full details or scores.
                for (let start = 0; start < ids.length; start += 1000) {
                    const batch = ids.slice(start, start + 1000);
                    const result = await fetchAchievementWorkbenchRecordsBatched({ ids: batch, client: "std", includeHidden: true,
                        attributes: "ID,Name,ShortDesc,Sub,Detail,SceneID,dwMapID" }, 1000);
                    if (contextId !== this.contextId) return;
                    hydrateAchievementRecommendation(batch.map((id) => ({ id })), result);
                    records.push(...result);
                }
                this.filterIndex = { ...this.filterIndex, ...Object.fromEntries(enrichAchievementRecommendationRecords(records, this.menus, this.maps).map((record) => [record.id, record])) };
                this.filterIndexReady = true;
            } catch (error) {
                if (contextId === this.contextId) { this.filterIndexError = true; console.error("Failed to load recommendation filter index:", error); }
            } finally {
                if (contextId === this.contextId) this.filterIndexLoading = false;
            }
        },
        moveItem({ id, group, beforeId }) {
            if (this.disabled || this.tab !== "recommended") return;
            this.selectedDraftIds = this.selectedItems.map((item) => item.id);
            this.groups = moveAchievementRecommendationItem(this.groups, id, group, beforeId);
        },
        removeItem(item) {
            if (this.disabled || this.tab !== "recommended") return;
            this.removeSelectedItems([item.id]);
        },
        async loadDetails(tab = this.tab) {
            if (this.detailStates[tab]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const rows = this.rowsForScope(tab);
            const ids = [...new Set(rows.map((row) => row.id))].filter((id) => !this.recordCache[id]);
            this.detailStates[tab] = { requestId, loading: Boolean(ids.length), error: false, count: rows.length - ids.length };
            const isCurrent = () => contextId === this.contextId && this.detailStates[tab]?.requestId === requestId;
            if (!ids.length) return;
            try {
                // Load sequential batches across group boundaries; leaving the tab stops queued batches.
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const details = await fetchAchievementWorkbenchRecordsBatched({ ids: batch, metadata: this.metadata,
                        completedIds: [], client: "std", includeHidden: true });
                    if (!isCurrent() || !this.scopeActive(tab)) return;
                    hydrateAchievementRecommendation(batch.map((id) => ({ id })), details);
                    enrichAchievementRecommendationRecords(details, this.menus, this.maps).forEach((record) => {
                        this.recordCache[record.id] = record;
                    });
                    this.detailStates[tab].count += batch.length;
                }
            } catch (error) {
                if (isCurrent() && this.scopeActive(tab)) {
                    this.detailStates[tab].error = true;
                    console.error("Failed to load recommendation details:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.detailStates[tab].loading = false;
                    // Filters and selection can change the needed IDs while a batch is in flight.
                    if (!this.detailStates[tab].error && this.scopeActive(tab) &&
                        this.rowsForScope(tab).some((row) => !this.recordCache[row.id])) this.loadDetails(tab);
                }
            }
        },
        async loadDifficulty(tab = this.tab) {
            if (this.difficultyStates[tab]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const needsDifficulty = (row) => !Object.prototype.hasOwnProperty.call(this.difficultyCache, row.id);
            const ids = [...new Set(this.rowsForScope(tab).filter(needsDifficulty).map((row) => row.id))];
            this.difficultyStates[tab] = { requestId, loading: Boolean(ids.length), error: false };
            const isCurrent = () => contextId === this.contextId && this.difficultyStates[tab]?.requestId === requestId;
            if (!ids.length) return;
            try {
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const difficultyById = await fetchAchievementWorkbenchDifficultyMetrics(batch, { client: "std" });
                    if (!isCurrent() || !this.scopeActive(tab)) return;
                    // A successful response may contain unconfigured scores (null); cache those too.
                    batch.forEach((id) => { this.difficultyCache[id] = difficultyById[id] ?? null; });
                }
            } catch (error) {
                if (isCurrent() && this.scopeActive(tab)) {
                    this.difficultyStates[tab].error = true;
                    console.error("Failed to load recommendation difficulty:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.difficultyStates[tab].loading = false;
                    if (!this.difficultyStates[tab].error && this.scopeActive(tab) &&
                        this.rowsForScope(tab).some(needsDifficulty)) this.loadDifficulty(tab);
                }
            }
        },
        async loadTags(tab = this.tab) {
            if (this.tagStates[tab]?.loading) return;
            const requestId = ++this.requestId;
            const contextId = this.contextId;
            const needsTags = (row) => !Object.prototype.hasOwnProperty.call(this.tagCache, row.id);
            const ids = [...new Set(this.rowsForScope(tab).filter(needsTags).map((row) => row.id))];
            this.tagStates[tab] = { requestId, loading: Boolean(ids.length), error: false };
            const isCurrent = () => contextId === this.contextId && this.tagStates[tab]?.requestId === requestId;
            if (!ids.length) return;
            try {
                for (let start = 0; start < ids.length; start += 240) {
                    const batch = ids.slice(start, start + 240);
                    const tagsById = await fetchAchievementWorkbenchTags(batch, { client: "std" });
                    if (!isCurrent() || !this.scopeActive(tab)) return;
                    batch.forEach((id) => { this.tagCache[id] = tagsById[id] || normalizeAchievementWorkbenchTags([]); });
                }
            } catch (error) {
                if (isCurrent() && this.scopeActive(tab)) {
                    this.tagStates[tab].error = true;
                    console.error("Failed to load recommendation tags:", error);
                }
            } finally {
                if (isCurrent()) {
                    this.tagStates[tab].loading = false;
                    if (!this.tagStates[tab].error && this.scopeActive(tab) &&
                        this.rowsForScope(tab).some(needsTags)) this.loadTags(tab);
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
        <div ref="toolbar" class="m-recommendation-toolbar">
            <header class="m-server-recommendation__header">
                <h2>{{ $t('achievementRecommendation.preview') }}</h2>
                <div v-if="hasPreview && tab === 'recommended'" class="m-recommendation-selection__summary" aria-live="polite">
                    <template v-if="!pointsMissing">
                        <strong>{{ $t('achievementRecommendation.selectedSummary', { count: formatNumber(selectedItems.length), points: formatNumber(selectedPoints) }) }}</strong>
                        <div v-if="targetSummary" class="m-recommendation-selection__target">
                            <span>{{ $t('achievementRecommendation.projectedSummary', { projected: formatNumber(targetSummary.projectedPoints), target: formatNumber(targetSummary.targetPoints) }) }}</span>
                            <strong v-if="targetSummary.remainingPoints">{{ $t('achievementRecommendation.targetShortfall', { points: formatNumber(targetSummary.remainingPoints) }) }}</strong>
                            <strong v-else-if="targetSummary.surplusPoints">{{ $t('achievementRecommendation.targetSurplus', { points: formatNumber(targetSummary.surplusPoints) }) }}</strong>
                            <strong v-else>{{ $t('achievementRecommendation.targetReached') }}</strong>
                        </div>
                    </template>
                    <span v-else>{{ $t('achievementRecommendation.selectionUnavailable') }}</span>
                </div>
            </header>
            <div v-if="hasPreview && tab === 'recommended'" class="m-recommendation-selection__actions">
                <el-button class="m-recommendation-candidates-button" plain type="primary" :disabled="disabled || pointsMissing"
                    @click="candidatesVisible = true">
                    {{ $t('achievementRecommendation.viewCandidatesCount', { count: pointsMissing ? '—' : formatNumber(candidateRows.length) }) }}
                </el-button>
                <el-button type="primary" :disabled="disabled || pointsMissing" @click="addVisible = true">
                    <el-icon><Plus /></el-icon>{{ $t('achievementRecommendation.addAchievements') }}
                </el-button>
            </div>
            <div v-if="hasRequested || recommendation" class="m-server-recommendation__header-actions">
                <el-tooltip v-if="hasRequested" :content="$t('achievementRecommendation.refreshHint')">
                    <el-button :disabled="!canRequest" :loading="loading" :aria-label="$t('achievementRecommendation.refresh')" @click="$emit('refresh')">
                        <el-icon v-if="!loading"><Refresh /></el-icon>
                        <span class="m-recommendation-action-label">{{ $t('achievementRecommendation.refresh') }}</span>
                    </el-button>
                </el-tooltip>
                <el-tooltip v-if="recommendation" :content="$t('achievementRecommendation.restoreDraftHint')">
                    <el-button :disabled="disabled || !recommendation || detailsLoading" :aria-label="$t('achievementRecommendation.restoreDraft')" @click="restoreDraft">
                        <el-icon><Back /></el-icon>
                        <span class="m-recommendation-action-label">{{ $t('achievementRecommendation.restoreDraft') }}</span>
                    </el-button>
                </el-tooltip>
            </div>
        </div>
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
                <span>{{ $t('achievementRecommendation.snapshot') }}：{{ snapshotDateLabel || $t('achievementRecommendation.snapshotUnknown') }}</span>
                <a href="/pvx/achievements/guide#sync" target="_blank" rel="noopener noreferrer"
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
            <template v-if="tab === 'upcoming'">
                <p v-if="eventTagsLoading" role="status">{{ $t('achievementRecommendation.loadingEventNames') }}</p>
                <div v-else-if="eventTagsError" class="m-recommendation-difficulty-error" role="alert">
                    <span>{{ $t('achievementRecommendation.eventNamesFailed') }}</span>
                    <el-button text :disabled="disabled" @click="loadEventTags">{{ $t('achievementRecommendation.retry') }}</el-button>
                </div>
            </template>
            <div class="m-server-recommendation__filters">
                <el-cascader v-model="filters.categories" :options="filterOptions.categories" :props="{ multiple: true, checkStrictly: true }"
                    popper-class="m-leap-recommendation-category-popper"
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
            <p v-if="tab === 'recommended'" class="m-recommendation-candidate-hint">{{ $t('achievementRecommendation.candidateHint') }}</p>
            <el-alert v-if="pointsMissing" :title="$t('achievementRecommendation.pointsMissing', { id: selectionResult.missingPointId })" type="error" :closable="false" />
            <div class="m-server-recommendation__counts">
                <nav class="m-recommendation-view-scope" :aria-label="$t('achievementRecommendation.viewScope')">
                    <strong>{{ $t(tab === 'upcoming' ? 'achievementRecommendation.upcomingList' : 'achievementRecommendation.selectedList') }}</strong>
                    <el-button v-if="tab === 'recommended' && upcomingRows.length" link type="primary" :disabled="disabled" @click="tab = 'upcoming'">
                        {{ $t('achievementRecommendation.upcoming', { count: formatNumber(upcomingRows.length) }) }}
                    </el-button>
                    <el-button v-else-if="tab === 'upcoming'" link type="primary" :disabled="disabled" @click="tab = 'recommended'">
                        {{ $t('achievementRecommendation.returnToSelected') }}
                    </el-button>
                </nav>
                <span>{{ $t('achievementRecommendation.visibleCount', { count: visibleRows.length }) }}</span>
            </div>
            <div ref="results" class="m-server-recommendation__results">
                <p v-if="hasFilters && !filterIndexReady" role="status">{{ $t(filterIndexError ? 'achievementRecommendation.filterIndexFailed' : 'achievementRecommendation.loadingFilterIndex') }}</p>
                <template v-else>
                    <p v-if="difficultyStates[tab]?.loading" role="status">{{ $t('achievementRecommendation.loadingDifficulty') }}</p>
                    <div v-else-if="difficultyStates[tab]?.error" class="m-recommendation-difficulty-error" role="alert">
                        <span>{{ $t('achievementRecommendation.difficultyFailed') }}</span>
                        <el-button text :disabled="disabled" @click="loadDifficulty()">{{ $t('achievementRecommendation.retryDifficulty') }}</el-button>
                    </div>
                    <p v-if="tagStates[tab]?.loading" role="status">{{ $t('achievementRecommendation.loadingTags') }}</p>
                    <div v-else-if="tagStates[tab]?.error" class="m-recommendation-difficulty-error" role="alert">
                        <span>{{ $t('achievementRecommendation.tagsFailed') }}</span>
                        <el-button text :disabled="disabled" @click="loadTags()">{{ $t('achievementRecommendation.retryTags') }}</el-button>
                    </div>
                    <AchievementRecommendationItems v-if="visibleRows.length" :items="visibleRows" :selected-ids="selectedIds"
                        :dimensions="dimensions" :disabled="disabled" :editable="tab === 'recommended'" @move="moveItem" @remove="requestAction('remove', $event, 'selected')" />
                    <p v-if="detailsLoading" role="status">{{ $t('achievementRecommendation.loadingDetails', { count: loadedCount, total: matchingRows.length }) }}</p>
                    <div v-else-if="detailsError" role="alert">
                        <p>{{ $t('achievementRecommendation.detailsFailed') }}</p>
                        <el-button :disabled="disabled" @click="loadDetails()">{{ $t('achievementRecommendation.retry') }}</el-button>
                    </div>
                    <p v-else-if="!visibleRows.length" role="status">{{ $t(emptyMessage) }}</p>
                </template>
            </div>
        </template>
        <AchievementRecommendationCandidatesDialog v-model="candidatesVisible" v-model:filters="filters"
            :filter-options="filterOptions"
            :items="visibleCandidates" :total="candidateRows.length" :matching-count="matchingCandidates.length"
            :dimensions="dimensions" :disabled="disabled" :metadata="metadata"
            :filter-index-loading="filterIndexLoading" :filter-index-error="filterIndexError"
            :waiting-for-index="hasFilters && !filterIndexReady"
            :detail-state="detailStates.candidates" :difficulty-state="difficultyStates.candidates" :tag-state="tagStates.candidates"
            @load-index="loadFilterIndex" @retry-details="loadDetails('candidates')"
            @retry-difficulty="loadDifficulty('candidates')" @retry-tags="loadTags('candidates')"
            @add="requestAction('add', $event, 'candidates')" @remove="requestAction('remove', $event, 'candidates')" />
        <AchievementLeapAddDialog v-model="addVisible" :metadata="metadata" :menus="menus" :maps="maps"
            :completed-ids="completedIds" :school-eligibility="schoolEligibility" :client="client"
            :dimensions="dimensions" :selected-ids="[...selectedIds]" :disabled="disabled || pointsMissing"
            @add="requestManualAdd" />
        <AchievementRecommendationActionDialog v-if="pendingAction" :action="pendingAction.type" :scope="pendingAction.scope"
            :source="pendingAction.source"
            :items="actionItems" :related-count="relatedActionRows.length" :missing-point-id="actionMissingPointId" :disabled="disabled"
            @update:scope="pendingAction.scope = $event" @cancel="pendingAction = null" @confirm="confirmAction" />
    </div>
</template>

<style lang="less" scoped>
.m-recommendation-selection__actions {
    display: flex; flex: none; gap: 6px; flex-wrap: wrap;
    .el-button { margin: 0; min-height: 36px; height: auto; }
    :deep(.el-button > span) { white-space: normal; }
}
.m-server-recommendation { min-height: 0; min-width: 0; display: flex; flex-direction: column; color: #314043;
    padding-right: 4px;
    > * { flex-shrink: 0; min-width: 0; }
    p { font-size: 13px; color: #7a8586; }
}
.m-recommendation-toolbar {
    position: sticky;
    top: var(--achievement-sticky-top, 60px);
    z-index: 5;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px 16px;
    flex: none;
    padding: 8px 0;
    background: #fff;
    border-bottom: 1px solid #e2e8e6;
}
.m-server-recommendation__header {
    display: flex; flex: 1; flex-wrap: wrap; gap: 6px 16px; align-items: center; min-width: 0;
    h2 { flex: none; margin: 0; font-size: 16px; line-height: 1.5; }
}
.m-server-recommendation__header-actions {
    display: flex; flex: none; align-items: center; gap: 6px;
    .el-button { margin: 0; min-height: 36px; height: auto; }
}
.m-recommendation-candidate-hint { flex: none; margin: 0 0 10px; font-size: 12px; line-height: 1.5; }
.m-server-recommendation__start { min-height: 180px; display: flex; align-items: center; justify-content: center; }
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
.m-recommendation-selection__summary {
    display: flex; flex: 1; flex-wrap: wrap; align-items: baseline; gap: 4px 16px; min-width: 220px;
    font-size: 12px; line-height: 1.5; font-variant-numeric: tabular-nums;
    strong { color: #47777d; font-weight: 600; }
}
.m-recommendation-candidates-button { flex: none; }
.m-recommendation-selection__target { display: flex; flex-wrap: wrap; gap: 4px 10px; }
.m-recommendation-view-scope {
    display: flex; align-items: center; flex-wrap: wrap; gap: 4px 14px; max-width: 100%;
    > strong { color: #314043; font-size: 13px; }
    :deep(.el-button) { min-height: 32px; height: auto; padding: 4px 0; margin: 0; font-size: 12px; }
    :deep(.el-button > span) { white-space: normal; line-height: 1.5; }
}
.m-server-recommendation__filters { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; flex: none; margin-bottom: 10px;
    .el-cascader, .el-select, .el-input { width: 100%; min-width: 0; } svg { width: 16px; height: 16px; }
}
.m-server-recommendation__counts { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; padding: 12px 0; font-size: 12px; color: #697374; flex: none;
    strong { font-weight: 500; color: #47777d; }
}
.m-server-recommendation__results { flex: none; border-top: 1px solid #e2e8e6; }
.m-recommendation-difficulty-error { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; padding: 4px 10px; font-size: 13px; color: #ae3b40; }
@media (max-width: @phone) {
    .m-server-recommendation {
        > * {
            min-width: 0;
            overflow-wrap: anywhere;
        }

        :deep(.el-button) {
            min-height: 40px;
            height: auto;
            max-width: 100%;
            margin-left: 0;
        }

        :deep(.el-button > span) {
            white-space: normal;
            line-height: 1.4;
        }
    }

    .m-server-recommendation__header-actions {
        gap: 6px;
        :deep(.el-button) { width: 40px; padding: 0; }
    }
    .m-recommendation-action-label { display: none; }
    .m-recommendation-toolbar { gap: 6px 8px; padding: 6px 0; }
    .m-server-recommendation__header { flex-basis: 100%; gap: 4px 10px; }
    .m-recommendation-selection__summary { gap: 2px 8px; }
    .m-recommendation-selection__target { gap: 2px 8px; }
    .m-recommendation-selection__actions {
        flex: 1; min-width: 0;
        .el-button { flex: 1; padding: 8px 6px; font-size: 12px; }
    }

    .m-server-recommendation__filters {
        grid-template-columns: minmax(0, 1fr);
    }

}
</style>

<style lang="less">
@media (max-width: @phone) {
    .m-leap-recommendation-category-popper {
        max-width: calc(100vw - 32px);

        .el-cascader-panel {
            max-width: 100%;
            overflow-x: auto;
            overscroll-behavior-x: contain;
            -webkit-overflow-scrolling: touch;
        }

        .el-cascader-menu {
            flex: none;
        }

        .el-cascader-node {
            min-height: 40px;
        }
    }
}
</style>
