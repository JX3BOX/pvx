<!-- 3D 实时试穿容器：独立 OffscreenCanvas 渲染 Worker、透明画布叠加可切换古风实景背景、前端并发请求原子主模型与配套/狐金发型，并持久化体型/画质/背景偏好。 -->
<template>
    <div ref="stageRef" class="m-ext-3d" :class="{ 'is-fullscreen': isFullscreen }">
        <div v-if="!loggedIn" class="m-ext-3d__gate">
            <div class="m-ext-3d__gate-card">
                <span class="u-gate-badge">3D 实时试穿</span>
                <h3>登录后即可 360° 试穿外观</h3>
                <p>支持自由俯仰旋转、右键平移视角、切换四体型与古风实景背景，自动适配画质</p>
                <el-button type="primary" round size="large" @click="login">
                    {{ $t("exterior.modelLogin") }}
                </el-button>
            </div>
        </div>

        <div v-else-if="verifyRequired" class="m-ext-3d__gate">
            <div class="m-ext-3d__gate-card">
                <span class="u-gate-badge">账号认证门槛</span>
                <h3>完成账号认证后开启 3D 实时试穿</h3>
                <p>为保障模型资源服务稳定，需先完成手机号验证或绑定微信公众号后使用实时 3D 预览</p>
                <div class="u-error-actions">
                    <el-button round @click="$emit('back-to-image')">切回高清图集</el-button>
                    <el-button type="primary" round @click="goVerifyAuth">前往账号认证</el-button>
                </div>
            </div>
        </div>

        <template v-else>
            <div class="m-ext-3d__viewport" :class="`is-bg-${stageBg}`">
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
                                    切回高清图集
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
                                        切回高清图集
                                    </el-button>
                                    <el-button size="small" type="primary" round @click="retry">
                                        {{ $t("exterior.retry") }}
                                    </el-button>
                                </div>
                            </div>
                        </div>
                    </template>
                </ExteriorViewerAsync>
            </div>

            <div class="m-ext-3d__bar">
                <div class="m-ext-3d__group">
                    <template v-if="isStandaloneOptional">
                        <button
                            type="button"
                            class="u-ctrl-pill"
                            :class="{ 'is-active': !wearOnBody }"
                            @click="setStandalone"
                        >
                            单品悬浮
                        </button>
                    </template>
                    <button
                        v-for="roleId in availableRoles"
                        :key="roleId"
                        type="button"
                        class="u-ctrl-pill"
                        :class="{ 'is-active': wearOnBody && activeRole === roleId }"
                        @click="selectRole(roleId)"
                    >
                        {{ bodyLabels[roleId] }}
                    </button>
                </div>

                <div class="m-ext-3d__group">
                    <button
                        v-for="opt in activeViewOptions"
                        :key="opt.value"
                        type="button"
                        class="u-ctrl-pill"
                        :class="{ 'is-active': effectiveView === opt.value }"
                        @click="selectCameraView(opt.value)"
                    >
                        {{ opt.label }}
                    </button>
                </div>

                <div class="m-ext-3d__group">
                    <button type="button" class="u-ctrl-pill" @click="playing = !playing">
                        {{ playing ? "暂停动画" : "播放动画" }}
                    </button>
                    <el-select
                        v-model="stageBg"
                        size="small"
                        class="u-bg-select"
                        aria-label="场景背景"
                        @change="onStageBgChange"
                    >
                        <el-option
                            v-for="bg in stageBackgrounds"
                            :key="bg.value"
                            :label="bg.label"
                            :value="bg.value"
                        />
                    </el-select>
                    <el-select
                        v-model="quality"
                        size="small"
                        class="u-quality-select"
                        aria-label="画质档位"
                        @change="onQualityChange"
                    >
                        <el-option label="画质：自动" value="auto" />
                        <el-option label="画质：高清" value="high" />
                        <el-option label="画质：均衡" value="medium" />
                        <el-option label="画质：省流" value="low" />
                    </el-select>
                    <button type="button" class="u-ctrl-pill" @click="toggleFullscreen">
                        {{ isFullscreen ? "退出全屏" : "全屏" }}
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import { defineAsyncComponent } from "vue";
import User from "@jx3box/jx3box-common/js/user";
import { UC_AUTH_URL, getExteriorModel, getUserVerifyStatus } from "@/service/exterior";
import { BODY_LABEL_MAP, CHARACTER_BOUND_DOMAINS, resolveExteriorModelPlan } from "./meta";

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
    { value: "pavilion", label: "场景：云台雅室" },
    { value: "mist", label: "场景：柔雾画境" },
    { value: "dark", label: "场景：深色暗棚" },
];

const PHASE_LABELS = {
    catalog: "正在读取模型目录",
    parts: "正在加载服饰部件",
    finalizing: "正在装配角色效果",
    ready: "装配完成",
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
    components: { ExteriorViewerAsync },
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
            errorMessage: "",
            viewerVersion: 0,
            canvasKey: 0,
            needsFreshCanvas: false,
            isFullscreen: false,
            isStageVisible: true,
            workerPreview: null,
            workerAbort: null,
            loadAbort: null,
            loadSeq: 0,
            visibilityObserver: null,
        };
    },
    computed: {
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
                    { value: "front", label: "正面" },
                    { value: "back", label: "背面" },
                ];
            }
            return [
                { value: "front", label: "正面" },
                { value: "back", label: "背面" },
                { value: "face", label: "近景" },
            ];
        },
        effectiveView() {
            if (!this.wearOnBody && this.cameraView === "face") return "front";
            return this.cameraView;
        },
        progressText() {
            if (!this.progress) return "正在后台启动 3D 试衣间…";
            const label = PHASE_LABELS[this.progress.phase] || "正在加载外观资源";
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
        document.removeEventListener("fullscreenchange", this.onFullscreenChange);
        document.removeEventListener("visibilitychange", this.syncContinuousRendering);
        this.visibilityObserver?.disconnect();
        this.visibilityObserver = null;
        this.loadAbort?.abort();
        this.disposeWorkerPreview();
    },
    methods: {
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
            if (!plan.targetKey) throw new Error("该外观尚无对应模型");
            const role = this.wearOnBody ? this.activeRole : null;
            // 并发发出两条轻量原子 /model 请求：主外观 + 配套/默认狐金发型（发型弱依赖，缺档不阻断主模型加载）。
            const primaryPromise = getExteriorModel(plan.targetKey, role, signal);
            const hairPromise =
                role && plan.hairKey && plan.hairKey !== plan.targetKey
                    ? getExteriorModel(plan.hairKey, role, signal).catch(() => null)
                    : Promise.resolve(null);
            const [primary, hair] = await Promise.all([primaryPromise, hairPromise]);
            if (!primary?.modelUrl) throw new Error("该外观尚无对应模型");
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
                    if (!canvas) throw new Error("3D 画布尚未就绪");
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
                            this.errorMessage = err?.message || String(err || "3D 渲染异常");
                            this.loading = false;
                        },
                    });
                    if (seq !== this.loadSeq || controller.signal.aborted) {
                        preview.dispose().catch(() => {});
                        return;
                    }
                    this.workerPreview = preview;
                }

                if (seq === this.loadSeq && !controller.signal.aborted) {
                    this.loading = false;
                    this.progress = null;
                    this.syncContinuousRendering();
                }
            } catch (error) {
                if (seq !== this.loadSeq || controller.signal.aborted) return;
                const code = error?.code || error?.response?.data?.code;
                const msg =
                    error?.data?.msg ||
                    error?.response?.data?.msg ||
                    error?.message ||
                    (typeof error === "string" ? error : "加载失败");
                if (code === 40301 || msg.includes("账号认证")) {
                    this.verifyChecked = true;
                    this.verifyRequired = true;
                    this.loading = false;
                    await this.disposeWorkerPreview();
                    return;
                }
                if (code === 42901) {
                    this.errorMessage = msg;
                    this.loading = false;
                    return;
                }
                // 若 Worker 内部异常中断，清理句柄以确保下次切换或重试能够重建全新渲染上下文。
                if (
                    error?.name === "AbortError" ||
                    msg.includes("Worker") ||
                    msg.includes("WebGL") ||
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
            if (active) this.progress = null;
        },
        onProgress(value) {
            this.progress = value;
        },
        onReady() {
            this.progress = null;
        },
        onError(cause) {
            console.warn("ExteriorViewer error:", cause);
        },
        errorTitle(message) {
            const text = String(message || "");
            if (text.includes("过于频繁") || text.includes("429")) {
                return "请求过于频繁，请稍后再试";
            }
            if (text.includes("尚无对应模型") || text.includes("404") || text.includes("暂无")) {
                return "该外观暂未收录 3D 模型";
            }
            if (text.includes("WebGL")) return "当前设备浏览器暂不支持 WebGL2 3D 预览";
            return "3D 试穿加载失败";
        },
        errorDetail(message) {
            const text = String(message || "");
            if (text.includes("过于频繁") || text.includes("429")) {
                return text || "已达到当前账号每分钟预览上限，令牌桶正在恢复中，请稍候点击重试。";
            }
            if (text.includes("尚无对应模型") || text.includes("404") || text.includes("暂无")) {
                return "这件外观的模型仍在陆续制作入库中，可以先浏览高清图集。";
            }
            return text || "网络波动或浏览器显存不足，可尝试切换为“省流”画质或稍后重试。";
        },
        onFullscreenChange() {
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
    min-height: 460px;
    background: #1b2430;
    overflow: hidden;

    &.is-fullscreen {
        min-height: 100vh;
    }

    @media (max-width: @phone) {
        min-height: 360px;
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
    min-height: 410px;
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

    @media (max-width: @phone) {
        min-height: 310px;
    }

    :deep(.jx3-exterior) {
        height: 100%;
        min-height: inherit;
        background: transparent !important;
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    padding: 10px 14px;
    background: rgba(15, 23, 42, 0.92);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.m-ext-3d__group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.u-ctrl-pill {
    padding: 5px 11px;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 500;
    line-height: 1.3;
    cursor: pointer;
    transition: all 0.16s;

    &:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #ffffff;
    }

    &.is-active {
        border-color: #818cf8;
        background: @pvx-primary;
        color: #ffffff;
    }
}

.u-bg-select,
.u-quality-select {
    width: 112px;

    :deep(.el-select__wrapper) {
        background: rgba(255, 255, 255, 0.1);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
        border-radius: @pvx-radius-pill;
    }

    :deep(.el-select__selected-item),
    :deep(.el-select__caret) {
        color: #e2e8f0;
        font-size: 12px;
    }
}

.u-bg-select {
    width: 128px;
}
</style>
