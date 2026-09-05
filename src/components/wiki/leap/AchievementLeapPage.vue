<script>
import User from "@jx3box/jx3box-common/js/user";
import { FolderOpened, Plus, UserFilled, WarningFilled, MagicStick } from "@element-plus/icons-vue";
import AchievementLeapAddDialog from "@/components/wiki/leap/AchievementLeapAddDialog.vue";
import AchievementLeapBaseSettings from "@/components/wiki/leap/AchievementLeapBaseSettings.vue";
import AchievementLeapDetailHeader from "@/components/wiki/leap/AchievementLeapDetailHeader.vue";
import PlanConsultations from "@/components/wiki/consultation/PlanConsultations.vue";
import AchievementLeapPlanList from "@/components/wiki/leap/AchievementLeapPlanList.vue";
import AchievementLeapRecommendationDrawer from "@/components/wiki/leap/AchievementLeapRecommendationDrawer.vue";
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
    fetchAchievementWorkbenchDifficultyDimensions,
    fetchAchievementWorkbenchDifficultyMetrics,
    fetchAchievementWorkbenchLeapPlan,
    fetchAchievementWorkbenchLeapPlans,
    fetchAchievementWorkbenchMaps,
    fetchAchievementWorkbenchRecordsBatched,
    fetchAchievementWorkbenchRoles,
    fetchAchievementWorkbenchRoleState,
    fetchAchievementWorkbenchRecommendation,
    fetchAchievementWorkbenchTags,
    saveAchievementWorkbenchLeapPlan,
    searchAchievementWorkbenchRecords,
} from "@/service/achievementWorkbench";
import {
    addAchievementLeapRouteItem,
    buildAchievementLeapCandidates,
    buildAchievementLeapCategoryOptions,
    buildAchievementLeapPlanProgress,
    filterAchievementLeapIds,
    removeAchievementLeapRouteItem,
} from "@/utils/achievementLeap";
import { buildAchievementOverallProgress } from "@/utils/achievementProgress";
import { buildAchievementSchoolEligibilityContext } from "@/utils/achievementSchoolEligibility";
import {
    applyAchievementWorkbenchEnrichment,
    resolveAchievementWorkbenchDimensions,
} from "@/utils/achievementWorkbench";
import { __Links } from "@/utils/config";
import {
    selectAchievementRecommendationItems, buildAchievementRecommendationPlan,
    achievementRecommendationPlanMetadata, flattenAchievementRecommendation,
    defaultAchievementRecommendationOptions, achievementRecommendationPreferences,
} from "@/utils/achievementRecommendation";

const PLAN_PAGE_SIZE = 9;

function emptyRoleState() {
    return { jx3id: null, completedIds: [], synced: false, updatedAt: null };
}

export default {
    name: "AchievementLeapPage",
    components: {
        AchievementLeapAddDialog,
        AchievementLeapBaseSettings,
        AchievementLeapDetailHeader,
        PlanConsultations,
        AchievementLeapPlanList,
        AchievementLeapRecommendationDrawer,
        AchievementLeapRouteTable,
        AchievementLeapSaveDialog,
        AchievementLeapSummary,
        FolderOpened,
        Plus,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
        UserFilled,
        WarningFilled,
        MagicStick,
    },
    data() {
        return {
            isLogin: User.isLogin(),
            pageLoading: User.isLogin(),
            pageError: false,
            roleLoading: false,
            plansLoading: false,
            detailLoading: false,
            recommendationLoading: false,
            addSearchLoading: false,
            saving: false,
            menus: {},
            metadata: {},
            roles: [],
            maps: [],
            dimensions: resolveAchievementWorkbenchDimensions([]),
            recommendationDimensions: [],
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
            recommendation: null,
            recommendationDrawerVisible: false,
            recommendationOptions: defaultAchievementRecommendationOptions(),
            recommendationError: "",
            editingPlan: null,
            detailPlan: null,
            detailRoute: null,
            detailClientMismatch: null,
            saveDialogVisible: false,
            addDialogVisible: false,
            addSearchResults: [],
            pageRequestId: 0,
            roleRequestId: 0,
            plansRequestId: 0,
            detailRequestId: 0,
            recommendationRequestId: 0,
            addSearchRequestId: 0,
            editorRequestId: 0,
            saveRequestId: 0,
        };
    },
    computed: {
        currentClient() {
            return this.$store.state.client === "origin" ? "origin" : "std";
        },
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
        schoolEligibility() {
            return buildAchievementSchoolEligibilityContext({
                menus: this.menus,
                roleSchool: this.currentRole?.school,
            });
        },
        categoryOptions() {
            return buildAchievementLeapCategoryOptions(this.menus, this.metadata, this.roleState.completedIds, {
                schoolEligibility: this.schoolEligibility,
            });
        },
        detailId() {
            const id = this.$route.params.id || this.$route.query.id;
            return id ? String(id) : "";
        },
        detailMode() {
            return Boolean(this.detailId);
        },
        canConsultPlan() {
            const uid = User.getInfo()?.uid;
            return Boolean(this.isLogin && uid && this.currentClient === "std" && this.detailPlan?.client === "std" &&
                String(this.detailPlan.raw?.user_id) === String(uid));
        },
        canSaveRoute() {
            return Boolean(this.generatedRoute?.items?.length);
        },
        generatedRouteIds() {
            return (this.generatedRoute?.items || []).map((item) => String(item.id));
        },
    },
    watch: {
        currentClient(nextClient, previousClient) {
            if (!previousClient || nextClient === previousClient) return;
            this.resetClientState();
            this.initializePage();
        },
        detailId: {
            handler(id) {
                this.detailRequestId += 1;
                this.editorRequestId += 1;
                this.detailLoading = false;
                this.detailPlan = null;
                this.detailRoute = null;
                this.detailClientMismatch = null;
                if (id && this.metadata && Object.keys(this.metadata).length) this.loadPlanDetail(id);
            },
        },
    },
    mounted() {
        this.initializePage();
    },
    beforeUnmount() {
        this.pageRequestId += 1;
        this.roleRequestId += 1;
        this.plansRequestId += 1;
        this.detailRequestId += 1;
        this.recommendationRequestId += 1;
        this.addSearchRequestId += 1;
        this.editorRequestId += 1;
        this.saveRequestId += 1;
    },
    methods: {
        normalizePlanClient(client) {
            const normalized = String(client || "")
                .trim()
                .toLowerCase();
            return normalized === "std" || normalized === "origin" ? normalized : null;
        },
        getClientLabel(client) {
            const normalized = this.normalizePlanClient(client) || this.currentClient;
            return this.$t(`pages.wiki.leap.ui.workbench.clients.${normalized}`);
        },
        getPlanClientMismatch(plan) {
            const planClient = this.normalizePlanClient(plan?.client);
            if (!planClient || planClient === this.currentClient) return null;
            return { planClient, currentClient: this.currentClient };
        },
        warnPlanClientMismatch(plan) {
            const mismatch = this.getPlanClientMismatch(plan);
            if (!mismatch) return false;
            this.$message.warning(
                this.$t("pages.wiki.leap.ui.workbench.planClientMismatchWarning", {
                    client: this.getClientLabel(mismatch.planClient),
                })
            );
            return true;
        },
        resetClientState() {
            this.pageRequestId += 1;
            this.roleRequestId += 1;
            this.plansRequestId += 1;
            this.detailRequestId += 1;
            this.recommendationRequestId += 1;
            this.addSearchRequestId += 1;
            this.editorRequestId += 1;
            this.saveRequestId += 1;
            this.roleLoading = false;
            this.plansLoading = false;
            this.detailLoading = false;
            this.recommendationLoading = false;
            this.addSearchLoading = false;
            this.saving = false;
            this.menus = {};
            this.metadata = {};
            this.maps = [];
            this.dimensions = resolveAchievementWorkbenchDimensions([]);
            this.recommendationDimensions = [];
            this.plans = [];
            this.plansTotal = 0;
            this.plansPage = 1;
            this.roleState = emptyRoleState();
            this.generatedRoute = null;
            this.detailPlan = null;
            this.detailRoute = null;
            this.detailClientMismatch = null;
            this.addSearchResults = [];
            this.recommendation = null;
            this.recommendationDrawerVisible = false;
            this.recommendationOptions = defaultAchievementRecommendationOptions();
            this.recommendationError = "";
            this.editingPlan = null;
            this.saveDialogVisible = false;
            this.addDialogVisible = false;
        },
        async enrichAchievementItems(items, client = this.currentClient) {
            const records = Array.isArray(items) ? items : [];
            const ids = records.map((item) => item.id);
            if (!ids.length) return records;

            const [difficultyResult, tagsResult] = await Promise.allSettled([
                fetchAchievementWorkbenchDifficultyMetrics(ids, { client }),
                fetchAchievementWorkbenchTags(ids, { client }),
            ]);
            if (difficultyResult.status === "rejected" && client === this.currentClient) {
                console.warn("Failed to load leap display difficulty metrics:", difficultyResult.reason);
            }
            if (tagsResult.status === "rejected" && client === this.currentClient) {
                console.warn("Failed to load leap display tags:", tagsResult.reason);
            }
            const mapById = new Map(this.maps.map((map) => [String(map.id), map]));
            const enrichedRecords = applyAchievementWorkbenchEnrichment(records, {
                difficultyById: difficultyResult.status === "fulfilled" ? difficultyResult.value : {},
                tagsById: tagsResult.status === "fulfilled" ? tagsResult.value : {},
            });
            return enrichedRecords.map((item) => {
                const mapId = String(item.map?.id ?? "");
                const resolvedMap = mapId ? mapById.get(mapId) : null;
                return {
                    ...item,
                    map: {
                        ...(item.map || {}),
                        name: item.map?.name || resolvedMap?.name || null,
                    },
                };
            });
        },
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

            const requestId = ++this.pageRequestId;
            this.pageLoading = true;
            this.pageError = false;
            const client = this.currentClient;
            try {
                const [catalog, roles, maps, dimensionDefinitions] = await Promise.all([
                    fetchAchievementWorkbenchCatalog(client),
                    fetchAchievementWorkbenchRoles(),
                    fetchAchievementWorkbenchMaps(client).catch(() => []),
                    fetchAchievementWorkbenchDifficultyDimensions(),
                ]);
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                this.menus = catalog.menus;
                this.metadata = catalog.metadata;
                this.roles = roles;
                this.maps = maps;
                this.dimensions = resolveAchievementWorkbenchDimensions(dimensionDefinitions);
                this.recommendationDimensions = dimensionDefinitions;

                const queryRoleId = String(this.$route.query.jx3id || "");
                const lastRoleId = String(localStorage.getItem("wiki_last_sync") || "");
                this.currentRoleId =
                    roles.find((role) => role.id === queryRoleId)?.id ||
                    roles.find((role) => role.id === lastRoleId)?.id ||
                    roles[0]?.id ||
                    "";

                if (this.currentRoleId) await this.loadRoleState(this.currentRoleId, { resetForm: true });
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                await this.loadPlans();
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
            } catch (error) {
                if (requestId !== this.pageRequestId || client !== this.currentClient) return;
                console.error("Failed to initialize achievement leap page:", error);
                this.pageError = true;
            } finally {
                if (requestId === this.pageRequestId) this.pageLoading = false;
            }
        },
        async loadRoleState(roleId, { resetForm = false } = {}) {
            const requestId = ++this.roleRequestId;
            const client = this.currentClient;
            this.detailRequestId += 1;
            this.recommendationRequestId += 1;
            this.addSearchRequestId += 1;
            this.editorRequestId += 1;
            this.saveRequestId += 1;
            this.roleLoading = true;
            this.detailLoading = false;
            this.recommendationLoading = false;
            this.recommendation = null;
            this.recommendationOptions = defaultAchievementRecommendationOptions();
            this.recommendationError = "";
            this.addSearchLoading = false;
            this.saving = false;
            try {
                const state = await fetchAchievementWorkbenchRoleState(roleId);
                if (requestId !== this.roleRequestId || client !== this.currentClient) return false;
                this.generatedRoute = null;
                this.editingPlan = null;
                this.addSearchResults = [];
                this.saveDialogVisible = false;
                this.addDialogVisible = false;
                this.currentRoleId = roleId;
                this.roleState = state;
                localStorage.setItem("wiki_last_sync", roleId);
                const points = buildAchievementOverallProgress(this.metadata, state.completedIds).completedPoints || 0;
                if (resetForm) this.plannerForm = this.createDefaultForm(roleId, points);
                else this.plannerForm = { ...this.plannerForm, roleId };
                if (this.detailId) await this.loadPlanDetail(this.detailId);
                return (
                    requestId === this.roleRequestId &&
                    roleId === this.currentRoleId &&
                    client === this.currentClient
                );
            } catch (error) {
                if (requestId !== this.roleRequestId || client !== this.currentClient) return false;
                console.error("Failed to load leap role state:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.roleLoadFailed"));
                return false;
            } finally {
                if (requestId === this.roleRequestId && client === this.currentClient) this.roleLoading = false;
            }
        },
        async handleRoleChange(roleId) {
            if (!roleId || roleId === this.currentRoleId || this.roleLoading) {
                this.plannerForm = { ...this.plannerForm, roleId: this.currentRoleId };
                return;
            }
            const pageRequestId = this.pageRequestId;
            const client = this.currentClient;
            const loaded = await this.loadRoleState(roleId, { resetForm: true });
            if (
                !loaded ||
                pageRequestId !== this.pageRequestId ||
                client !== this.currentClient ||
                roleId !== this.currentRoleId
            ) {
                this.plannerForm = { ...this.plannerForm, roleId: this.currentRoleId };
                return;
            }
            this.$router.replace({
                name: "leap",
                query: { ...this.$route.query, jx3id: roleId },
            });
        },
        changeRecommendationOptions(options) {
            this.recommendationOptions = options;
            this.invalidateRecommendation();
        },
        invalidateRecommendation() {
            this.recommendationRequestId += 1;
            this.recommendation = null;
            this.recommendationError = "";
            this.recommendationLoading = false;
        },
        async loadRecommendation() {
            const requestId = ++this.recommendationRequestId;
            const client = this.currentClient;
            const roleId = this.currentRole?.roleId;
            this.recommendation = null;
            this.recommendationError = "";
            this.recommendationLoading = false;
            if (client !== "std" || !roleId || this.roleLoading) return;
            this.recommendationLoading = true;
            try {
                const result = await fetchAchievementWorkbenchRecommendation({
                    roleId, camp: "neutral",
                    preferences: achievementRecommendationPreferences(this.recommendationOptions, this.categoryOptions),
                });
                if (requestId !== this.recommendationRequestId || client !== this.currentClient) return;
                this.recommendation = result;
            } catch (error) {
                console.error("Failed to load achievement recommendation:", error);
                if (requestId === this.recommendationRequestId) {
                    this.recommendationError = this.$t("achievementRecommendation.requestFailed");
                }
            } finally {
                if (requestId === this.recommendationRequestId) this.recommendationLoading = false;
            }
        },
        async loadPlans() {
            const requestId = ++this.plansRequestId;
            const client = this.currentClient;
            this.plansLoading = true;
            try {
                const result = await fetchAchievementWorkbenchLeapPlans({
                    client,
                    page: this.plansPage,
                    per: this.plansPageSize,
                });
                if (requestId !== this.plansRequestId || client !== this.currentClient) return;
                this.plans = result.list;
                this.plansTotal = result.total;
            } catch (error) {
                if (requestId !== this.plansRequestId || client !== this.currentClient) return;
                console.error("Failed to load achievement leap plans:", error);
                this.plans = [];
                this.plansTotal = 0;
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.planListLoadFailed"));
            } finally {
                if (requestId === this.plansRequestId && client === this.currentClient) this.plansLoading = false;
            }
        },
        async changePlansPage(page) {
            this.plansPage = page;
            await this.loadPlans();
        },
        async createRecommendedPlan(selection) {
            const recommendation = selection?.recommendation;
            if (!selection?.ready || !selection.items.length || this.saving || this.roleLoading ||
                this.recommendationLoading || recommendation !== this.recommendation || this.currentClient !== "std") return;
            if (!String(this.plannerForm.title || "").trim()) {
                this.$message.warning(this.$t("pages.wiki.leap.ui.enterPlanNameWarning"));
                return;
            }
            const targetPoints = Number(this.plannerForm.targetPoints);
            const currentPoints = recommendation.role.current_points;
            if (!Number.isFinite(targetPoints) || targetPoints <= currentPoints) {
                this.$message.warning(this.$t("pages.wiki.leap.ui.workbench.targetMustExceedCurrent"));
                return;
            }
            const requestId = ++this.saveRequestId;
            const roleRequestId = this.roleRequestId;
            const roleId = this.currentRoleId;
            const client = this.currentClient;
            const recommendationRequestId = this.recommendationRequestId;
            const isCurrent = () => this.isCurrentSaveRequest(requestId, roleRequestId, roleId, client) &&
                recommendationRequestId === this.recommendationRequestId && recommendation === this.recommendation;
            const items = selectAchievementRecommendationItems(selection.items, currentPoints, targetPoints);
            if (!items.length) return;
            const payload = buildAchievementRecommendationPlan({ items, recommendation,
                title: this.plannerForm.title, targetPoints, roleId,
                preferences: achievementRecommendationPreferences(this.recommendationOptions, this.categoryOptions),
            });
            this.saving = true;
            let saved;
            try {
                saved = await saveAchievementWorkbenchLeapPlan(payload);
            } catch (error) {
                console.error("Failed to create recommended plan:", error);
                if (isCurrent()) this.$message.error(this.$t("pages.wiki.leap.ui.createFailed"));
                return;
            } finally {
                if (requestId === this.saveRequestId) this.saving = false;
            }
            if (!isCurrent()) return;
            this.recommendationDrawerVisible = false;
            this.$message.success(this.$t("pages.wiki.leap.ui.createSuccess"));
            await this.loadPlans();
            if (isCurrent() && saved.id) await this.openPlan(saved);
        },
        openSaveDialog() {
            if (!this.canSaveRoute) return;
            this.saveDialogVisible = true;
        },
        removeGeneratedRouteItem(item) {
            if (!this.generatedRoute || !item?.id) return;
            this.generatedRoute = removeAchievementLeapRouteItem(this.generatedRoute, item.id);
        },
        openAddDialog() {
            if (!this.generatedRoute) return;
            this.addSearchResults = [];
            this.addDialogVisible = true;
        },
        async searchAddRouteItems(keyword) {
            const requestId = ++this.addSearchRequestId;
            const client = this.currentClient;
            this.addSearchLoading = true;
            try {
                const records = await searchAchievementWorkbenchRecords({
                    keyword,
                    client,
                    metadata: this.metadata,
                    completedIds: this.roleState.completedIds,
                });
                const allowedIds = records.map((record) => record.id);
                const difficultyById = await fetchAchievementWorkbenchDifficulty(allowedIds, 500, { client }).catch(
                    () => ({})
                );
                if (requestId !== this.addSearchRequestId || client !== this.currentClient) return;
                const candidates = buildAchievementLeapCandidates({
                    metadata: this.metadata,
                    menus: this.menus,
                    completedIds: this.roleState.completedIds,
                    records,
                    difficultyById,
                    allowedIds,
                    schoolEligibility: this.schoolEligibility,
                });
                const enrichedItems = await this.enrichAchievementItems(candidates, client);
                if (requestId !== this.addSearchRequestId || client !== this.currentClient) return;
                this.addSearchResults = enrichedItems;
            } catch (error) {
                if (requestId !== this.addSearchRequestId || client !== this.currentClient) return;
                console.error("Failed to search achievement leap route items:", error);
                if (requestId === this.addSearchRequestId) this.addSearchResults = [];
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.addRouteItemsSearchFailed"));
            } finally {
                if (requestId === this.addSearchRequestId) this.addSearchLoading = false;
            }
        },
        addGeneratedRouteItem(item) {
            if (!this.generatedRoute || !item?.id) return;
            this.generatedRoute = addAchievementLeapRouteItem(this.generatedRoute, item);
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
                    generationMode: route.generationMode || "custom",
                    recommendationVersion: route.recommendationVersion || null,
                    recommendationStage: route.recommendationStage || null,
                    recommendationCamp: route.recommendationCamp || null,
                    recommendationPreferences: route.recommendationPreferences || null,
                    ...achievementRecommendationPlanMetadata(route.items),
                    schoolEligibilityVersion: route.schoolEligibilityVersion || this.schoolEligibility.version,
                    roleSchool: route.roleSchool || this.schoolEligibility.school,
                    selectedPoints: route.selectedPoints,
                },
                client: this.currentClient,
            };
        },
        async saveRoute(title) {
            if (!this.canSaveRoute || this.saving) return;
            const requestId = ++this.saveRequestId;
            const roleRequestId = this.roleRequestId;
            const roleId = this.currentRoleId;
            const client = this.currentClient;
            const editingPlanId = this.editingPlan?.id || null;
            const isEditing = Boolean(editingPlanId);
            const payload = this.buildPlanPayload(title);
            this.saving = true;
            try {
                const saved = await saveAchievementWorkbenchLeapPlan(payload, editingPlanId);
                if (!this.isCurrentSaveRequest(requestId, roleRequestId, roleId, client)) return;
                this.saveDialogVisible = false;
                this.$message.success(
                    isEditing
                        ? this.$t("pages.wiki.leap.ui.workbench.updateSuccess")
                        : this.$t("pages.wiki.leap.ui.createSuccess")
                );
                this.editingPlan = null;
                await this.loadPlans();
                if (!this.isCurrentSaveRequest(requestId, roleRequestId, roleId, client)) return;
                if (saved.id) await this.openPlan(saved);
            } catch (error) {
                if (!this.isCurrentSaveRequest(requestId, roleRequestId, roleId, client)) return;
                console.error("Failed to save achievement leap plan:", error);
                this.$message.error(
                    isEditing
                        ? this.$t("pages.wiki.leap.ui.workbench.updateFailed")
                        : this.$t("pages.wiki.leap.ui.createFailed")
                );
            } finally {
                if (this.isCurrentSaveRequest(requestId, roleRequestId, roleId, client)) this.saving = false;
            }
        },
        isCurrentSaveRequest(requestId, roleRequestId, roleId, client) {
            return (
                requestId === this.saveRequestId &&
                roleRequestId === this.roleRequestId &&
                roleId === this.currentRoleId &&
                client === this.currentClient
            );
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
            return this.$router.push({ name: "leap", query });
        },
        async loadPlanDetail(id) {
            if (!id || !Object.keys(this.metadata).length) return;
            const requestId = ++this.detailRequestId;
            const client = this.currentClient;
            this.detailLoading = true;
            this.detailPlan = null;
            this.detailRoute = null;
            this.detailClientMismatch = null;
            try {
                const plan = await fetchAchievementWorkbenchLeapPlan(id);
                if (requestId !== this.detailRequestId || client !== this.currentClient) return;
                this.detailPlan = plan;
                const mismatch = this.getPlanClientMismatch(plan);
                if (mismatch) {
                    this.detailClientMismatch = mismatch;
                    return;
                }
                const { items, difficultyById } = await this.hydratePlanItems(plan.schema, client);
                if (requestId !== this.detailRequestId || client !== this.currentClient) return;
                this.detailRoute = this.buildDetailRoute(plan, items, difficultyById);
            } catch (error) {
                if (requestId !== this.detailRequestId || client !== this.currentClient) return;
                console.error("Failed to load achievement leap plan detail:", error);
                this.detailPlan = null;
                this.detailRoute = null;
                this.detailClientMismatch = null;
                this.$message.error(this.$t("pages.wiki.leap.ui.workbench.planDetailLoadFailed"));
            } finally {
                if (requestId === this.detailRequestId) this.detailLoading = false;
            }
        },
        async hydratePlanItems(schema, client = this.currentClient) {
            const regularSchema = filterAchievementLeapIds(schema, this.metadata);
            const [records, difficultyById] = await Promise.all([
                fetchAchievementWorkbenchRecordsBatched({
                    ids: regularSchema,
                    metadata: this.metadata,
                    completedIds: this.roleState.completedIds,
                    client,
                    includeHidden: true,
                }),
                fetchAchievementWorkbenchDifficulty(regularSchema, 500, { client }).catch(() => ({})),
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
            const items = regularSchema
                .map((id) => candidateMap.get(String(id)))
                .filter(Boolean)
                .map((item) => ({ ...item, completed: completed.has(String(item.id)) }));
            return {
                items: await this.enrichAchievementItems(items, client),
                difficultyById,
            };
        },
        buildDetailRoute(plan, items) {
            const recommendationItems = new Map(flattenAchievementRecommendation({
                recommendations: plan.meta?.recommendationGroups || [],
                camp_restricted_ids: plan.meta?.campRestrictedIds || [],
            }).map((item) => [item.id, item]));
            items = items.map((item) => ({ ...item, ...recommendationItems.get(String(item.id)) }));
            const progress = buildAchievementLeapPlanProgress(plan, this.metadata, this.roleState.completedIds);
            const incomplete = items.filter((item) => !item.completed);
            const targetPoints = Number(plan.meta?.targetPoints) || this.currentPoints + progress.remainingPoints;
            const hasMinutes = incomplete.length > 0 && incomplete.every((item) => item.estimatedMinutes !== null);
            const hasDifficulty = incomplete.length > 0 && incomplete.every((item) => item.difficulty !== null);
            return {
                items,
                generationMode: plan.meta?.generationMode || "custom",
                recommendationVersion: plan.meta?.recommendationVersion || null,
                recommendationStage: plan.meta?.recommendationStage || null,
                recommendationCamp: plan.meta?.recommendationCamp || null,
                recommendationPreferences: plan.meta?.recommendationPreferences || null,
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
            if (this.warnPlanClientMismatch(plan)) return;
            const requestId = ++this.editorRequestId;
            const roleRequestId = this.roleRequestId;
            const roleId = this.currentRoleId;
            const client = this.currentClient;
            const source = plan.schema?.length ? plan : await fetchAchievementWorkbenchLeapPlan(plan.id);
            if (!this.isCurrentEditorRequest(requestId, roleRequestId, roleId, client)) return;
            if (this.warnPlanClientMismatch(source)) return;
            const { items } = await this.hydratePlanItems(source.schema, client);
            if (!this.isCurrentEditorRequest(requestId, roleRequestId, roleId, client)) return;
            const progress = buildAchievementLeapPlanProgress(source, this.metadata, this.roleState.completedIds);
            const targetPoints = Number(source.meta?.targetPoints) || this.currentPoints + progress.remainingPoints;
            this.plannerForm = {
                title: copy
                    ? this.$t("pages.wiki.leap.ui.workbench.copyTitle", { title: source.title })
                    : source.title,
                roleId,
                targetPoints,
                categoryIds: source.meta?.categoryIds || [],
                mapId: source.meta?.mapId || "",
                maxDifficulty: source.meta?.maxDifficulty ?? null,
                strategy: source.meta?.strategy || "big-first",
            };
            this.generatedRoute = this.buildDetailRoute(source, items);
            this.editingPlan = copy ? null : source;
            await this.closePlanDetail();
            await this.$nextTick();
            if (
                roleRequestId !== this.roleRequestId ||
                roleId !== this.currentRoleId ||
                client !== this.currentClient
            ) {
                return;
            }
            document.querySelector(".m-leap-generated-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
        },
        isCurrentEditorRequest(requestId, roleRequestId, roleId, client) {
            return (
                requestId === this.editorRequestId &&
                roleRequestId === this.roleRequestId &&
                roleId === this.currentRoleId &&
                client === this.currentClient
            );
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
                if (this.detailId === String(plan.id)) await this.closePlanDetail();
                await this.loadPlans();
            } catch (error) {
                console.error("Failed to delete achievement leap plan:", error);
                this.$message.error(this.$t("pages.wiki.leap.ui.deleteFailed"));
            }
        },
        requestPlanGuidance() {
            if (this.canConsultPlan) return this.$refs.consultations?.openCreate();
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
            <AchievementLeapDetailHeader
                :plan="detailPlan"
                :guidance-allowed="canConsultPlan"
                :actions-disabled="Boolean(detailClientMismatch)"
                @back="closePlanDetail"
                @request-guidance="requestPlanGuidance"
                @edit="editPlan"
                @copy="copyPlan"
                @delete="deletePlan"
            />

            <PvxEmptyState
                v-if="detailClientMismatch"
                :title="
                    $t('pages.wiki.leap.ui.workbench.planClientMismatchTitle', {
                        client: getClientLabel(detailClientMismatch.planClient),
                    })
                "
                :description="
                    $t('pages.wiki.leap.ui.workbench.planClientMismatchDescription', {
                        client: getClientLabel(detailClientMismatch.planClient),
                    })
                "
            >
                <template #icon><WarningFilled /></template>
            </PvxEmptyState>
            <AchievementLeapSummary
                v-else-if="detailRoute"
                :route="detailRoute"
            />
            <PlanConsultations v-if="canConsultPlan" :key="detailPlan.id" ref="consultations"
                :plan="detailPlan" :roles="roles" :default-role-id="currentRoleId" />
            <AchievementLeapRouteTable
                v-if="detailRoute"
                :items="detailRoute.items"
                :maps="maps"
                :dimensions="dimensions"
                :loading="detailLoading"
            />
            <PvxEmptyState
                v-else-if="!detailLoading && !detailClientMismatch"
                :title="$t('pages.wiki.leap.ui.workbench.planDetailLoadFailed')"
                :description="$t('pages.wiki.leap.ui.loadFailedDescription')"
            >
                <template #icon><FolderOpened /></template>
            </PvxEmptyState>
        </div>

        <div v-else class="m-leap-page-content">
            <AchievementLeapBaseSettings
                v-model="plannerForm"
                :roles="roles"
                :loading="roleLoading"
                @role-change="handleRoleChange"
            />

            <div class="m-leap-recommendation-entry">
                <el-button
                    type="primary" size="large"
                    :disabled="currentClient !== 'std' || roleLoading || saving || !currentRole?.roleId"
                    @click="recommendationDrawerVisible = true"
                ><template #icon><MagicStick /></template>{{ $t('achievementRecommendation.title') }}</el-button>
            </div>

            <section v-if="generatedRoute" class="m-leap-generated-result">
                <AchievementLeapSummary :route="generatedRoute" :title="plannerForm.title" />
                <div class="m-leap-generated-actions">
                    <p>{{ $t("pages.wiki.leap.ui.workbench.localGenerationNote") }}</p>
                    <button type="button" class="u-leap-add-button" @click="openAddDialog">
                        <Plus />
                        {{ $t("pages.wiki.leap.ui.workbench.addRouteItems") }}
                    </button>
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
                    :maps="maps"
                    :dimensions="dimensions"
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
                @page-change="changePlansPage"
            />
        </div>

        <AchievementLeapRecommendationDrawer
            v-model="recommendationDrawerVisible"
            v-model:target-points="plannerForm.targetPoints"
            v-model:plan-title="plannerForm.title"
            :options="recommendationOptions"
            :dimensions="recommendationDimensions"
            :categories="categoryOptions"
            :recommendation="recommendation"
            :loading="recommendationLoading"
            :saving="saving"
            :roles="roles"
            :role-id="currentRoleId"
            :role-loading="roleLoading"
            :client="currentClient"
            :role-available="Boolean(currentRole?.roleId)"
            :disabled="roleLoading || saving"
            :error="recommendationError"
            :metadata="metadata"
            :maps="maps"
            :menus="menus"
            @update:options="changeRecommendationOptions"
            @role-change="handleRoleChange"
            @apply="createRecommendedPlan"
            @refresh="loadRecommendation"
        />

        <AchievementLeapSaveDialog
            v-model="saveDialogVisible"
            :title="plannerForm.title"
            :editing="Boolean(editingPlan)"
            :saving="saving"
            :route-count="generatedRoute?.items?.length || 0"
            :route-points="generatedRoute?.selectedPoints || 0"
            @save="saveRoute"
        />

        <AchievementLeapAddDialog
            v-model="addDialogVisible"
            :results="addSearchResults"
            :dimensions="dimensions"
            :selected-ids="generatedRouteIds"
            :loading="addSearchLoading"
            @search="searchAddRouteItems"
            @add="addGeneratedRouteItem"
        />
    </div>
</template>

<style lang="less" scoped>
.m-leap-recommendation-entry {
    display: flex;
    justify-content: center;
    padding: 8px 0 16px;
    border-bottom: 1px solid #dce5df;
    :deep(.el-button) { border-color: #47777d; color: #fff; background: #47777d; border-radius: 6px; min-height: 46px; font-weight: 600; }
    :deep(.el-button.is-disabled) { opacity: 0.5; }
}
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
.u-leap-add-button,
.u-leap-discard-button {
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
.u-leap-add-button {
    color: #47777d;
    background: transparent;
}

.u-leap-add-button svg {
    width: 15px;
}

.u-leap-save-button:disabled {
    border-color: #adb8b8;
    background: #adb8b8;
    cursor: not-allowed;
}

@media (max-width: 720px) {
    .m-leap-generated-actions {
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
}
</style>
