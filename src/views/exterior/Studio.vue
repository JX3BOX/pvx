<!-- 自由试衣间：仿剑网三商城的三栏交互结构（左侧多级分类导航、中间商品/体型/捏脸抽屉、右侧 65%+ 全高 3D 试穿舞台），支持礼盒一键穿戴、多槽位自动替换与遮挡、写意/写实双体系捏脸、体型参数微调、高清 PNG 拍照与分享链接。 -->
<template>
    <div class="m-ext-studio" :class="{ 'is-fullscreen': isFullscreen }">
        <div ref="stageContainerRef" class="m-studio-shell">
            <!-- 左侧分类栏 -->
            <aside class="m-studio-nav" aria-label="试衣间外观分类">
                <router-link :to="{ name: 'exterior-list' }" class="u-nav-back" title="返回外观大全">
                    <el-icon><ArrowLeft /></el-icon>
                    <span>外观大全</span>
                </router-link>

                <nav class="m-nav-list">
                    <button
                        v-for="item in menuItems"
                        :key="item.id"
                        type="button"
                        class="u-nav-btn"
                        :class="{ 'is-active': activeMenuId === item.id }"
                        @click="selectMenu(item.id)"
                    >
                        <el-icon class="u-nav-icon"><component :is="item.icon" /></el-icon>
                        <span>{{ item.label }}</span>
                    </button>
                </nav>
            </aside>

            <!-- 中间商品格 / 体型 / 捏脸编辑抽屉 -->
            <section class="m-studio-drawer" aria-label="外观挑选与定制区">
                <StudioBodyEditor
                    v-if="activeMenu.editor === 'body'"
                    ref="bodyEditorRef"
                    :preview="preview"
                    :role="activeRole"
                    :ready="stageReady"
                />
                <StudioFaceEditor
                    v-else-if="activeMenu.editor === 'face'"
                    ref="faceEditorRef"
                    :preview="preview"
                    :role="activeRole"
                    :ready="stageReady"
                    :face-style="faceStyle"
                    :switching-face-style="stageLoading"
                    @switch-face-style="onSwitchFaceStyle"
                    @apply-face-profile="onApplyFaceProfile"
                    @focus-face="selectCameraView('face')"
                />
                <StudioCatalogGrid
                    v-else
                    :menu-item="activeMenu"
                    :role="activeRole"
                    :worn-keys="wornKeySet"
                    :busy-key="busyKey"
                    @select="onToggleCatalogItem"
                />
            </section>

            <!-- 右侧 3D 实时试穿舞台（占 65%+ 宽度） -->
            <main class="m-studio-stage" :class="`is-bg-${skybox}`" aria-label="3D 试衣舞台">
                <!-- 登录门禁 -->
                <div v-if="!loggedIn" class="m-stage-gate">
                    <div class="m-gate-card">
                        <span class="u-gate-pill">自由试衣间</span>
                        <h2>登录后解锁全套 3D 自由穿搭</h2>
                        <p>任意混搭全库外观、实时捏脸改体型，一键导出高清 PNG 试穿图</p>
                        <el-button type="primary" round size="large" @click="login">
                            {{ $t("exterior.modelLogin") }}
                        </el-button>
                    </div>
                </div>

                <template v-else>
                    <canvas ref="canvasRef" class="m-stage-canvas" aria-label="自由试衣间 3D 画布" />

                    <!-- 顶部悬浮控制条 -->
                    <header class="m-stage-topbar">
                        <div class="m-topbar-group">
                            <div class="m-role-pills" role="group" aria-label="体型切换">
                                <button
                                    v-for="b in bodyTypes"
                                    :key="b.id"
                                    type="button"
                                    class="u-pill-btn"
                                    :class="{ 'is-active': activeRole === b.id }"
                                    :disabled="stageLoading"
                                    @click="selectRole(b.id)"
                                >
                                    {{ b.label }}
                                </button>
                            </div>

                            <div class="m-view-pills" role="group" aria-label="视角预设">
                                <button
                                    v-for="v in viewPresets"
                                    :key="v.value"
                                    type="button"
                                    class="u-pill-btn"
                                    :class="{ 'is-active': activeView === v.value }"
                                    @click="selectCameraView(v.value)"
                                >
                                    {{ v.label }}
                                </button>
                            </div>
                        </div>

                        <div class="m-topbar-group">
                            <button
                                v-if="hasWeaponEquipped"
                                type="button"
                                class="u-pill-btn"
                                :class="{ 'is-active': !weaponSheathed }"
                                @click="toggleWeaponSheathed"
                            >
                                {{ weaponSheathed ? "收剑状态" : "拔剑出鞘" }}
                            </button>

                            <button type="button" class="u-pill-btn" @click="togglePlaying">
                                {{ playing ? "暂停动作" : "播放动作" }}
                            </button>

                            <el-select v-model="skybox" size="small" class="u-stage-select" @change="onSkyboxChange">
                                <el-option
                                    v-for="bg in skyboxes"
                                    :key="bg.value"
                                    :label="bg.label"
                                    :value="bg.value"
                                />
                            </el-select>

                            <el-select v-model="quality" size="small" class="u-stage-select" @change="onQualityChange">
                                <el-option label="画质：自动" value="auto" />
                                <el-option label="画质：高清" value="high" />
                                <el-option label="画质：均衡" value="medium" />
                                <el-option label="画质：省流" value="low" />
                            </el-select>

                            <el-button
                                type="primary"
                                size="small"
                                round
                                :loading="capturing"
                                :disabled="!stageReady"
                                @click="captureSnapshot"
                            >
                                <el-icon class="el-icon--left"><Camera /></el-icon>
                                {{ $t("exterior.studio.capture") }}
                            </el-button>

                            <el-button size="small" round @click="copyShareUrl">
                                <el-icon class="el-icon--left"><Share /></el-icon>
                                {{ $t("exterior.studio.shareWear") }}
                            </el-button>

                            <el-button
                                v-if="wornCapsules.length"
                                size="small"
                                round
                                @click="clearAllEquipped"
                            >
                                <el-icon class="el-icon--left"><Delete /></el-icon>
                                {{ $t("exterior.studio.clearAll") }}
                            </el-button>

                            <button type="button" class="u-pill-btn" @click="toggleFullscreen">
                                {{ isFullscreen ? "退出全屏" : "全屏" }}
                            </button>
                        </div>
                    </header>

                    <!-- 加载中 / 错误遮罩 -->
                    <div v-if="stageLoading && !stageError" class="m-stage-overlay">
                        <div class="m-stage-loader">
                            <span class="u-spinner" aria-hidden="true" />
                            <span>{{ stageProgressText }}</span>
                        </div>
                    </div>

                    <div v-if="stageError" class="m-stage-overlay is-error">
                        <div class="m-stage-error">
                            <h4>试衣间渲染异常</h4>
                            <p>{{ stageError }}</p>
                            <el-button type="primary" round size="small" @click="reloadStage">重新加载</el-button>
                        </div>
                    </div>

                    <!-- 左下角当前穿戴浮动胶囊 -->
                    <div v-if="wornCapsules.length" class="m-worn-dock" aria-label="当前穿戴清单">
                        <div class="m-worn-dock__title">当前穿戴（{{ wornCapsules.length }}）</div>
                        <div class="m-worn-pills">
                            <div v-for="entry in wornCapsules" :key="entry.key" class="u-worn-capsule">
                                <img v-if="entry.cover" :src="entry.cover" alt="" class="u-cap-thumb" />
                                <router-link
                                    :to="{ name: 'exterior-list', query: { id: entry.key } }"
                                    target="_blank"
                                    class="u-cap-name"
                                    :title="`查看「${entry.name}」详情`"
                                >
                                    {{ entry.name }}
                                </router-link>
                                <span class="u-cap-tag">{{ entry.badge }}</span>
                                <button
                                    type="button"
                                    class="u-cap-remove"
                                    :aria-label="`卸下 ${entry.name}`"
                                    @click="unequipByKey(entry.key)"
                                >
                                    <el-icon><Close /></el-icon>
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 底部操作提示 -->
                    <div class="m-stage-hint">左键旋转 · 右键平移 · 滚轮缩放</div>
                </template>
            </main>
        </div>
    </div>
</template>

<script>
import {
    ArrowLeft,
    Brush,
    Camera,
    Close,
    Delete,
    MagicStick,
    Present,
    Scissor,
    Share,
    Suitcase,
    User as UserIcon,
    View,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import { createWorkerPreview } from "@jx3box/jx3box-exterior/worker";
import StudioBodyEditor from "@/components/exterior/studio/StudioBodyEditor.vue";
import StudioCatalogGrid from "@/components/exterior/studio/StudioCatalogGrid.vue";
import StudioFaceEditor from "@/components/exterior/studio/StudioFaceEditor.vue";
import { STUDIO_MENU, STUDIO_SKYBOXES } from "@/components/exterior/studio/studio-menu";
import { BODY_LABEL_MAP, BODY_TYPES, DOMAIN_META, pickExteriorCover } from "@/components/exterior/meta";
import {
    getCharacterBaseModel,
    getExteriorGraph,
    getExteriorModel,
    getExteriorsDetail,
    getMetaBaseModelUrl,
} from "@/service/exterior";

const QUALITY_STORAGE_KEY = "jx3box_exterior_quality";
const BG_STORAGE_KEY = "jx3box_exterior_bg";
const VALID_ROLES = [1, 2, 5, 6];
const EQUIPABLE_DOMAINS = new Set(["outfit", "part", "hair", "pendant", "weapon", "effect", "posture", "bundle"]);

function loadStoredValue(key, fallback, allowed) {
    try {
        const val = localStorage.getItem(key);
        if (val && (!allowed || allowed.includes(val))) return val;
    } catch {
        // ignore storage errors
    }
    return fallback;
}

export default {
    name: "ExteriorStudio",
    components: {
        ArrowLeft,
        Brush,
        Camera,
        Close,
        Delete,
        MagicStick,
        Present,
        Scissor,
        Share,
        StudioBodyEditor,
        StudioCatalogGrid,
        StudioFaceEditor,
        Suitcase,
        User: UserIcon,
        View,
    },
    data() {
        const routeRole = Number(this.$route.query.role);
        const initRole = VALID_ROLES.includes(routeRole) ? routeRole : null;
        return {
            loggedIn: User.isLogin(),
            menuItems: STUDIO_MENU,
            activeMenuId: STUDIO_MENU[0].id,
            bodyTypes: BODY_TYPES,
            skyboxes: STUDIO_SKYBOXES,
            viewPresets: [
                { value: "front", label: "正面" },
                { value: "back", label: "背面" },
                { value: "face", label: "面部" },
            ],
            explicitRole: initRole,
            faceStyle: this.$route.query.face === "meta" ? "meta" : "stylized",
            activeView: "front",
            playing: true,
            weaponSheathed: false,
            quality: loadStoredValue(QUALITY_STORAGE_KEY, "auto", ["auto", "high", "medium", "low"]),
            skybox: loadStoredValue(
                BG_STORAGE_KEY,
                "pavilion",
                STUDIO_SKYBOXES.map((s) => s.value)
            ),
            isFullscreen: false,

            preview: null,
            baseParts: [],
            stageLoading: false,
            stageReady: false,
            stageError: "",
            stageProgressText: "正在初始化试衣间引擎…",
            capturing: false,
            busyKey: "",
            stageSeq: 0,

            equippedItems: [],
            equippedPosture: null,
            equippedEffect: null,
            pendingFaceApply: null,
            initialWearApplied: false,
        };
    },
    computed: {
        activeRole() {
            return this.explicitRole || this.$store.state.preferredRole || 2;
        },
        activeMenu() {
            return this.menuItems.find((m) => m.id === this.activeMenuId) || this.menuItems[0];
        },
        hasWeaponEquipped() {
            return this.equippedItems.some(
                (item) => item.domain === "weapon" || item.parts?.some((p) => p.weaponMount)
            );
        },
        wornCapsules() {
            const list = this.equippedItems.map((entry) => ({
                key: entry.key,
                name: entry.name,
                cover: entry.cover,
                badge: DOMAIN_META[entry.domain]?.label || entry.domain,
            }));
            if (this.equippedPosture) {
                list.push({
                    key: this.equippedPosture.key,
                    name: this.equippedPosture.name,
                    cover: this.equippedPosture.cover,
                    badge: "站姿",
                });
            }
            if (this.equippedEffect) {
                list.push({
                    key: this.equippedEffect.key,
                    name: this.equippedEffect.name,
                    cover: this.equippedEffect.cover,
                    badge: "特效",
                });
            }
            return list;
        },
        wornKeySet() {
            return new Set(this.wornCapsules.map((e) => e.key));
        },
    },
    watch: {
        "$route.query.wear"(rawWear) {
            if (rawWear && this.loggedIn && this.stageReady) {
                this.equipKeysFromQuery(String(rawWear));
            }
        },
    },
    created() {
        if (this.explicitRole) {
            this.$store.commit("setPreferredRole", { role: this.explicitRole, persist: true });
        }
    },
    async mounted() {
        document.addEventListener("fullscreenchange", this.onFullscreenChange);
        if (!this.explicitRole) {
            const role = await this.$store.dispatch("initPreferredRole").catch(() => null);
            if (!this.explicitRole && VALID_ROLES.includes(Number(role))) {
                this.explicitRole = Number(role);
            }
        }
        if (this.loggedIn) {
            this.loadBaseStage();
        }
    },
    beforeUnmount() {
        document.removeEventListener("fullscreenchange", this.onFullscreenChange);
        this.disposePreview();
    },
    methods: {
        login() {
            User.toLogin();
        },
        selectMenu(id) {
            this.activeMenuId = id;
        },
        onFullscreenChange() {
            this.isFullscreen = document.fullscreenElement === this.$refs.stageContainerRef;
        },
        async toggleFullscreen() {
            const el = this.$refs.stageContainerRef;
            if (!el) return;
            try {
                if (document.fullscreenElement === el) await document.exitFullscreen();
                else if (el.requestFullscreen) await el.requestFullscreen();
            } catch {
                // ignore
            }
        },
        onSkyboxChange(val) {
            try {
                localStorage.setItem(BG_STORAGE_KEY, val);
            } catch {
                // ignore
            }
        },
        onQualityChange(val) {
            try {
                localStorage.setItem(QUALITY_STORAGE_KEY, val);
            } catch {
                // ignore
            }
            this.disposePreview();
            this.loadBaseStage();
        },
        selectCameraView(view) {
            this.activeView = view;
            this.preview?.setView(view);
        },
        togglePlaying() {
            this.playing = !this.playing;
            this.preview?.setPlaying(this.playing);
        },
        toggleWeaponSheathed() {
            this.weaponSheathed = !this.weaponSheathed;
            this.preview?.setWeaponState({ sheathed: this.weaponSheathed });
        },
        disposePreview() {
            if (this.preview) {
                const inst = this.preview;
                this.preview = null;
                this.stageReady = false;
                inst.dispose().catch(() => {});
            }
        },
        reloadStage() {
            this.disposePreview();
            this.loadBaseStage();
        },
        async resolveBaseModelUrl() {
            if (this.faceStyle === "meta") {
                return getMetaBaseModelUrl(this.activeRole);
            }
            const res = await getCharacterBaseModel(this.activeRole);
            if (!res?.modelUrl) throw new Error("未找到对应体型的角色基础模型");
            return res.modelUrl;
        },
        async loadBaseStage() {
            if (!this.loggedIn || !this.$refs.canvasRef) return;
            const seq = ++this.stageSeq;
            this.stageLoading = true;
            this.stageReady = false;
            this.stageError = "";
            this.stageProgressText =
                this.faceStyle === "meta"
                    ? `正在准备${BODY_LABEL_MAP[this.activeRole] || ""}写实人物模型…`
                    : `正在准备${BODY_LABEL_MAP[this.activeRole] || ""}试衣间人物模型…`;

            try {
                const baseUrl = await this.resolveBaseModelUrl();
                if (seq !== this.stageSeq) return;

                const onProgress = (p) => {
                    if (seq !== this.stageSeq) return;
                    if (p?.phase === "parts") this.stageProgressText = "正在加载模型与材质…";
                    else if (p?.phase === "finalizing") this.stageProgressText = "正在装配人物效果…";
                };

                if (this.preview) {
                    await this.preview.load(baseUrl, {
                        view: this.activeView,
                        playing: this.playing,
                        onProgress,
                    });
                } else {
                    this.preview = await createWorkerPreview(this.$refs.canvasRef, {
                        modelUrl: baseUrl,
                        quality: this.quality,
                        view: this.activeView,
                        playing: this.playing,
                        transparent: true,
                        background: null,
                        onProgress,
                        onError: (err) => {
                            if (seq === this.stageSeq) {
                                this.stageError = err?.message || "3D 渲染发生错误";
                                this.stageLoading = false;
                            }
                        },
                    });
                }
                if (seq !== this.stageSeq) return;

                this.baseParts = await this.preview.getBaseParts();
                this.stageReady = true;

                if (this.pendingFaceApply) {
                    const req = this.pendingFaceApply;
                    this.pendingFaceApply = null;
                    await this.executeApplyFaceProfile(req);
                }

                // 若 URL 携带初始 wear 参数且尚未解析，优先解析入身；否则重新装配现有搭配。
                const rawWear = !this.initialWearApplied && this.$route.query.wear ? String(this.$route.query.wear) : "";
                this.initialWearApplied = true;
                if (rawWear) {
                    await this.equipKeysFromQuery(rawWear);
                } else if (this.equippedItems.length || this.equippedPosture || this.equippedEffect) {
                    await this.rehydrateEquippedOnBase();
                }

                this.$refs.bodyEditorRef?.refreshControls?.();
                this.$refs.faceEditorRef?.refreshControls?.();
            } catch (err) {
                if (seq !== this.stageSeq) return;
                this.stageError = err?.message || "试衣间模型初始化失败";
            } finally {
                if (seq === this.stageSeq) {
                    this.stageLoading = false;
                }
            }
        },
        async selectRole(nextRole) {
            if (nextRole === this.activeRole || this.stageLoading) return;
            this.explicitRole = nextRole;
            this.$store.commit("setPreferredRole", { role: nextRole, persist: true });
            await this.loadBaseStage();
        },
        async onSwitchFaceStyle(nextStyle) {
            if (nextStyle === this.faceStyle || this.stageLoading) return;
            this.faceStyle = nextStyle;
            await this.loadBaseStage();
        },
        async onApplyFaceProfile(req) {
            const targetStyle = req.profile.kind === "realistic-face" ? "meta" : "stylized";
            if (targetStyle !== this.faceStyle) {
                this.pendingFaceApply = req;
                this.faceStyle = targetStyle;
                await this.loadBaseStage();
                return;
            }
            await this.executeApplyFaceProfile(req);
        },
        async executeApplyFaceProfile(req) {
            if (!this.preview) return;
            try {
                const res = await this.preview.applyProfile(req.profile, {
                    textureDefinitionUrl: req.textureDefinitionUrl,
                });
                await this.$refs.faceEditorRef?.refreshControls?.();
                const unapplied = res?.unappliedFaceParts?.length || 0;
                if (unapplied > 0) {
                    ElMessage.info(`已应用「${req.label || "脸型"}」（${unapplied} 项专属面饰暂无模型，其余妆容已完整还原）`);
                } else {
                    ElMessage.success(`已应用「${req.label || "脸型"}」`);
                }
            } catch (err) {
                ElMessage.error(err?.message || "脸型应用失败");
            }
        },
        async rehydrateEquippedOnBase() {
            if (!this.preview) return;
            const prevItems = [...this.equippedItems];
            const prevPosture = this.equippedPosture;
            const prevEffect = this.equippedEffect;
            const nextEquipped = [];

            for (const item of prevItems) {
                try {
                    const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                    const reg = await this.preview.registerProduct(modelUrl);
                    nextEquipped.push({
                        ...item,
                        cover: item.rawImages ? pickExteriorCover(item.rawImages, this.activeRole) : item.cover,
                        modelUrl,
                        parts: reg.parts,
                    });
                } catch {
                    // 目标体型不适用此件外观时自动跳过。
                }
            }
            this.equippedItems = nextEquipped;
            await this.syncPartsToViewer();

            if (prevPosture) {
                try {
                    const { modelUrl } = await getExteriorModel(prevPosture.key, this.activeRole);
                    await this.preview.loadPosture(modelUrl);
                    this.equippedPosture = { ...prevPosture, modelUrl };
                } catch {
                    this.equippedPosture = null;
                }
            }
            if (prevEffect) {
                try {
                    const { modelUrl } = await getExteriorModel(prevEffect.key, this.activeRole);
                    await this.preview.loadProductEffect(modelUrl);
                    this.equippedEffect = { ...prevEffect, modelUrl };
                } catch {
                    this.equippedEffect = null;
                }
            }
        },
        computeResolvedPartNames(items) {
            const slotWinner = new Map();
            const userWinner = new Map();

            for (const bp of this.baseParts) {
                if (!slotWinner.has(bp.slot)) slotWinner.set(bp.slot, bp);
            }
            for (const item of items) {
                for (const p of item.parts || []) {
                    slotWinner.set(p.slot, p);
                    userWinner.set(p.slot, item.key);
                }
            }
            const keptItems = items.filter((item) =>
                (item.parts || []).some((p) => userWinner.get(p.slot) === item.key)
            );
            const worn = [...slotWinner.values()];
            const candidates = worn.some((p) => p.slot !== "hat" && (p.hide || []).includes("hat"))
                ? worn.filter((p) => p.slot !== "hat")
                : worn;
            const hidden = new Set(candidates.flatMap((p) => p.hide || []));
            const partNames = candidates
                .filter((p) => !hidden.has(String(p.slot || "").replaceAll("_", "")))
                .map((p) => p.name);

            return { partNames, keptItems };
        },
        async syncPartsToViewer() {
            if (!this.preview) return;
            const { partNames, keptItems } = this.computeResolvedPartNames(this.equippedItems);
            this.equippedItems = keptItems;
            await this.preview.setParts(partNames);
            if (this.hasWeaponEquipped) {
                this.preview.setWeaponState({ sheathed: this.weaponSheathed });
            }
        },
        async onToggleCatalogItem(item) {
            if (!this.preview || !this.stageReady || this.busyKey) return;
            if (this.wornKeySet.has(item.key)) {
                await this.unequipByKey(item.key);
                return;
            }
            this.busyKey = item.key;
            try {
                await this.equipSingleOrBundle(item);
            } catch (err) {
                ElMessage.error(err?.message || `无法穿戴「${item.name || item.key}」`);
            } finally {
                this.busyKey = "";
            }
        },
        async equipKeysFromQuery(rawWear) {
            const keys = rawWear
                .split(",")
                .map((s) => s.trim())
                .filter((s) => /^(bundle|outfit|part|hair|pendant|weapon|effect|posture)_\d+$/.test(s));
            for (const key of keys) {
                try {
                    const item = await getExteriorsDetail(key);
                    if (item) await this.equipSingleOrBundle(item);
                } catch {
                    // ignore invalid query item
                }
            }
        },
        async equipSingleOrBundle(item) {
            if (!this.preview || !item?.key) return;
            const domain = item.domain || String(item.key).split("_")[0];
            if (domain === "bundle") {
                const detail = item.relations ? item : await getExteriorsDetail(item.key);
                let relations = detail?.relations || [];
                if (!relations.length) {
                    const g = await getExteriorGraph(item.key).catch(() => null);
                    relations = g?.edges || [];
                }
                const targetKeys = [];
                for (const edge of relations) {
                    if (edge.from_key === item.key && ["contains", "package_link"].includes(edge.kind)) {
                        const childDomain = String(edge.to_key).split("_")[0];
                        if (childDomain !== "bundle" && EQUIPABLE_DOMAINS.has(childDomain)) {
                            targetKeys.push(edge.to_key);
                        }
                    }
                }
                if (!targetKeys.length) throw new Error("该礼盒暂无可拆解的 3D 穿戴部件");
                const children = await Promise.all(
                    [...new Set(targetKeys)].map((k) => getExteriorsDetail(k).catch(() => null))
                );
                for (const child of children.filter(Boolean)) {
                    await this.equipAtomicItem(child);
                }
                ElMessage.success(`已整套穿戴「${item.name || item.key}」`);
                return;
            }
            await this.equipAtomicItem(item);
        },
        async equipAtomicItem(item) {
            const domain = item.domain || String(item.key).split("_")[0];
            const cover = pickExteriorCover(item.images, this.activeRole);
            const name = item.name || item.game_name || item.key;

            if (domain === "posture") {
                const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                await this.preview.loadPosture(modelUrl);
                this.equippedPosture = { key: item.key, name, cover, modelUrl };
                return;
            }
            if (domain === "effect") {
                const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                await this.preview.loadProductEffect(modelUrl);
                this.equippedEffect = { key: item.key, name, cover, modelUrl };
                return;
            }

            const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
            const reg = await this.preview.registerProduct(modelUrl);
            const filtered = this.equippedItems.filter(
                (entry) => entry.key !== item.key && !(domain === "outfit" && entry.domain === "outfit")
            );
            filtered.push({
                key: item.key,
                name,
                domain,
                cover,
                rawImages: item.images,
                modelUrl,
                parts: reg.parts,
            });
            this.equippedItems = filtered;
            await this.syncPartsToViewer();
        },
        async unequipByKey(key) {
            if (!this.preview) return;
            if (this.equippedPosture?.key === key) {
                await this.preview.loadPosture(null);
                this.equippedPosture = null;
                return;
            }
            if (this.equippedEffect?.key === key) {
                await this.preview.loadProductEffect(null);
                this.equippedEffect = null;
                return;
            }
            this.equippedItems = this.equippedItems.filter((entry) => entry.key !== key);
            await this.syncPartsToViewer();
        },
        async clearAllEquipped() {
            if (!this.preview) return;
            this.equippedItems = [];
            if (this.equippedPosture) {
                await this.preview.loadPosture(null);
                this.equippedPosture = null;
            }
            if (this.equippedEffect) {
                await this.preview.loadProductEffect(null);
                this.equippedEffect = null;
            }
            await this.syncPartsToViewer();
        },
        async captureSnapshot() {
            if (!this.preview || !this.stageReady || this.capturing) return;
            this.capturing = true;
            try {
                const blob = await this.preview.capture({ width: 1200, height: 1600 });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `jx3box-studio-${this.activeRole}-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                link.remove();
                setTimeout(() => URL.revokeObjectURL(url), 5000);
                ElMessage.success("高清试穿照片已生成下载");
            } catch (err) {
                ElMessage.error(err?.message || "高清拍照失败");
            } finally {
                this.capturing = false;
            }
        },
        async copyShareUrl() {
            const url = new URL(window.location.href);
            url.searchParams.set("role", String(this.activeRole));
            if (this.faceStyle === "meta") url.searchParams.set("face", "meta");
            else url.searchParams.delete("face");
            if (this.wornCapsules.length) {
                url.searchParams.set("wear", this.wornCapsules.map((c) => c.key).join(","));
            } else {
                url.searchParams.delete("wear");
            }
            const href = url.toString();
            try {
                await navigator.clipboard.writeText(href);
                ElMessage.success("当前试穿搭配链接已复制");
            } catch {
                ElMessage.info(href);
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-studio {
    width: 100%;
}

.m-studio-shell {
    display: flex;
    height: calc(100vh - 138px);
    min-height: 640px;
    border: 1px solid @pvx-border;
    border-radius: 18px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);

    @media (max-width: 1024px) {
        flex-direction: column;
        height: auto;
    }
}

.m-ext-studio.is-fullscreen .m-studio-shell {
    height: 100vh;
    border-radius: 0;
}

.m-studio-nav {
    display: flex;
    flex-direction: column;
    width: 102px;
    flex-shrink: 0;
    padding: 12px 8px;
    background: #0f172a;
    color: #cbd5e1;
    gap: 10px;

    @media (max-width: 1024px) {
        width: 100%;
        flex-direction: row;
        overflow-x: auto;
        padding: 8px 10px;
    }
}

.u-nav-back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 7px 6px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;

    &:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
    }
}

.m-nav-list {
    display: flex;
    flex-direction: column;
    gap: 4px;

    @media (max-width: 1024px) {
        flex-direction: row;
    }
}

.u-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 6px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: #94a3b8;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.16s;

    .u-nav-icon {
        font-size: 18px;
    }

    &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: #f8fafc;
    }

    &.is-active {
        background: linear-gradient(135deg, #5b5cf5 0%, #8b5cf6 100%);
        color: #ffffff;
        box-shadow: 0 4px 12px rgba(91, 92, 245, 0.35);
    }
}

.m-studio-drawer {
    width: 360px;
    flex-shrink: 0;
    border-right: 1px solid @pvx-border;
    background: #ffffff;
    min-height: 0;
    overflow: hidden;

    @media (max-width: 1024px) {
        width: 100%;
        height: 400px;
        border-right: none;
        border-bottom: 1px solid @pvx-border;
    }
}

.m-studio-stage {
    position: relative;
    flex: 1;
    min-width: 0;
    min-height: 520px;
    overflow: hidden;

    &.is-bg-pavilion {
        background: url("~@/assets/img/exterior/stage-3d-bg.webp") center 68% / cover no-repeat,
            linear-gradient(180deg, #dde7ea 0%, #c8d6dc 100%);
    }

    &.is-bg-mist {
        background: url("~@/assets/img/exterior/stage-bg.webp") center / cover no-repeat,
            linear-gradient(180deg, #e7ecf6 0%, #d8e0ef 100%);
    }

    &.is-bg-warm {
        background: radial-gradient(circle at 50% 35%, #fff7e6 0%, #f3dfc2 58%, #dfbe95 100%);
    }

    &.is-bg-dusk {
        background: radial-gradient(circle at 50% 25%, #6366f1 0%, #312e81 48%, #1e1b4b 100%);
    }

    &.is-bg-dark {
        background: radial-gradient(circle at 50% 34%, #273449 0%, #141c2b 65%, #0f1623 100%);
    }

    &.is-bg-white {
        background: radial-gradient(circle at 50% 42%, #ffffff 0%, #eef2f7 100%);
    }
}

.m-stage-canvas {
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

.m-stage-topbar {
    position: absolute;
    top: 12px;
    left: 12px;
    right: 12px;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    pointer-events: none;

    > * {
        pointer-events: auto;
    }
}

.m-topbar-group {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
}

.m-role-pills,
.m-view-pills {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.68);
    backdrop-filter: blur(8px);
}

.u-pill-btn {
    padding: 5px 11px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: transparent;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.14s;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.14);
        color: #fff;
    }

    &.is-active {
        background: @pvx-primary;
        color: #fff;
    }

    &:disabled {
        opacity: 0.55;
        cursor: wait;
    }
}

.m-topbar-group > .u-pill-btn {
    padding: 7px 12px;
    background: rgba(15, 23, 42, 0.68);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16) inset;
    backdrop-filter: blur(8px);

    &:hover:not(:disabled) {
        background: rgba(30, 41, 59, 0.85);
    }

    &.is-active {
        background: @pvx-primary;
    }
}

.u-stage-select {
    width: 124px;

    :deep(.el-select__wrapper) {
        background: rgba(15, 23, 42, 0.68);
        box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16) inset;
        border-radius: @pvx-radius-pill;
        backdrop-filter: blur(8px);
    }

    :deep(.el-select__selected-item),
    :deep(.el-select__caret) {
        color: #f1f5f9;
        font-size: 12px;
    }
}

.m-stage-overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.36);
    backdrop-filter: blur(4px);

    &.is-error {
        background: rgba(15, 23, 42, 0.68);
    }
}

.m-stage-loader {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 10px 18px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.85);
    color: #fff;
    font-size: 13px;
    font-weight: 500;

    .u-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: studio-spin 0.8s linear infinite;
    }
}

@keyframes studio-spin {
    to {
        transform: rotate(360deg);
    }
}

.m-stage-error,
.m-gate-card {
    max-width: 360px;
    padding: 24px 26px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.96);
    text-align: center;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);

    h2,
    h4 {
        margin: 8px 0 6px;
        color: @pvx-text-primary;
    }

    p {
        margin: 0 0 16px;
        font-size: 13px;
        line-height: 1.6;
        color: @pvx-text-secondary;
    }
}

.m-stage-gate {
    position: relative;
    z-index: 2;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    padding: 24px;
}

.u-gate-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: @pvx-radius-pill;
    background: @pvx-primary-soft;
    color: @pvx-primary-hover;
    font-size: 12px;
    font-weight: 700;
}

.m-worn-dock {
    position: absolute;
    left: 14px;
    bottom: 14px;
    z-index: 3;
    max-width: min(64%, 560px);
    padding: 10px 12px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(8px);
    color: #f8fafc;
}

.m-worn-dock__title {
    margin-bottom: 6px;
    font-size: 11px;
    font-weight: 700;
    color: #cbd5e1;
}

.m-worn-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.u-worn-capsule {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 6px 3px 4px;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.14);
    font-size: 12px;

    .u-cap-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        object-fit: cover;
        object-position: top center;
    }

    .u-cap-name {
        max-width: 110px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        color: #f8fafc;
        font-weight: 600;

        &:hover {
            color: #a5b4fc;
        }
    }

    .u-cap-tag {
        padding: 1px 5px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 10px;
        color: #cbd5e1;
    }

    .u-cap-remove {
        display: inline-grid;
        place-items: center;
        width: 16px;
        height: 16px;
        padding: 0;
        border: none;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.2);
        color: #ffffff;
        font-size: 10px;
        cursor: pointer;

        &:hover {
            background: #ef4444;
        }
    }
}

.m-stage-hint {
    position: absolute;
    right: 14px;
    bottom: 14px;
    z-index: 2;
    padding: 5px 10px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.52);
    color: #e2e8f0;
    font-size: 11px;
    pointer-events: none;
}
</style>
