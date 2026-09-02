<script>
import User from "@jx3box/jx3box-common/js/user";
import { ArrowLeft, CopyDocument, Delete, Edit, FolderOpened, UserFilled, WarningFilled } from "@element-plus/icons-vue";
import AchievementLeapPlanner from "@/components/wiki/leap/AchievementLeapPlanner.vue";
import AchievementLeapPlanList from "@/components/wiki/leap/AchievementLeapPlanList.vue";
import AchievementLeapRouteTable from "@/components/wiki/leap/AchievementLeapRouteTable.vue";
import AchievementLeapSaveDialog from "@/components/wiki/leap/AchievementLeapSaveDialog.vue";
import AchievementLeapSummary from "@/components/wiki/leap/AchievementLeapSummary.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import {
    deleteAchievementWorkbenchLeapPlan,
    fetchAchievementWorkbenchCatalog,
    fetchAchievementWorkbenchDifficulty,
    fetchAchievementWorkbenchLeapPlan,
    fetchAchievementWorkbenchLeapPlans,
    fetchAchievementWorkbenchMaps,
    fetchAchievementWorkbenchRecordsBatched,
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    saveAchievementWorkbenchLeapPlan,
    searchAchievementWorkbenchRecords,
} from "@/service/achievementWorkbench";
import {
    buildAchievementLeapCandidates,
    buildAchievementLeapCategoryOptions,
    buildAchievementLeapPlanProgress,
    buildAchievementLeapRoute,
    filterAchievementLeapIds,
    removeAchievementLeapRouteItem,
} from "@/utils/achievementLeap";
import { buildAchievementOverallProgress } from "@/utils/achievementProgress";
import { __Links } from "@/utils/config";

const PLAN_PAGE_SIZE = 9;

function emptyRoleState() {
    return { jx3id: null, completedIds: [], synced: false, updatedAt: null };
}

export default {
    name: "AchievementLeapPage",
    components: {
        AchievementLeapPlanner,
        AchievementLeapPlanList,
        AchievementLeapRouteTable,
        AchievementLeapSaveDialog,
        AchievementLeapSummary,
        ArrowLeft,
        CopyDocument,
        Delete,
        Edit,
        FolderOpened,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
        UserFilled,
        WarningFilled,
    },
    data() {
        return {
            isLogin: User.isLogin(),
            pageLoading: User.isLogin(),
            pageError: false,
            roleLoading: false,
            plansLoading: false,
            routeLoading: false,
            detailLoading: false,
            saving: false,
            menus: {},
            metadata: {},
            roles: [],
            maps: [],
            currentRoleId: "",
            roleState: emptyRoleState(),
            plans: [],
            plansTotal: 0,
            plansPage: 1,
            plansPageSize: PLAN_PAGE_SIZE,
            plannerForm: {
                title: "",
                roleId: "",
                targetPoints: 10000,
                categoryIds: [],
                mapId: "",
                maxDifficulty: 3,
                strategy: "easy-first",
            },
            generatedRoute: null,
            editingPlan: null,
            detailPlan: null,
            detailRoute: null,
            saveDialogVisible: false,
            roleRequestId: 0,
            routeRequestId: 0,
            detailRequestId: 0,
        };
    },
    computed: {
        loginUrl() {
            return __Links.account.login + "?redirect=" + encodeURIComponent(location.href);
        },
        currentRole() {
            return this.roles.find((role) => role.id === this.currentRoleId) || null;
        },
        overallProgress() {
            return buildAchievementOverallProgress(this.metadata, this.roleState.completedIds);
        },
        currentPoints() {
            return this.overallProgress.completedPoints || 0;
        },
        categoryOptions() {
            return buildAchievementLeapCategoryOptions(this.menus, this.metadata, this.roleState.completedIds);
        },
        mapOptions() {
            return [...this.maps]
                .map((map) => ({
                    ...map,
                    label: map.regionName ? `${map.regionName} · ${map.name}` : map.name,
                }))
                .sort((left, right) => left.label.localeCompare(right.label));
        },
        detailId() {
            const id = this.$route.params.id || this.$route.query.id;
            return id ? String(id) : "";
        },
        detailMode() {
            return Boolean(this.detailId);
        },
        canSaveRoute() {
            return Boolean(this.generatedRoute?.items?.length && !this.routeLoading);
        },
    },
    watch: {
        detailId: {
            handler(id) {
                if (id && this.metadata && Object.keys(this.metadata).length) this.loadPlanDetail(id);
                if (!id) {
                    this.detailPlan = null;
                    this.detailRoute = null;
                }
            },
        },
    },
    mounted() {
        this.initializePage();
    },
    beforeUnmount() {
        this.roleRequestId += 1;
        this.routeRequestId += 1;
        this.detailRequestId += 1;
    },
    methods: {
        createDefaultForm(roleId = "", currentPoints = 0) {
            return {
                title: this.$t ? this.$t("pages.wiki.leap.ui.workbench.defaultPlanName") : "",
                roleId,
                targetPoints: Math.ceil((Number(currentPoints || 0) + 10000) / 1000) * 1000,
                categoryIds: [],
                mapId: "",
                maxDifficulty: 3,
                strategy: "easy-first",
            };
        },
        async initializePage() {
            if (!this.isLogin) {
                this.pageLoading = false;
                return;
            }

            this.pageLoading = true;
            this.pageError = false;
            const client = this.$store.state.client || "std";
            try {
                const [catalog, roles, maps] = await Promise.all([
                    fetchAchievementWorkbenchCatalog(client),
                    fetchAchievementWorkbenchRoles(),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                ]);
                this.menus = catalog.menus;
                this.metadata = catalog.metadata;
                this.roles = roles;
                this.maps = maps;

                const queryRoleId = String(this.$route.query.jx3id || "");
                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                this.currentRoleId =
                    roles.find((role) => role.id === queryRoleId)?.id ||
                    roles.find((role) => role.id === lastRoleId)?.id ||
                    roles[0]?.id ||
                    "";

                if (this.currentRoleId) await this.loadRoleState(this.currentRoleId, { resetForm: true });
                await this.loadPlans();
                if (this.detailId) await this.loadPlanDetail(this.detailId);
            } catch (error) {
                console.error("Failed to initialize achievement leap page:", error);
                this.pageError = true;
            } finally {
                this.pageLoading = false;
            }
        },
        async loadRoleState(roleId, { resetForm = false } = {}) {
            const requestId = ++this.roleRequestId;
            this.roleLoading = true;
            try {
                const state = await fetchAchievementWorkbenchRoleState(roleId);
                if (requestId !== this.roleRequestId) return;
                this.currentRoleId = roleId;
                this.roleState = state;
                localStorage.setItem("wiki_last_sync", roleId);
                const points = buildAchievementOverallProgress(this.metadata, state.completedIds).completedPoints || 0;
                if (resetForm) this.plannerForm = this.createDefaultForm(roleId, points);
                else this.plannerForm = { ...this.plannerForm, roleId };
                this.generatedRoute = null;
                this.editingPlan = null;
                if (this.detailId) await this.loadPlanDetail(this.detailId);
            } catch (error) {
                console.error("Failed to load leap role state:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.roleLoadFailed"));
            } finally {
                if (requestId === this.roleRequestId) this.roleLoading = false;
            }
        },
        async handleRoleChange(roleId) {
            if (!roleId || roleId === this.currentRoleId || this.roleLoading) return;
            await this.loadRoleState(roleId, { resetForm: true });
            this.$router.replace({
                name: "leap",
                query: { ...this.$route.query, jx3id: roleId },
            });
        },
        resetPlanner() {
            this.plannerForm = this.createDefaultForm(this.currentRoleId, this.currentPoints);
            this.generatedRoute = null;
            this.editingPlan = null;
        },
        async loadPlans() {
            this.plansLoading = true;
            try {
                const result = await fetchAchievementWorkbenchLeapPlans({
                    client: this.$store.state.client || "std",
                    page: this.plansPage,
                    per: this.plansPageSize,
                });
                this.plans = result.list;
                this.plansTotal = result.total;
            } catch (error) {
                console.error("Failed to load achievement leap plans:", error);
                this.plans = [];
                this.plansTotal = 0;
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.planListLoadFailed"));
            } finally {
                this.plansLoading = false;
            }
        },
        async changePlansPage(page) {
            this.plansPage = page;
            await this.loadPlans();
        },
        async generateRoute() {
            if (this.routeLoading) return;
            const form = this.plannerForm;
            if (!String(form.title || "").trim()) {
                this.$message.warning(this.$t("pages.wiki.leap.ui.enterPlanNameWarning"));
                return;
            }
            if (Number(form.targetPoints) <= this.currentPoints) {
                this.$message.warning(this.$t("pages.wiki.leap.ui.workbench.targetMustExceedCurrent"));
                return;
            }

            const requestId = ++this.routeRequestId;
            this.routeLoading = true;
            try {
                let scopedRecords = [];
                let allowedIds = null;
                if (form.mapId) {
                    scopedRecords = await searchAchievementWorkbenchRecords({
                        mapId: form.mapId,
                        client: this.$store.state.client || "std",
                        metadata: this.metadata,
                        completedIds: this.roleState.completedIds,
                    });
                    allowedIds = scopedRecords.map((record) => record.id);
                }

                const baseCandidates = buildAchievementLeapCandidates({
                    metadata: this.metadata,
                    menus: this.menus,
                    completedIds: this.roleState.completedIds,
                    records: scopedRecords,
                    categoryIds: form.categoryIds,
                    allowedIds,
                });
                const candidateIds = baseCandidates.map((item) => item.id);
                const difficultyById = await fetchAchievementWorkbenchDifficulty(candidateIds).catch((error) => {
                    console.error("Failed to load achievement leap difficulty:", error);
                    return {};
                });
                if (requestId !== this.routeRequestId) return;

                const difficultyAvailable = Object.values(difficultyById).some(
                    (value) => value !== null && value !== undefined
                );
                const candidates = buildAchievementLeapCandidates({
                    metadata: this.metadata,
                    menus: this.menus,
                    completedIds: this.roleState.completedIds,
                    records: scopedRecords,
                    difficultyById,
                    categoryIds: form.categoryIds,
                    allowedIds,
                    maxDifficulty: form.maxDifficulty,
                    enforceDifficulty: difficultyAvailable,
                });
                let route = buildAchievementLeapRoute({
                    candidates,
                    currentPoints: this.currentPoints,
                    targetPoints: form.targetPoints,
                    strategy: form.strategy,
                });

                const detailRecords = await fetchAchievementWorkbenchRecordsBatched({
                    ids: route.items.map((item) => item.id),
                    metadata: this.metadata,
                    completedIds: this.roleState.completedIds,
                });
                if (requestId !== this.routeRequestId) return;

                const hydratedCandidates = buildAchievementLeapCandidates({
                    metadata: this.metadata,
                    menus: this.menus,
                    completedIds: this.roleState.completedIds,
                    records: [...scopedRecords, ...detailRecords],
                    difficultyById,
                    allowedIds: route.items.map((item) => item.id),
                });
                route = buildAchievementLeapRoute({
                    candidates: hydratedCandidates,
                    currentPoints: this.currentPoints,
                    targetPoints: form.targetPoints,
                    strategy: form.strategy,
                });
                this.generatedRoute = route;

                if (!route.items.length) {
                    this.$message.warning(this.$t("pages.wiki.leap.ui.workbench.noCandidates"));
                } else if (!difficultyAvailable && form.maxDifficulty !== null) {
                    this.$message.warning(this.$t("pages.wiki.leap.ui.workbench.difficultyFallback"));
                }
                await this.$nextTick();
                document.querySelector(".m-leap-generated-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
            } catch (error) {
                console.error("Failed to generate achievement leap route:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.createFailed"));
            } finally {
                if (requestId === this.routeRequestId) this.routeLoading = false;
            }
        },
        openSaveDialog() {
            if (!this.canSaveRoute) return;
            this.saveDialogVisible = true;
        },
        removeGeneratedRouteItem(item) {
            if (!this.generatedRoute || !item?.id) return;
            this.generatedRoute = removeAchievementLeapRouteItem(this.generatedRoute, item.id);
        },
        buildPlanPayload(title) {
            const route = this.generatedRoute;
            return {
                title,
                schema: route.items.map((item) => item.id),
                meta: {
                    createBy: "planner",
                    roleId: this.currentRoleId,
                    targetPoints: Number(this.plannerForm.targetPoints),
                    categoryIds: this.plannerForm.categoryIds,
                    mapId: this.plannerForm.mapId || null,
                    maxDifficulty: this.plannerForm.maxDifficulty,
                    strategy: this.plannerForm.strategy,
                    generatedStrategy: route.strategy,
                    selectedPoints: route.selectedPoints,
                },
                client: this.$store.state.client || "std",
            };
        },
        async saveRoute(title) {
            if (!this.canSaveRoute || this.saving) return;
            this.saving = true;
            try {
                const saved = await saveAchievementWorkbenchLeapPlan(
                    this.buildPlanPayload(title),
                    this.editingPlan?.id || null
                );
                this.saveDialogVisible = false;
                this.$message.success(
                    this.editingPlan
                        ? this.$t("pages.wiki.leap.ui.workbench.updateSuccess")
                        : this.$t("pages.wiki.leap.ui.createSuccess")
                );
                this.editingPlan = null;
                await this.loadPlans();
                if (saved.id) await this.openPlan(saved);
            } catch (error) {
                console.error("Failed to save achievement leap plan:", error);
                this.$message.error(
                    this.editingPlan
                        ? this.$t("pages.wiki.leap.ui.workbench.updateFailed")
                        : this.$t("pages.wiki.leap.ui.createFailed")
                );
            } finally {
                this.saving = false;
            }
        },
        async openPlan(plan) {
            await this.$router.push({
                name: "leap-detail",
                params: { id: plan.id },
                query: { jx3id: this.currentRoleId },
            });
        },
        closePlanDetail() {
            const query = { ...this.$route.query };
            delete query.id;
            this.$router.push({ name: "leap", query });
        },
        async loadPlanDetail(id) {
            if (!id || !Object.keys(this.metadata).length) return;
            const requestId = ++this.detailRequestId;
            this.detailLoading = true;
            try {
                const plan = await fetchAchievementWorkbenchLeapPlan(id);
                if (requestId !== this.detailRequestId) return;
                const { items, difficultyById } = await this.hydratePlanItems(plan.schema);
                if (requestId !== this.detailRequestId) return;
                this.detailPlan = plan;
                this.detailRoute = this.buildDetailRoute(plan, items, difficultyById);
            } catch (error) {
                console.error("Failed to load achievement leap plan detail:", error);
                this.detailPlan = null;
                this.detailRoute = null;
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.planDetailLoadFailed"));
            } finally {
                if (requestId === this.detailRequestId) this.detailLoading = false;
            }
        },
        async hydratePlanItems(schema) {
            const regularSchema = filterAchievementLeapIds(schema, this.metadata);
            const [records, difficultyById] = await Promise.all([
                fetchAchievementWorkbenchRecordsBatched({
                    ids: regularSchema,
                    metadata: this.metadata,
                    completedIds: this.roleState.completedIds,
                }),
                fetchAchievementWorkbenchDifficulty(regularSchema).catch(() => ({})),
            ]);
            const candidates = buildAchievementLeapCandidates({
                metadata: this.metadata,
                menus: this.menus,
                completedIds: [],
                records,
                difficultyById,
                allowedIds: regularSchema,
                includeZeroPoints: true,
            });
            const candidateMap = new Map(candidates.map((item) => [item.id, item]));
            const completed = new Set(this.roleState.completedIds.map(String));
            return {
                items: regularSchema
                    .map((id) => candidateMap.get(String(id)))
                    .filter(Boolean)
                    .map((item) => ({ ...item, completed: completed.has(String(item.id)) })),
                difficultyById,
            };
        },
        buildDetailRoute(plan, items) {
            const progress = buildAchievementLeapPlanProgress(plan, this.metadata, this.roleState.completedIds);
            const incomplete = items.filter((item) => !item.completed);
            const targetPoints = Number(plan.meta?.targetPoints) || this.currentPoints + progress.remainingPoints;
            const hasMinutes = incomplete.length > 0 && incomplete.every((item) => item.estimatedMinutes !== null);
            const hasDifficulty = incomplete.length > 0 && incomplete.every((item) => item.difficulty !== null);
            return {
                items,
                requestedStrategy: plan.meta?.strategy || "big-first",
                strategy: plan.meta?.generatedStrategy || plan.meta?.strategy || "big-first",
                currentPoints: this.currentPoints,
                targetPoints,
                targetGap: Math.max(0, targetPoints - this.currentPoints),
                selectedPoints: progress.remainingPoints,
                projectedPoints: this.currentPoints + progress.remainingPoints,
                remainingGap: Math.max(0, targetPoints - this.currentPoints - progress.remainingPoints),
                reached: this.currentPoints + progress.remainingPoints >= targetPoints,
                totalMinutes: hasMinutes
                    ? incomplete.reduce((total, item) => total + Number(item.estimatedMinutes), 0)
                    : null,
                averageDifficulty: hasDifficulty
                    ? Number(
                          (
                              incomplete.reduce((total, item) => total + Number(item.difficulty), 0) /
                              incomplete.length
                          ).toFixed(2)
                      )
                    : null,
                averageCostScore: null,
            };
        },
        async preparePlanForEditor(plan, { copy = false } = {}) {
            this.closePlanDetail();
            const source = plan.schema?.length ? plan : await fetchAchievementWorkbenchLeapPlan(plan.id);
            const { items } = await this.hydratePlanItems(source.schema);
            const progress = buildAchievementLeapPlanProgress(source, this.metadata, this.roleState.completedIds);
            const targetPoints = Number(source.meta?.targetPoints) || this.currentPoints + progress.remainingPoints;
            this.plannerForm = {
                title: copy
                    ? this.$t("pages.wiki.leap.ui.workbench.copyTitle", { title: source.title })
                    : source.title,
                roleId: this.currentRoleId,
                targetPoints,
                categoryIds: source.meta?.categoryIds || [],
                mapId: source.meta?.mapId || "",
                maxDifficulty: source.meta?.maxDifficulty ?? null,
                strategy: source.meta?.strategy || "big-first",
            };
            this.generatedRoute = this.buildDetailRoute(source, items);
            this.editingPlan = copy ? null : source;
            await this.$nextTick();
            document.querySelector(".m-leap-planner")?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        editPlan(plan) {
            return this.preparePlanForEditor(plan);
        },
        copyPlan(plan) {
            return this.preparePlanForEditor(plan, { copy: true });
        },
        async deletePlan(plan) {
            try {
                await this.$confirm(
                    this.$t("pages.wiki.leap.ui.deleteConfirm", { title: plan.title }),
                    this.$t("pages.wiki.leap.ui.confirmTitle"),
                    {
                        confirmButtonText: this.$t("pages.wiki.leap.ui.confirm"),
                        cancelButtonText: this.$t("pages.wiki.leap.ui.cancel"),
                        type: "warning",
                    }
                );
            } catch {
                return;
            }

            try {
                await deleteAchievementWorkbenchLeapPlan(plan.id);
                this.$message.success(this.$t("pages.wiki.leap.ui.deleteSuccess"));
                if (this.detailId === String(plan.id)) this.closePlanDetail();
                await this.loadPlans();
            } catch (error) {
                console.error("Failed to delete achievement leap plan:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.deleteFailed"));
            }
        },
    },
};
</script>

<template>
    <div class="p-achievement-leap-new">
        <PvxSurface v-if="!isLogin" class="m-leap-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.loginRequired')"
                :description="$t('pages.wiki.leap.ui.loginDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton :href="loginUrl">{{ $t("pages.wiki.leap.ui.goLogin") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageError" class="m-leap-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.loadFailed')"
                :description="$t('pages.wiki.leap.ui.loadFailedDescription')"
            >
                <template #icon><WarningFilled /></template>
                <template #action>
                    <PvxActionButton @click="initializePage">{{ $t("pages.wiki.leap.ui.retry") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <PvxSurface v-else-if="pageLoading" class="m-leap-page-state is-loading" padding="none" v-loading="true">
            <span>{{ $t("pages.wiki.leap.ui.workbench.loading") }}</span>
        </PvxSurface>

        <PvxSurface v-else-if="!roles.length" class="m-leap-page-state" padding="none">
            <PvxEmptyState
                :title="$t('pages.wiki.leap.ui.noRole')"
                :description="$t('pages.wiki.leap.ui.noRoleDescription')"
            >
                <template #icon><UserFilled /></template>
                <template #action>
                    <PvxActionButton href="/team/role/bind">{{ $t("pages.wiki.leap.ui.bindRole") }}</PvxActionButton>
                </template>
            </PvxEmptyState>
        </PvxSurface>

        <div v-else-if="detailMode" class="m-leap-page-content" v-loading="detailLoading">
            <PvxSurface class="m-leap-detail-header" padding="medium">
                <div>
                    <button type="button" class="u-leap-back" @click="closePlanDetail">
                        <ArrowLeft />{{ $t("pages.wiki.leap.ui.title") }}
                    </button>
                    <span>{{ $t("pages.wiki.leap.ui.planDetail") }}</span>
                    <h1>{{ detailPlan?.title || $t("pages.wiki.leap.ui.unnamedPlan") }}</h1>
                </div>
                <div v-if="detailPlan" class="m-leap-detail-header__actions">
                    <button v-if="!detailPlan.official" type="button" @click="editPlan(detailPlan)"><Edit />{{ $t("pages.wiki.leap.ui.workbench.editPlan") }}</button>
                    <button v-else type="button" @click="copyPlan(detailPlan)"><CopyDocument />{{ $t("pages.wiki.leap.ui.workbench.copyAsMine") }}</button>
                    <button v-if="!detailPlan.official" type="button" class="is-danger" @click="deletePlan(detailPlan)"><Delete />{{ $t("pages.wiki.leap.ui.workbench.deletePlanShort") }}</button>
                </div>
            </PvxSurface>

            <AchievementLeapSummary
                v-if="detailRoute"
                :route="detailRoute"
                :title="detailPlan?.title"
            />
            <AchievementLeapRouteTable v-if="detailRoute" :items="detailRoute.items" :loading="detailLoading" />
            <PvxEmptyState
                v-else-if="!detailLoading"
                :title="$t('pages.wiki.leap.ui.workbench.planDetailLoadFailed')"
                :description="$t('pages.wiki.leap.ui.loadFailedDescription')"
            >
                <template #icon><FolderOpened /></template>
            </PvxEmptyState>
        </div>

        <div v-else class="m-leap-page-content">
            <AchievementLeapPlanner
                v-model="plannerForm"
                :roles="roles"
                :categories="categoryOptions"
                :maps="mapOptions"
                :current-points="currentPoints"
                :generating="routeLoading || roleLoading"
                @generate="generateRoute"
                @reset="resetPlanner"
                @role-change="handleRoleChange"
            />

            <section v-if="generatedRoute" class="m-leap-generated-result">
                <AchievementLeapSummary :route="generatedRoute" :title="plannerForm.title" />
                <div class="m-leap-generated-actions">
                    <p>{{ $t("pages.wiki.leap.ui.workbench.localGenerationNote") }}</p>
                    <button type="button" class="u-leap-discard-button" @click="generatedRoute = null">
                        {{ $t("pages.wiki.leap.ui.workbench.discardRoute") }}
                    </button>
                    <button type="button" class="u-leap-save-button" :disabled="!canSaveRoute" @click="openSaveDialog">
                        {{
                            editingPlan
                                ? $t("pages.wiki.leap.ui.workbench.updatePlan")
                                : $t("pages.wiki.leap.ui.workbench.savePlan")
                        }}
                    </button>
                </div>
                <AchievementLeapRouteTable
                    :items="generatedRoute.items"
                    :loading="routeLoading"
                    removable
                    @remove="removeGeneratedRouteItem"
                />
            </section>

            <AchievementLeapPlanList
                :plans="plans"
                :metadata="metadata"
                :completed-ids="roleState.completedIds"
                :loading="plansLoading"
                :total="plansTotal"
                :page="plansPage"
                :page-size="plansPageSize"
                @view="openPlan"
                @edit="editPlan"
                @copy="copyPlan"
                @delete="deletePlan"
                @page-change="changePlansPage"
            />
        </div>

        <AchievementLeapSaveDialog
            v-model="saveDialogVisible"
            :title="plannerForm.title"
            :editing="Boolean(editingPlan)"
            :saving="saving"
            :route-count="generatedRoute?.items?.length || 0"
            :route-points="generatedRoute?.selectedPoints || 0"
            @save="saveRoute"
        />
    </div>
</template>

<style lang="less" scoped>
.p-achievement-leap-new,
.m-leap-page-content,
.m-leap-generated-result {
    display: grid;
    min-width: 0;
    gap: 16px;
}

.m-leap-page-state {
    min-height: 440px;
}

.m-leap-page-state.is-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #7a8586;
}

.m-leap-generated-result {
    scroll-margin-top: 84px;
}

.m-leap-generated-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgba(68, 86, 84, 0.12);
    border-radius: 11px;
    background: #f6f2e9;
}

.m-leap-generated-actions p {
    margin: 0 auto 0 0;
    color: #7d8788;
    font-size: 12px;
}

.u-leap-save-button,
.u-leap-discard-button,
.m-leap-detail-header__actions button,
.u-leap-back {
    display: inline-flex;
    min-height: 38px;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 14px;
    border: 1px solid #47777d;
    border-radius: 8px;
    cursor: pointer;
}

.u-leap-save-button {
    color: #fff;
    background: #47777d;
}

.u-leap-discard-button,
.m-leap-detail-header__actions button,
.u-leap-back {
    color: #47777d;
    background: transparent;
}

.u-leap-save-button:disabled {
    border-color: #adb8b8;
    background: #adb8b8;
    cursor: not-allowed;
}

.m-leap-detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
}

.m-leap-detail-header > div:first-child > span {
    display: block;
    margin-top: 12px;
    color: #a88139;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.12em;
}

.m-leap-detail-header h1 {
    margin: 4px 0 0;
    color: #324346;
    font-size: 24px;
}

.u-leap-back {
    min-height: 34px;
    padding: 6px 10px;
}

.u-leap-back svg,
.m-leap-detail-header__actions svg {
    width: 15px;
}

.m-leap-detail-header__actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 8px;
}

.m-leap-detail-header__actions button.is-danger {
    border-color: rgba(163, 84, 63, 0.35);
    color: #a3543f;
}

@media (max-width: 720px) {
    .m-leap-generated-actions,
    .m-leap-detail-header {
        display: grid;
    }

    .m-leap-generated-actions p {
        margin: 0;
    }

    .m-leap-generated-actions {
        grid-template-columns: 1fr 1fr;
    }

    .m-leap-generated-actions p {
        grid-column: 1 / -1;
    }

    .m-leap-detail-header__actions {
        justify-content: flex-start;
    }
}
</style>
