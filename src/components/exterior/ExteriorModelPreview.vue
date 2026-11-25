<!-- 3D 实时试穿容器：独立 OffscreenCanvas 渲染 Worker、透明画布叠加可切换古风实景背景、前端并发请求原子主模型与配套/狐金发型，并持久化体型/画质/背景偏好。 -->
<template>
    <div ref="stageRef" class="m-ext-3d" :class="{ 'is-fullscreen': isFullscreen }">
        <div v-if="!loggedIn" class="m-ext-3d__gate">
            <div class="m-ext-3d__gate-card">
                <span class="u-gate-badge">{{ $t('exteriorPreview.modelBadge') }}</span>
                <h3>{{ $t('exteriorPreview.loginTitle') }}</h3>
                <p>{{ $t('exteriorPreview.loginDesc') }}</p>
                <el-button type="primary" round size="large" @click="login">
                    {{ $t("exterior.modelLogin") }}
                </el-button>
            </div>
        </div>

        <div v-else-if="verifyRequired" class="m-ext-3d__gate">
            <div class="m-ext-3d__gate-card">
                <span class="u-gate-badge">{{ $t('exteriorPreview.verifyBadge') }}</span>
                <h3>{{ $t('exteriorPreview.verifyTitle') }}</h3>
                <p>{{ $t('exteriorPreview.verifyDesc') }}</p>
                <div class="u-error-actions">
                    <el-button round @click="$emit('back-to-image')">{{ $t('exteriorPreview.backGallery') }}</el-button>
                    <el-button type="primary" round @click="goVerifyAuth">{{ $t('exteriorPreview.verifyAction') }}</el-button>
                </div>
            </div>
        </div>

        <template v-else>
            <header class="m-ext-3d__bar">
                <div class="m-ext-3d__group" role="group" :aria-label="$t('exterior.bodyType')">
                    <template v-if="isStandaloneOptional">
                        <button
                            type="button"
                            class="u-ctrl-pill"
                            :class="{ 'is-active': !wearOnBody }"
                            :aria-pressed="!wearOnBody"
                            @click="setStandalone"
                        >
                            {{ $t('exteriorPreview.solo') }}
                        </button>
                    </template>
                    <button
                        v-for="roleId in availableRoles"
                        :key="roleId"
                        type="button"
                        class="u-ctrl-pill"
                        :class="{ 'is-active': wearOnBody && activeRole === roleId }"
                        :aria-pressed="wearOnBody && activeRole === roleId"
                        @click="selectRole(roleId)"
                    >
                        {{ localizedExteriorLabel($t, bodyLabels[roleId]) }}
                    </button>
                </div>

                <div class="m-ext-3d__group" role="group" :aria-label="$t('exteriorPreview.viewSwitch')">
                    <button
                        v-for="opt in activeViewOptions"
                        :key="opt.value"
                        type="button"
                        class="u-ctrl-pill"
                        :class="{ 'is-active': effectiveView === opt.value }"
                        :aria-pressed="effectiveView === opt.value"
                        @click="selectCameraView(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <div class="m-ext-3d__actions">
                    <button type="button" class="u-ctrl-pill u-ctrl-playback" @click="playing = !playing">
                        {{ playing ? $t('exteriorStudio.pause') : $t('exteriorStudio.play') }}
                    </button>
                    <el-popover
                        v-model:visible="stageMoreOpen"
                        trigger="click"
                        placement="bottom-end"
                        width="min(320px, calc(100vw - 32px))"
                        :show-arrow="false"
                        :append-to="popoverTarget"
                        popper-class="m-ext-3d-settings-popper"
                        @after-enter="focusStageMore"
                    >
                        <template #reference>
                            <span class="m-ext-3d__more-anchor">
                                <el-tooltip
                                    :content="$t('exteriorStudio.moreSettings')"
                                    :disabled="stageMoreOpen"
                                    :trigger-keys="[]"
                                    :append-to="popoverTarget"
                                >
                                    <button
                                        ref="stageMoreButtonRef"
                                        type="button"
                                        class="u-ctrl-pill u-ctrl-icon"
                                        :class="{ 'is-active': stageMoreOpen }"
                                        :aria-label="$t('exteriorStudio.moreSettings')"
                                        :aria-expanded="stageMoreOpen"
                                        @keydown.esc="closeStageMore"
                                    >
                                        <el-icon aria-hidden="true"><MoreFilled /></el-icon>
                                    </button>
                                </el-tooltip>
                            </span>
                        </template>
                        <div class="m-ext-3d__settings" @keydown.esc.capture="closeStageMore">
                            <div class="m-ext-3d__setting">
                                <label for="exterior-preview-scene">{{ $t('exteriorPreview.background') }}</label>
                                <el-select
                                    id="exterior-preview-scene"
                                    ref="stageBgSelectRef"
                                    v-model="stageBg"
                                    size="small"
                                    :aria-label="$t('exteriorPreview.background')"
                                    :teleported="false"
                                    @change="onStageBgChange"
                                >
                                    <el-option
                                        v-for="bg in stageBackgrounds"
                                        :key="bg.value"
                                        :label="$t(bg.label)"
                                        :value="bg.value"
                                    />
                                </el-select>
                            </div>
                            <div class="m-ext-3d__setting">
                                <label for="exterior-preview-quality">{{ $t('exteriorPreview.quality') }}</label>
                                <el-select
                                    id="exterior-preview-quality"
                                    v-model="quality"
                                    size="small"
                                    :aria-label="$t('exteriorPreview.quality')"
                                    :teleported="false"
                                    @change="onQualityChange"
                                >
                                    <el-option :label="$t('exteriorPreview.qualityAuto')" value="auto" />
                                    <el-option :label="$t('exteriorPreview.qualityHigh')" value="high" />
                                    <el-option :label="$t('exteriorPreview.qualityMedium')" value="medium" />
                                    <el-option :label="$t('exteriorPreview.qualityLow')" value="low" />
                                </el-select>
                            </div>
                        </div>
                    </el-popover>
                </div>
            </header>

            <div
                class="m-ext-3d__viewport"
                :class="[`is-bg-${stageBg}`, { 'is-model-ready': frameReady && !loading && !errorMessage }]"
            >
                <el-tooltip :content="fullscreenLabel" :trigger-keys="[]" :append-to="popoverTarget">
                    <button
                        type="button"
                        class="u-ctrl-pill u-ctrl-icon u-ctrl-fullscreen"
                        :class="{ 'is-active': isFullscreen }"
                        :aria-label="fullscreenLabel"
                        @click="toggleFullscreen"
                    >
                        <el-icon aria-hidden="true"><FullScreen /></el-icon>
                    </button>
                </el-tooltip>
                <template v-if="useWorker">
                    <canvas
                        :key="canvasKey"
                        ref="workerCanvas"
                        class="m-ext-3d__canvas"
                        :aria-label="item.name || item.key"
                    />
                    <div v-if="loading && !errorMessage" class="m-ext-3d__overlay">
                        <div class="m-ext-3d__loader">
                            <span class="u-spinner" aria-hidden="true" />
                            <span class="u-progress-text">{{ progressText }}</span>
                        </div>
                    </div>
                    <div v-if="errorMessage" class="m-ext-3d__overlay is-error">
                        <div class="m-ext-3d__error-card">
                            <h4>{{ errorTitle(errorMessage) }}</h4>
                            <p>{{ errorDetail(errorMessage) }}</p>
                            <div class="u-error-actions">
                                <el-button size="small" round @click="$emit('back-to-image')">
                                    {{ $t('exteriorPreview.backGallery') }}
                                </el-button>
                                <el-button size="small" type="primary" round @click="retry">
                                    {{ $t("exterior.retry") }}
                                </el-button>
                            </div>
                        </div>
                    </div>
                </template>

                <ExteriorViewerAsync
                    v-else-if="activeExteriorId"
                    ref="viewerRef"
                    :key="viewerKey"
                    :exterior-id="activeExteriorId"
                    :role-type="wearOnBody ? activeRole : undefined"
                    :resolve="resolveModel"
                    :quality="quality"
                    :view="effectiveView"
                    :playing="playing"
                    :transparent="true"
                    :background="null"
                    :canvas-label="item.name || item.key"
                    @loading="onLoading"
                    @progress="onProgress"
                    @ready="onReady"
                    @error="onError"
                >
                    <template #loading>
                        <div class="m-ext-3d__overlay">
                            <div class="m-ext-3d__loader">
                                <span class="u-spinner" aria-hidden="true" />
                                <span class="u-progress-text">{{ progressText }}</span>
                            </div>
                        </div>
                    </template>
                    <template #error="{ error }">
                        <div class="m-ext-3d__overlay is-error">
                            <div class="m-ext-3d__error-card">
                                <h4>{{ errorTitle(error) }}</h4>
                                <p>{{ errorDetail(error) }}</p>
                                <div class="u-error-actions">
                                    <el-button size="small" round @click="$emit('back-to-image')">
                                        {{ $t('exteriorPreview.backGallery') }}
                                    </el-button>
                                    <el-button size="small" type="primary" round @click="retry">
                                        {{ $t("exterior.retry") }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </template>
                </ExteriorViewerAsync>
                <ExteriorStageHint overlay>{{ $t("exterior.cameraHelp") }}</ExteriorStageHint>
            </div>
        </template>
    </div>
</template>

<script>
import { FullScreen, MoreFilled } from "@element-plus/icons-vue";
import { defineAsyncComponent } from "vue";
import User from "@jx3box/jx3box-common/js/user";
import { UC_AUTH_URL, getExteriorModel, getUserVerifyStatus } from "@/service/exterior";
import ExteriorStageHint from "./ExteriorStageHint.vue";
import { localizedExteriorLabel, BODY_LABEL_MAP, CHARACTER_BOUND_DOMAINS, resolveExteriorModelPlan } from "./meta";

const ExteriorViewerAsync = defineAsyncComponent(async () => {
    await import("@jx3box/jx3box-exterior/vue/style.css");
    const mod = await import("@jx3box/jx3box-exterior/vue");
    return mod.ExteriorViewer;
});

let workerModulePromise = null;
function loadWorkerModule() {
    if (!workerModulePromise) {
        workerModulePromise = import("@jx3box/jx3box-exterior/worker");
    }
    return workerModulePromise;
}

const SUPPORTS_OFFSCREEN_WORKER =
    typeof window !== "undefined" &&
    typeof Worker !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    typeof HTMLCanvasElement.prototype.transferControlToOffscreen === "function";

const ALL_ROLES = [1, 2, 5, 6];
const STANDALONE_DOMAINS = new Set(["pendant", "weapon", "effect"]);
const STAGE_BACKGROUNDS = [
    { value: "pavilion", label: "exteriorPreview.pavilion" },
    { value: "mist", label: "exteriorPreview.mist" },
    { value: "dark", label: "exteriorPreview.dark" },
];

const PHASE_LABELS = {
    catalog: "exteriorPreview.catalog",
    parts: "exteriorPreview.parts",
    finalizing: "exteriorPreview.finalizing",
    ready: "exteriorPreview.ready",
};

function computeSelectionState(item, targetDomain, initialRole, storeRole) {
    const domain = targetDomain || item.domain;
    const isBound = CHARACTER_BOUND_DOMAINS.has(domain);
    const itemRoles = Array.isArray(item.roles)
        ? item.roles.map(Number).filter((id) => ALL_ROLES.includes(id))
        : [];
    const availableRoles = isBound && itemRoles.length ? itemRoles : ALL_ROLES;
    const preferred = initialRole || storeRole || 2;
    const activeRole = availableRoles.includes(preferred) ? preferred : availableRoles[0];
    const isStandaloneOptional = STANDALONE_DOMAINS.has(domain);
    return {
        availableRoles,
        activeRole,
        isStandaloneOptional,
        wearOnBody: !isStandaloneOptional,
    };
}

export default {
    name: "ExteriorModelPreview",
    components: { ExteriorStageHint, ExteriorViewerAsync, FullScreen, MoreFilled },
    props: {
        item: { type: Object, required: true },
        initialRole: { type: Number, default: null },
        graphNodes: { type: Array, default: () => [] },
        graphEdges: { type: Array, default: () => [] },
    },
    emits: ["back-to-image", "role-change"],
    data() {
        const plan = resolveExteriorModelPlan(this.item, this.graphNodes, this.graphEdges);
        const state = computeSelectionState(
            this.item,
            plan.targetDomain,
            this.initialRole,
            this.$store.state.preferredRole
        );
        return {
            bodyLabels: BODY_LABEL_MAP,
            stageBackgrounds: STAGE_BACKGROUNDS,
            loggedIn: User.isLogin(),
            verifyChecked: false,
            verifyRequired: false,
            useWorker: SUPPORTS_OFFSCREEN_WORKER,
            ...state,
            cameraView: "front",
            playing: true,
            quality: this.$store.state.preferredQuality || "auto",
            stageBg: this.$store.state.preferredStageBg || "pavilion",
            progress: null,
            loading: false,
            frameReady: false,
            errorMessage: "",
            viewerVersion: 0,
            canvasKey: 0,
            needsFreshCanvas: false,
            isFullscreen: false,
            stageMoreOpen: false,
            isStageVisible: true,
            workerPreview: null,
            workerAbort: null,
            loadAbort: null,
            loadSeq: 0,
            visibilityObserver: null,
        };
    },
    computed: {
        popoverTarget() {
            return this.isFullscreen ? this.$refs.stageRef : "body";
        },
        fullscreenLabel() {
            return this.$t(this.isFullscreen ? "exteriorPreview.exitFullscreen" : "exteriorPreview.fullscreen");
        },
        modelPlan() {
            return resolveExteriorModelPlan(this.item, this.graphNodes, this.graphEdges);
        },
        modelPlanSignature() {
            const { targetKey, targetDomain, hairKey } = this.modelPlan;
            return `${targetKey}|${targetDomain}|${hairKey || ""}`;
        },
        activeExteriorId() {
            return `${this.modelPlanSignature}:${this.wearOnBody ? this.activeRole : "solo"}`;
        },
        viewerKey() {
            return `${this.quality}:${this.viewerVersion}`;
        },
        activeViewOptions() {
            if (!this.wearOnBody) {
                return [
                    { value: "front", label: this.$t('exteriorPreview.front') },
                    { value: "back", label: this.$t('exteriorPreview.back') },
                ];
            }
            return [
                { value: "front", label: this.$t('exteriorPreview.front') },
                { value: "back", label: this.$t('exteriorPreview.back') },
                { value: "face", label: this.$t('exteriorPreview.face') },
            ];
        },
        effectiveView() {
            if (!this.wearOnBody && this.cameraView === "face") return "front";
            return this.cameraView;
        },
        progressText() {
            if (!this.progress) return this.$t('exteriorPreview.starting');
            const label = this.$t(PHASE_LABELS[this.progress.phase] || "exteriorPreview.loadingAssets");
            if (this.progress.total) {
                const pct = Math.min(100, Math.round((this.progress.completed / this.progress.total) * 100));
                return `${label} (${pct}%)`;
            }
            return `${label}…`;
        },
    },
    watch: {
        "item.key"() {
            const state = computeSelectionState(
                this.item,
                this.modelPlan.targetDomain,
                this.initialRole,
                this.$store.state.preferredRole
            );
            this.availableRoles = state.availableRoles;
            this.activeRole = state.activeRole;
            this.isStandaloneOptional = state.isStandaloneOptional;
            this.wearOnBody = state.wearOnBody;
            this.cameraView = "front";
            if (this.useWorker && this.loggedIn) {
                this.loadWorkerModel();
            }
        },
        // 图谱加载完成后若解析出礼盒拆解主外观或更准确的配套黑发，自动热切换到最终组合。
        modelPlanSignature(next, prev) {
            if (!next || next === prev) return;
            const isStandaloneOptional = STANDALONE_DOMAINS.has(this.modelPlan.targetDomain);
            if (isStandaloneOptional !== this.isStandaloneOptional) {
                this.isStandaloneOptional = isStandaloneOptional;
                if (!isStandaloneOptional) this.wearOnBody = true;
            }
            if (this.useWorker && this.loggedIn) {
                this.loadWorkerModel();
            }
        },
        effectiveView(val) {
            this.workerPreview?.setView(val);
        },
        playing(val) {
            this.workerPreview?.setPlaying(val);
        },
    },
    mounted() {
        document.addEventListener("fullscreenchange", this.onFullscreenChange);
        document.addEventListener("visibilitychange", this.syncContinuousRendering);
        if (typeof IntersectionObserver !== "undefined" && this.$refs.stageRef) {
            this.visibilityObserver = new IntersectionObserver(
                (entries) => {
                    this.isStageVisible = entries.some((entry) => entry.isIntersecting);
                    this.syncContinuousRendering();
                },
                { threshold: 0.05 }
            );
            this.visibilityObserver.observe(this.$refs.stageRef);
        }
        if (this.loggedIn) {
            this.ensureVerifiedAndLoad();
        }
    },
    beforeUnmount() {
        this.loadSeq++;
        document.removeEventListener("fullscreenchange", this.onFullscreenChange);
        document.removeEventListener("visibilitychange", this.syncContinuousRendering);
        this.visibilityObserver?.disconnect();
        this.visibilityObserver = null;
        this.loadAbort?.abort();
        this.disposeWorkerPreview();
    },
    methods: {
        localizedExteriorLabel,
        login() {
            User.toLogin();
        },
        goVerifyAuth() {
            window.open(UC_AUTH_URL, "_blank", "noopener");
        },
        async ensureVerifiedAndLoad() {
            const status = await getUserVerifyStatus();
            this.verifyChecked = true;
            if (!status?.verified) {
                this.verifyRequired = true;
                return;
            }
            this.verifyRequired = false;
            if (this.useWorker) {
                this.loadWorkerModel();
            }
        },
        async resolveCompositeModel(signal) {
            const plan = this.modelPlan;
            if (!plan.targetKey) throw new Error("MODEL_NOT_FOUND");
            const role = this.wearOnBody ? this.activeRole : null;
            // 并发发出两条轻量原子 /model 请求：主外观 + 配套/默认狐金发型（发型弱依赖，缺档不阻断主模型加载）。
            const primaryPromise = getExteriorModel(plan.targetKey, role, signal);
            const hairPromise =
                role && plan.hairKey && plan.hairKey !== plan.targetKey
                    ? getExteriorModel(plan.hairKey, role, signal).catch(() => null)
                    : Promise.resolve(null);
            const [primary, hair] = await Promise.all([primaryPromise, hairPromise]);
            if (!primary?.modelUrl) throw new Error("MODEL_NOT_FOUND");
            const attachments = [];
            if (hair?.modelUrl && hair.modelUrl !== primary.modelUrl) {
                attachments.push(hair.modelUrl);
            }
            return {
                modelUrl: primary.modelUrl,
                baseUrl: primary.baseUrl,
                attachments,
                isolated: primary.isolated,
            };
        },
        async resolveModel(_selection, { signal }) {
            return await this.resolveCompositeModel(signal);
        },
        selectCameraView(view) {
            this.cameraView = view;
            // 即使重复点击当前视角按钮也重新归位镜头与平移偏移，方便玩家随时一键回正。
            this.workerPreview?.setView(this.effectiveView);
        },
        setStandalone() {
            if (!this.wearOnBody) return;
            this.wearOnBody = false;
            if (this.useWorker && this.loggedIn) this.loadWorkerModel();
        },
        selectRole(roleId) {
            const changed = !this.wearOnBody || this.activeRole !== roleId;
            this.wearOnBody = true;
            this.activeRole = roleId;
            this.$emit("role-change", roleId);
            if (changed && this.useWorker && this.loggedIn) this.loadWorkerModel();
        },
        onStageBgChange(val) {
            this.$store.commit("setPreferredStageBg", val);
            this.workerPreview?.setBackground(null);
        },
        onQualityChange(val) {
            this.$store.commit("setPreferredQuality", val);
            if (this.useWorker && this.loggedIn) {
                this.loadWorkerModel({ recreate: true });
            } else {
                this.viewerVersion++;
            }
        },
        retry() {
            this.progress = null;
            this.errorMessage = "";
            if (this.useWorker && this.loggedIn) {
                this.loadWorkerModel({ recreate: !this.workerPreview || this.needsFreshCanvas });
            } else {
                this.viewerVersion++;
            }
        },
        syncContinuousRendering() {
            if (!this.workerPreview) return;
            this.workerPreview.setContinuousRendering(this.isStageVisible && !document.hidden);
        },
        async disposeWorkerPreview() {
            const preview = this.workerPreview;
            this.workerPreview = null;
            this.workerAbort?.abort();
            this.workerAbort = null;
            if (preview) {
                try {
                    await preview.dispose();
                } catch {
                    // 忽略 Worker 已提前终止时的释放异常
                }
                this.needsFreshCanvas = true;
            }
        },
        async loadWorkerModel({ recreate = false } = {}) {
            if (this.verifyRequired) return;
            const seq = ++this.loadSeq;
            this.loadAbort?.abort();
            const controller = (this.loadAbort = new AbortController());
            this.loading = true;
            this.frameReady = false;
            this.progress = null;
            this.errorMessage = "";

            if (recreate) {
                await this.disposeWorkerPreview();
            }

            try {
                const resolved = await this.resolveCompositeModel(controller.signal);
                if (seq !== this.loadSeq || controller.signal.aborted) return;

                const onProgress = (value) => {
                    if (seq === this.loadSeq && !controller.signal.aborted) {
                        this.progress = value;
                    }
                };

                if (this.workerPreview) {
                    await this.workerPreview.load(resolved.modelUrl, {
                        baseUrl: resolved.baseUrl,
                        attachments: resolved.attachments,
                        isolated: resolved.isolated,
                        view: this.effectiveView,
                        playing: this.playing,
                        onProgress,
                    });
                } else {
                    if (this.needsFreshCanvas) {
                        this.canvasKey++;
                        this.needsFreshCanvas = false;
                    }
                    await this.$nextTick();
                    if (seq !== this.loadSeq || controller.signal.aborted) return;
                    const canvas = this.$refs.workerCanvas;
                    if (!canvas) throw new Error("CANVAS_NOT_READY");
                    const { createWorkerPreview } = await loadWorkerModule();
                    if (seq !== this.loadSeq || controller.signal.aborted) return;
                    // 使用独立的 workerAbort 控制 Worker 生命周期，避免下次切换体型中断请求时误杀正在复用的渲染 Worker。
                    this.workerAbort?.abort();
                    const workerAbort = (this.workerAbort = new AbortController());
                    // 画布转移给 OffscreenCanvas 后不可复用，标记下次重建必须挂载新 canvas。
                    this.needsFreshCanvas = true;
                    const preview = await createWorkerPreview(canvas, {
                        modelUrl: resolved.modelUrl,
                        baseUrl: resolved.baseUrl,
                        attachments: resolved.attachments,
                        isolated: resolved.isolated,
                        quality: this.quality,
                        view: this.effectiveView,
                        playing: this.playing,
                        transparent: true,
                        background: null,
                        signal: workerAbort.signal,
                        onProgress,
                        onError: (err) => {
                            if (this.workerPreview !== preview) return;
                            this.workerPreview = null;
                            this.errorMessage = err?.message || String(err || "RENDER_ERROR");
                            this.loading = false;
                        },
                    });
                    if (seq !== this.loadSeq || controller.signal.aborted) {
                        preview.dispose().catch(() => {});
                        return;
                    }
                    this.workerPreview = preview;
                }

                if (seq !== this.loadSeq || controller.signal.aborted) return;
                this.syncContinuousRendering();
                this.onReady();
                this.loading = false;
            } catch (error) {
                if (seq !== this.loadSeq || controller.signal.aborted) return;
                const code = error?.code || error?.response?.data?.code;
                const msg =
                    error?.data?.msg ||
                    error?.response?.data?.msg ||
                    error?.message ||
                    (typeof error === "string" ? error : "MODEL_LOAD_FAILED");
                if (code === 40301 || msg.includes("账号认证")) {
                    this.verifyChecked = true;
                    this.verifyRequired = true;
                    this.loading = false;
                    await this.disposeWorkerPreview();
                    return;
                }
                if (code === 42901) {
                    this.errorMessage = "429";
                    this.loading = false;
                    return;
                }
                // 若 Worker 内部异常中断，清理句柄以确保下次切换或重试能够重建全新渲染上下文。
                if (
                    error?.name === "AbortError" ||
                    msg.includes("Worker") ||
                    msg.includes("WebGL") ||
                    msg === "CANVAS_NOT_READY" ||
                    msg.includes("画布") ||
                    msg.includes("预览已关闭")
                ) {
                    await this.disposeWorkerPreview();
                }
                console.warn("ExteriorWorkerPreview error:", error);
                this.errorMessage = msg;
                this.loading = false;
            }
        },
        onLoading(active) {
            this.loading = active;
            if (active) {
                this.frameReady = false;
                this.progress = null;
            }
        },
        onProgress(value) {
            this.progress = value;
        },
        onReady() {
            this.progress = null;
            this.frameReady = true;
        },
        onError(cause) {
            this.frameReady = false;
            console.warn("ExteriorViewer error:", cause);
        },
        modelErrorKind(message) {
            const text = String(message || "");
            if (text.includes("过于频繁") || text.includes("429")) return "rate";
            if (/MODEL_NOT_FOUND|尚无对应模型|404|暂无/.test(text)) return "missing";
            if (text.includes("WebGL")) return "webgl";
            return "failed";
        },
        errorTitle(message) {
            return this.$t(`exteriorPreview.${this.modelErrorKind(message)}Title`);
        },
        errorDetail(message) {
            return this.$t(`exteriorPreview.${this.modelErrorKind(message)}Detail`);
        },
        focusStageMore() {
            if (this.stageMoreOpen) this.$refs.stageBgSelectRef?.focus();
        },
        closeStageMore(event) {
            if (!this.stageMoreOpen || event.target.matches('[role="combobox"][aria-expanded="true"]')) return;
            event.preventDefault();
            event.stopPropagation();
            this.stageMoreOpen = false;
            this.$refs.stageMoreButtonRef?.focus({ preventScroll: true });
        },
        onFullscreenChange() {
            this.stageMoreOpen = false;
            this.isFullscreen = document.fullscreenElement === this.$refs.stageRef;
        },
        async toggleFullscreen() {
            const el = this.$refs.stageRef;
            if (!el) return;
            try {
                if (document.fullscreenElement === el) {
                    await document.exitFullscreen();
                } else {
                    await el.requestFullscreen();
                }
            } catch {
                // 忽略不支持全屏的移动端浏览器
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-3d {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 0;
    background: #1b2430;
    overflow: hidden;

    &.is-fullscreen {
        min-height: 100vh;
    }

    @media (max-width: @phone) {
        &:not(.is-fullscreen) {
            height: auto;
            gap: @pvx-space-1;
            overflow: visible;
            background: transparent;

            .m-ext-3d__viewport,
            .m-ext-3d__gate {
                flex: none;
                height: var(--exterior-stage-height);
                overflow: hidden;
                border: 1px solid @pvx-border;
                border-radius: 18px;
            }

            .m-ext-3d__bar {
                position: static;

                .m-ext-3d__group {
                    gap: inherit;
                    padding: 0;
                    background: transparent;
                }

                .u-ctrl-pill {
                    height: 32px;
                    border: 1px solid @pvx-border-focus;
                    border-radius: @pvx-radius-small;
                    background: @pvx-primary-soft;
                    color: @pvx-primary;
                    box-shadow: none;

                    &:hover,
                    &:focus-visible,
                    &.is-active {
                        border-color: @pvx-primary;
                        background: @pvx-primary;
                        color: @pvx-text-inverse;
                    }
                }
            }
        }
    }
}

.m-ext-3d__gate {
    display: grid;
    place-items: center;
    flex: 1;
    padding: 28px 20px;
    background: url("~@/assets/img/exterior/stage-bg.webp") center / cover no-repeat,
        linear-gradient(180deg, #e7ecf6 0%, #d8e0ef 100%);
}

.m-ext-3d__gate-card {
    max-width: 380px;
    padding: 28px 26px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    box-shadow: 0 18px 42px rgba(15, 23, 42, 0.12);
    text-align: center;

    .u-gate-badge {
        display: inline-block;
        padding: 3px 10px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-size: 12px;
        font-weight: 700;
        margin-bottom: 10px;
    }

    h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 700;
        color: @pvx-text-primary;
    }

    p {
        margin: 0 0 18px;
        font-size: 13px;
        line-height: 1.6;
        color: @pvx-text-secondary;
    }
}

.m-ext-3d__viewport {
    position: relative;
    flex: 1;
    min-height: 0;
    transition: background 0.25s ease;

    &.is-bg-pavilion {
        background: url("~@/assets/img/exterior/stage-3d-bg.webp") center 68% / cover no-repeat,
            linear-gradient(180deg, #dde7ea 0%, #c8d6dc 100%);
    }

    &.is-bg-mist {
        background: url("~@/assets/img/exterior/stage-bg.webp") center / cover no-repeat,
            linear-gradient(180deg, #e7ecf6 0%, #d8e0ef 100%);
    }

    &.is-bg-dark {
        background: radial-gradient(circle at 50% 34%, #273449 0%, #141c2b 65%, #0f1623 100%);
    }

    :deep(.jx3-exterior) {
        height: 100%;
        min-height: inherit;
        background: transparent !important;
    }

    .m-ext-3d__canvas,
    :deep(.jx3-exterior canvas) {
        opacity: 0;
    }

    &.is-model-ready {
        .m-ext-3d__canvas,
        :deep(.jx3-exterior canvas) {
            opacity: 1;

            @media (prefers-reduced-motion: no-preference) {
                transition: opacity 120ms ease-out;
            }
        }
    }
}

.m-ext-3d__canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    display: block;
    touch-action: none;
    cursor: grab;

    &:active {
        cursor: grabbing;
    }
}

.m-ext-3d__overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    padding: 20px;
    background: rgba(15, 23, 42, 0.42);
    backdrop-filter: blur(4px);

    &.is-error {
        background: rgba(15, 23, 42, 0.65);
    }
}

.m-ext-3d__loader {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.82);
    color: #f8fafc;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.28);

    .u-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: ext-spin 0.8s linear infinite;
    }
}

@keyframes ext-spin {
    to {
        transform: rotate(360deg);
    }
}

.m-ext-3d__error-card {
    max-width: 360px;
    padding: 22px 24px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.96);
    text-align: center;
    box-shadow: 0 14px 36px rgba(0, 0, 0, 0.25);

    h4 {
        margin: 0 0 6px;
        font-size: 15px;
        font-weight: 700;
        color: @pvx-text-primary;
    }

    p {
        margin: 0 0 14px;
        font-size: 13px;
        line-height: 1.55;
        color: @pvx-text-secondary;
    }

    .u-error-actions {
        display: flex;
        justify-content: center;
        gap: 8px;
    }
}

.m-ext-3d__bar {
    position: absolute;
    inset: 12px 50px auto 12px;
    z-index: 5;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    pointer-events: none;

    > * {
        pointer-events: auto;
    }

    @media (max-width: @phone) {
        inset: 8px 44px auto 8px;
        gap: 4px;
    }
}

.m-ext-3d__group {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    max-width: 100%;
    gap: 3px;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.78);
}

.u-ctrl-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 11px;
    border: 0;
    border-radius: @pvx-radius-pill;
    background: transparent;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    cursor: pointer;
    transition: background-color 0.14s, color 0.14s;

    &:hover,
    &:focus-visible {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
    }

    &.is-active {
        background: @pvx-primary;
        color: #ffffff;
    }
}

.m-ext-3d__actions {
    display: flex;
    align-items: center;
    gap: inherit;
}

.u-ctrl-fullscreen {
    position: absolute;
    top: 12px;
    right: 12px;
    z-index: 5;

    @media (max-width: @phone) {
        top: 8px;
        right: 8px;
    }
}

.m-ext-3d__more-anchor {
    display: inline-flex;
}

.u-ctrl-playback,
.u-ctrl-icon {
    height: 32px;
    background: rgba(15, 23, 42, 0.78);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16) inset;

    &:hover,
    &:focus-visible {
        background: rgba(30, 41, 59, 0.85);
    }
}

.u-ctrl-icon {
    width: 32px;
    padding: 0;
    font-size: 16px;

    &.is-active {
        background: @pvx-primary;
    }
}

@media (max-width: @phone) {
    .m-ext-3d__group .u-ctrl-pill {
        padding-inline: 8px;
    }
}

:global(.el-popper.m-ext-3d-settings-popper) {
    padding: 12px;
    border-radius: @pvx-radius-control;
    box-shadow: @pvx-shadow-hover;
}

.m-ext-3d__settings {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
    gap: @pvx-space-1;

    :deep(.el-select__wrapper) {
        min-height: 32px;
        border-radius: @pvx-radius-pill;
    }
}

.m-ext-3d__setting {
    display: grid;
    gap: @pvx-space-1;
    min-width: 0;

    label {
        color: @pvx-text-secondary;
        font-size: 12px;
        font-weight: 600;
    }
}
</style>
