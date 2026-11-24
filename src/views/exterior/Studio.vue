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
                    :apply-face-handler="onApplyFaceProfile"
                    :face-progress="actionProgressPercent"
                    @switch-face-style="onSwitchFaceStyle"
                    @apply-face-profile="onApplyFaceProfile"
                    @focus-face="selectCameraView('face')"
                />
                <StudioCatalogGrid
                    v-else
                    :menu-item="activeMenu"
                    :role="activeRole"
                    :worn-keys="wornKeySet"
                    :cached-keys="cachedKeySet"
                    :history-items="historyItems"
                    :busy-key="busyKey"
                    :busy-percent="actionProgressPercent"
                    @select="onToggleCatalogItem"
                    @wear-related="onWearRelatedItem"
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

                <!-- 账号认证门禁 -->
                <div v-else-if="verifyRequired" class="m-stage-gate">
                    <div class="m-gate-card">
                        <span class="u-gate-pill">账号认证门槛</span>
                        <h2>完成账号认证后开启自由试衣间</h2>
                        <p>为保障模型与服务资源安全，请先完成手机号验证或绑定微信公众号后使用试衣间</p>
                        <div class="m-gate-actions">
                            <el-button type="primary" round size="large" @click="goVerifyAuth">
                                前往账号认证
                            </el-button>
                            <el-button round size="large" @click="recheckVerifyStatus">
                                已认证？重新检测
                            </el-button>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <canvas
                        ref="canvasRef"
                        :key="canvasKey"
                        class="m-stage-canvas"
                        aria-label="自由试衣间 3D 画布"
                    />

                    <button
                        v-if="immersiveMode"
                        type="button"
                        class="m-immersive-exit"
                        @click="toggleImmersive(false)"
                    >
                        退出沉浸 (Esc)
                    </button>

                    <!-- 顶部悬浮控制条 -->
                    <header v-show="!immersiveMode" class="m-stage-topbar">
                        <div class="m-topbar-row is-primary">
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

                            <div class="m-locomotion-pills" role="group" aria-label="移动姿态">
                                <button
                                    v-for="loc in locomotionModes"
                                    :key="loc.value"
                                    type="button"
                                    class="u-pill-btn"
                                    :class="{ 'is-active': locomotion === loc.value }"
                                    :disabled="stageLoading"
                                    @click="selectLocomotion(loc.value)"
                                >
                                    {{ loc.label }}
                                </button>
                            </div>

                            <button
                                type="button"
                                class="u-pill-btn u-skill-teaser-btn"
                                title="门派技能动作演出筹备中，敬请期待"
                                @click="onSkillActionTeaser"
                            >
                                <el-icon><MagicStick /></el-icon>
                                <span>技能动作</span>
                            </button>

                            <div v-if="hasWeaponEquipped" class="m-weapon-pills" role="group" aria-label="武器姿态">
                                <button
                                    v-for="st in weaponStances"
                                    :key="st.value"
                                    type="button"
                                    class="u-pill-btn"
                                    :class="{ 'is-active': weaponStance === st.value }"
                                    @click="selectWeaponStance(st.value)"
                                >
                                    {{ st.label }}
                                </button>
                            </div>
                        </div>

                        <div class="m-topbar-row is-secondary">
                            <button type="button" class="u-pill-btn" @click="togglePlaying">
                                {{ playing ? "暂停动作" : "播放动作" }}
                            </button>

                            <button
                                v-if="equippedExpression"
                                type="button"
                                class="u-pill-btn u-expr-replay-btn"
                                :class="{ 'is-active': faceExpressionLoop }"
                                :title="
                                    faceExpressionLoop
                                        ? '当前循环播放，单击重播，双击切回单次播放'
                                        : '单击重播表情，双击切换循环播放'
                                "
                                @click="replayFaceExpression"
                                @dblclick.prevent="toggleFaceExpressionLoop"
                            >
                                <el-icon><RefreshRight /></el-icon>
                                <span>{{ faceExpressionLoop ? "重播表情 · 循环" : "重播表情" }}</span>
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

                            <button type="button" class="u-pill-btn" @click="toggleImmersive(true)">
                                沉浸模式
                            </button>
                        </div>
                    </header>

                    <!-- 加载中 / 错误遮罩 -->
                    <div v-if="stageLoading && !stageError" class="m-stage-overlay">
                        <div class="m-stage-loader">
                            <div class="m-loader-head">
                                <span class="u-spinner" aria-hidden="true" />
                                <span>{{ stageProgressText }}</span>
                                <span v-if="stageProgressPercent > 0" class="u-loader-pct">
                                    {{ stageProgressPercent }}%
                                </span>
                            </div>
                            <div class="u-loader-bar">
                                <div class="u-loader-fill" :style="{ width: `${stageProgressPercent}%` }" />
                            </div>
                        </div>
                    </div>

                    <div v-else-if="!immersiveMode && actionProgressText && !stageError" class="m-action-progress">
                        <div class="m-action-head">
                            <span class="u-spinner" aria-hidden="true" />
                            <span>{{ actionProgressText }}</span>
                            <span v-if="actionProgressPercent > 0" class="u-loader-pct">
                                {{ actionProgressPercent }}%
                            </span>
                        </div>
                        <div class="u-loader-bar">
                            <div class="u-loader-fill" :style="{ width: `${actionProgressPercent}%` }" />
                        </div>
                    </div>

                    <div v-if="stageError" class="m-stage-overlay is-error">
                        <div class="m-stage-error">
                            <h4>试衣间渲染异常</h4>
                            <p>{{ stageError }}</p>
                            <el-button type="primary" round size="small" @click="reloadStage">重新加载</el-button>
                        </div>
                    </div>

                    <!-- 左下角挂宠行为栏与当前穿戴浮动胶囊 -->
                    <div v-if="!immersiveMode && (petBehaviorModes.length > 1 || wornCapsules.length)" class="m-stage-docks">
                        <div v-if="petBehaviorModes.length > 1" class="m-pet-dock" aria-label="挂宠行为切换">
                            <span class="m-pet-dock__label">挂宠姿态</span>
                            <div class="m-pet-dock__pills">
                                <button
                                    v-for="modeObj in petBehaviorModes"
                                    :key="modeObj.mode"
                                    type="button"
                                    class="u-pet-mode-btn"
                                    :class="{ 'is-active': activePetMode === modeObj.mode }"
                                    :disabled="Boolean(busyKey)"
                                    @click="selectPetBehaviorMode(modeObj)"
                                >
                                    {{ modeObj.label }}
                                </button>
                            </div>
                        </div>

                        <div v-if="wornCapsules.length" class="m-worn-dock" aria-label="当前穿戴清单">
                            <div class="m-worn-dock__title">当前穿戴（{{ wornCapsules.length }}）</div>
                            <div class="m-worn-pills">
                                <div v-for="entry in wornCapsules" :key="entry.key" class="u-worn-capsule">
                                    <img v-if="entry.cover" :src="entry.cover" alt="" class="u-cap-thumb" />
                                    <router-link
                                        v-if="entry.linkable !== false"
                                        :to="{ name: 'exterior-list', query: { id: entry.key } }"
                                        target="_blank"
                                        class="u-cap-name"
                                        :title="`查看「${entry.name}」详情`"
                                    >
                                        {{ entry.name }}
                                    </router-link>
                                    <span v-else class="u-cap-name">{{ entry.name }}</span>
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
                    </div>

                    <!-- 底部操作提示 -->
                    <div v-show="!immersiveMode" class="m-stage-hint">左键旋转 · 右键平移 · 滚轮缩放</div>
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
    Clock,
    Close,
    Delete,
    MagicStick,
    RefreshRight,
    Scissor,
    Share,
    Star,
    Suitcase,
    Sunny,
    User as UserIcon,
    View,
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import { createWorkerPreview } from "@jx3box/jx3box-exterior/worker";
import StudioBodyEditor from "@/components/exterior/studio/StudioBodyEditor.vue";
import StudioCatalogGrid from "@/components/exterior/studio/StudioCatalogGrid.vue";
import StudioFaceEditor from "@/components/exterior/studio/StudioFaceEditor.vue";
import { extractStudioGraphRelations } from "@/components/exterior/studio/StudioItemHoverPopover.vue";
import { STUDIO_MENU, STUDIO_SKYBOXES } from "@/components/exterior/studio/studio-menu";
import { BODY_LABEL_MAP, BODY_TYPES, DOMAIN_META, pickExteriorCover } from "@/components/exterior/meta";
import {
    UC_AUTH_URL,
    getCharacterBaseModel,
    getExteriorGraphCached,
    getExteriorModel,
    getExteriorsDetail,
    getFaceExpressionUrl,
    getFaceExpressionsManifest,
    getMetaBaseModelUrl,
    getPetBehaviorsManifest,
    getUserVerifyStatus,
    getWeaponStanceClipUrl,
    getWeaponStancesManifest,
    resolvePetBehaviorClipUrl,
} from "@/service/exterior";

const QUALITY_STORAGE_KEY = "jx3box_exterior_quality";
const BG_STORAGE_KEY = "jx3box_exterior_bg";
const HISTORY_STORAGE_KEY = "jx3box_exterior_studio_history_v1";
const CACHED_STORAGE_KEY = "jx3box_exterior_studio_cached_v1";
const MAX_HISTORY_ITEMS = 60;
const MAX_CACHED_KEYS = 200;
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

function loadStoredJson(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function saveStoredJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // ignore quota errors
    }
}

function calcProgressPercent(p, base = 8) {
    if (!p) return base;
    if (p.phase === "ready") return 100;
    if (Number.isFinite(p.total) && p.total > 0) {
        const ratio = Math.max(0, Math.min(1, (Number(p.completed) || 0) / p.total));
        return Math.max(base, Math.min(99, Math.round(ratio * 100)));
    }
    if (p.phase === "catalog") return Math.max(base, 12);
    if (p.phase === "finalizing") return Math.max(base, 92);
    if (p.phase === "face") return Math.max(base, 25);
    return base;
}

export default {
    name: "ExteriorStudio",
    components: {
        ArrowLeft,
        Brush,
        Camera,
        Clock,
        Close,
        Delete,
        MagicStick,
        RefreshRight,
        Scissor,
        Share,
        Star,
        StudioBodyEditor,
        StudioCatalogGrid,
        StudioFaceEditor,
        Suitcase,
        Sunny,
        User: UserIcon,
        View,
    },
    data() {
        const routeRole = Number(this.$route.query.role);
        const initRole = VALID_ROLES.includes(routeRole) ? routeRole : null;
        const storedHistory = loadStoredJson(HISTORY_STORAGE_KEY, []);
        const storedCached = loadStoredJson(CACHED_STORAGE_KEY, {});
        return {
            loggedIn: User.isLogin(),
            verifyChecked: false,
            verifyRequired: false,
            immersiveMode: false,
            menuItems: STUDIO_MENU,
            activeMenuId: "outfit",
            bodyTypes: BODY_TYPES,
            skyboxes: STUDIO_SKYBOXES,
            viewPresets: [
                { value: "front", label: "正面" },
                { value: "back", label: "背面" },
                { value: "face", label: "面部" },
            ],
            locomotionModes: [
                { value: "idle", label: "站立" },
                { value: "walk", label: "行走" },
                { value: "run", label: "奔跑" },
            ],
            weaponStances: [
                { value: "sheathed", label: "收剑" },
                { value: "unsheathed", label: "持武" },
                { value: "fight", label: "战斗" },
            ],
            explicitRole: initRole,
            faceStyle: this.$route.query.face === "meta" ? "meta" : "stylized",
            activeView: "front",
            locomotion: "idle",
            playing: true,
            weaponStance: "unsheathed",
            quality: loadStoredValue(QUALITY_STORAGE_KEY, "auto", ["auto", "high", "medium", "low"]),
            skybox: loadStoredValue(
                BG_STORAGE_KEY,
                "pavilion",
                STUDIO_SKYBOXES.map((s) => s.value)
            ),
            isFullscreen: false,
            canvasKey: 0,
            needsFreshCanvas: false,

            preview: null,
            baseParts: [],
            stageLoading: false,
            stageReady: false,
            stageError: "",
            stageProgressText: "正在初始化试衣间引擎…",
            stageProgressPercent: 0,
            actionProgressText: "",
            actionProgressPercent: 0,
            capturing: false,
            busyKey: "",
            stageSeq: 0,

            equippedItems: [],
            equippedPosture: null,
            equippedEffect: null,
            equippedExpression: null,
            faceExpressionLoop: false,
            petBehaviorsManifest: null,
            faceExpressionsManifest: null,
            activePetMode: "wear",
            pendingFaceApply: null,
            initialWearApplied: false,
            historyItems: Array.isArray(storedHistory) ? storedHistory : [],
            cachedRoleKeys: storedCached && !Array.isArray(storedCached) ? storedCached : {},
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
            if (this.equippedExpression) {
                list.push({
                    key: this.equippedExpression.key,
                    name: this.equippedExpression.name,
                    cover: "",
                    badge: "表情",
                    linkable: false,
                });
            }
            return list;
        },
        equippedPetEntry() {
            const petsMap = this.petBehaviorsManifest?.pets;
            if (!petsMap) return null;
            return (
                this.equippedItems.find(
                    (item) =>
                        String(item.key || "").startsWith("pendant_") && Boolean(petsMap[item.key])
                ) || null
            );
        },
        petBehaviorModes() {
            if (!this.equippedPetEntry || !this.petBehaviorsManifest?.pets) return [];
            const roleData = this.petBehaviorsManifest.pets[this.equippedPetEntry.key]?.roles?.[String(this.activeRole)];
            return Array.isArray(roleData?.modes) ? roleData.modes : [];
        },
        wornKeySet() {
            return new Set(this.wornCapsules.map((e) => e.key));
        },
        cachedKeySet() {
            const list = this.cachedRoleKeys?.[this.activeRole] || [];
            return new Set(list);
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
        this._faceSeq = 0;
        this._actionSeq = 0;
        if (this.explicitRole) {
            this.$store.commit("setPreferredRole", { role: this.explicitRole, persist: true });
        }
    },
    async mounted() {
        document.addEventListener("fullscreenchange", this.onFullscreenChange);
        document.addEventListener("keydown", this.onStageKeydown);
        if (!this.explicitRole) {
            const role = await this.$store.dispatch("initPreferredRole").catch(() => null);
            if (!this.explicitRole && VALID_ROLES.includes(Number(role))) {
                this.explicitRole = Number(role);
            }
        }
        getPetBehaviorsManifest()
            .then((manifest) => {
                this.petBehaviorsManifest = manifest;
            })
            .catch(() => {});
        getFaceExpressionsManifest()
            .then((manifest) => {
                this.faceExpressionsManifest = manifest;
            })
            .catch(() => {});
        if (this.loggedIn) {
            await this.ensureVerifiedAndStart();
        }
    },
    beforeUnmount() {
        document.removeEventListener("fullscreenchange", this.onFullscreenChange);
        document.removeEventListener("keydown", this.onStageKeydown);
        this.disposePreview();
    },
    methods: {
        login() {
            User.toLogin();
        },
        goVerifyAuth() {
            window.open(UC_AUTH_URL, "_blank", "noopener");
        },
        async recheckVerifyStatus() {
            const status = await getUserVerifyStatus(true);
            this.verifyChecked = true;
            this.verifyRequired = !status?.verified;
            if (status?.verified) {
                this.loadBaseStage();
            } else {
                ElMessage.warning("尚未检测到账号认证状态，请完成认证后再试");
            }
        },
        async ensureVerifiedAndStart() {
            const status = await getUserVerifyStatus();
            this.verifyChecked = true;
            this.verifyRequired = !status?.verified;
            if (status?.verified) {
                this.loadBaseStage();
            }
        },
        toggleImmersive(active) {
            this.immersiveMode = Boolean(active);
        },
        onStageKeydown(event) {
            if (event.key === "Escape" && this.immersiveMode) {
                this.immersiveMode = false;
            }
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
        async resolveWeaponStanceSpec(weaponKey) {
            const fallback = { weaponType: 0, school: 0, sheathAni: 30, unsheathAni: 31, fightAni: 47 };
            const wid = String(weaponKey || "").replace(/^weapon_/, "");
            if (!wid) return fallback;
            try {
                const manifest = await getWeaponStancesManifest();
                const wt = manifest?.byWeaponId?.[wid];
                return wt && manifest?.weaponTypes?.[wt]
                    ? { weaponType: Number(wt), ...manifest.weaponTypes[wt] }
                    : fallback;
            } catch {
                return fallback;
            }
        },
        async applyWeaponStance(stance, { keepPosture = false } = {}) {
            if (!this.preview) return;
            const validStance = ["sheathed", "unsheathed", "fight"].includes(stance) ? stance : "unsheathed";
            this.weaponStance = validStance;
            const weaponItem = this.equippedItems.find(
                (item) => item.domain === "weapon" || item.parts?.some((p) => p.weaponMount)
            );
            if (!weaponItem) return;

            const actionSeq = ++this._actionSeq;
            const spec = await this.resolveWeaponStanceSpec(weaponItem.key);
            if (!this.preview || actionSeq !== this._actionSeq) return;

            const sheathed = validStance === "sheathed";
            let pose = validStance === "fight" ? 1 : 0;
            if (!sheathed) {
                if (spec.weaponType === 13) pose = validStance === "fight" ? 3 : 0;
                else if (spec.weaponType === 20) pose = 1;
            }
            this.preview.setWeaponState({ sheathed, school: spec.school || 0, pose });

            if (keepPosture && this.equippedPosture && sheathed) {
                return;
            }
            if (!sheathed) {
                this.equippedPosture = null;
            }

            const locomotionActive = this.locomotion === "walk" || this.locomotion === "run";
            const aniId = locomotionActive
                ? this.resolveLocomotionAniId(this.locomotion, sheathed, spec)
                : sheathed
                  ? spec.sheathAni
                  : validStance === "fight"
                    ? spec.fightAni
                    : spec.unsheathAni;
            const clipUrl =
                !locomotionActive && sheathed && aniId === 30
                    ? null
                    : getWeaponStanceClipUrl(this.activeRole, aniId);

            this.actionProgressText = locomotionActive
                ? `正在切换武器${this.locomotion === "run" ? "奔跑" : "行走"}姿态…`
                : `正在切换武器姿态（${sheathed ? "收剑" : validStance === "fight" ? "战斗" : "持武"}）…`;
            this.actionProgressPercent = clipUrl ? 40 : 80;
            try {
                await this.preview.loadAnimation(clipUrl);
                if (locomotionActive) {
                    await this.preview.setLocomotion(this.locomotion);
                }
                if (actionSeq === this._actionSeq) {
                    this.actionProgressPercent = 100;
                }
            } catch (err) {
                if (err?.name !== "AbortError") {
                    ElMessage.error(err?.message || "切换武器姿态失败");
                }
            } finally {
                if (actionSeq === this._actionSeq) {
                    this.actionProgressText = "";
                    this.actionProgressPercent = 0;
                }
            }
        },
        selectWeaponStance(stance) {
            void this.applyWeaponStance(stance);
        },
        resolveLocomotionAniId(mode, sheathed, spec) {
            if (mode === "walk") {
                return spec ? (sheathed ? spec.walkSheathAni || 9 : spec.walkHandAni || 9) : 9;
            }
            if (mode === "run") {
                return spec ? (sheathed ? spec.runSheathAni || 16 : spec.runHandAni || 16) : 16;
            }
            return null;
        },
        async applyLocomotion(mode, { keepPosture = false } = {}) {
            if (!this.preview) return;
            const validMode = ["idle", "walk", "run"].includes(mode) ? mode : "idle";
            this.locomotion = validMode;
            if (validMode === "idle") {
                await this.preview.setLocomotion("idle");
                if (this.hasWeaponEquipped) {
                    await this.applyWeaponStance(this.weaponStance, { keepPosture });
                } else if (!keepPosture && !this.equippedPosture) {
                    await this.preview.loadAnimation(null);
                }
                return;
            }
            if (!this.playing) {
                this.playing = true;
                this.preview.setPlaying(true);
            }
            this.equippedPosture = null;

            const actionSeq = ++this._actionSeq;
            let aniId = validMode === "run" ? 16 : 9;
            const weaponItem = this.equippedItems.find(
                (item) => item.domain === "weapon" || item.parts?.some((p) => p.weaponMount)
            );
            if (weaponItem) {
                const spec = await this.resolveWeaponStanceSpec(weaponItem.key);
                if (!this.preview || actionSeq !== this._actionSeq) return;
                const sheathed = this.weaponStance === "sheathed";
                let pose = this.weaponStance === "fight" ? 1 : 0;
                if (!sheathed) {
                    if (spec.weaponType === 13) pose = this.weaponStance === "fight" ? 3 : 0;
                    else if (spec.weaponType === 20) pose = 1;
                }
                await this.preview.setWeaponState({ sheathed, school: spec.school || 0, pose });
                aniId = this.resolveLocomotionAniId(validMode, sheathed, spec);
            } else {
                const manifest = await getWeaponStancesManifest().catch(() => null);
                if (!this.preview || actionSeq !== this._actionSeq) return;
                if (manifest?.locomotion?.[validMode]) aniId = manifest.locomotion[validMode];
            }

            const clipUrl = getWeaponStanceClipUrl(this.activeRole, aniId);
            this.actionProgressText = `正在切换至${validMode === "run" ? "奔跑" : "行走"}姿态…`;
            this.actionProgressPercent = 40;
            try {
                await this.preview.loadAnimation(clipUrl);
                await this.preview.setLocomotion(validMode);
                if (actionSeq === this._actionSeq) {
                    this.actionProgressPercent = 100;
                }
            } catch (err) {
                if (err?.name !== "AbortError") {
                    ElMessage.error(err?.message || "切换移动姿态失败");
                }
            } finally {
                if (actionSeq === this._actionSeq) {
                    this.actionProgressText = "";
                    this.actionProgressPercent = 0;
                }
            }
        },
        selectLocomotion(mode) {
            void this.applyLocomotion(mode);
        },
        onSkillActionTeaser() {
            ElMessage.info("技能动作释放功能正在筹备中，敬请期待～");
        },
        async replayFaceExpression() {
            if (!this.preview || !this.equippedExpression) return;
            if (!this.playing) {
                this.playing = true;
                await this.preview.setPlaying(true);
            }
            await this.preview.replayFaceExpression();
        },
        async toggleFaceExpressionLoop() {
            if (!this.preview || !this.equippedExpression) return;
            this.faceExpressionLoop = !this.faceExpressionLoop;
            if (this.faceExpressionLoop && !this.playing) {
                this.playing = true;
                await this.preview.setPlaying(true);
            }
            await this.preview.setFaceExpressionLoop(this.faceExpressionLoop);
            ElMessage.success(
                this.faceExpressionLoop
                    ? "表情已切换为循环播放（再次双击切回单次）"
                    : "表情已切回单次播放"
            );
        },
        recordCachedAndHistory(item) {
            if (!item?.key) return;
            const roleKey = String(this.activeRole);
            const prevList = Array.isArray(this.cachedRoleKeys?.[roleKey]) ? this.cachedRoleKeys[roleKey] : [];
            const nextCached = [item.key, ...prevList.filter((k) => k !== item.key)].slice(0, MAX_CACHED_KEYS);
            this.cachedRoleKeys = { ...this.cachedRoleKeys, [roleKey]: nextCached };
            saveStoredJson(CACHED_STORAGE_KEY, this.cachedRoleKeys);

            const domain = item.domain || String(item.key).split("_")[0];
            if (!EQUIPABLE_DOMAINS.has(domain) || domain === "bundle") return;
            const snap = {
                key: item.key,
                name: item.name || item.game_name || item.key,
                game_name: item.game_name || item.name || item.key,
                domain,
                slot: item.slot || null,
                icon_id: item.icon_id || 0,
                roles: Array.isArray(item.roles) ? item.roles : null,
                has_model: true,
                images: item.images || item.rawImages || null,
            };
            const nextHistory = [snap, ...this.historyItems.filter((h) => h.key !== item.key)].slice(
                0,
                MAX_HISTORY_ITEMS
            );
            this.historyItems = nextHistory;
            saveStoredJson(HISTORY_STORAGE_KEY, nextHistory);
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
            if (!this.loggedIn || this.verifyRequired) return;
            const seq = ++this.stageSeq;
            this.stageLoading = true;
            this.stageReady = false;
            this.stageError = "";
            this.stageProgressPercent = 6;
            this.stageProgressText =
                this.faceStyle === "meta"
                    ? `正在准备${BODY_LABEL_MAP[this.activeRole] || ""}写实人物模型…`
                    : `正在准备${BODY_LABEL_MAP[this.activeRole] || ""}试衣间人物模型…`;

            try {
                if (!this.preview && this.needsFreshCanvas) {
                    this.canvasKey += 1;
                    await this.$nextTick();
                    if (seq !== this.stageSeq) return;
                    this.needsFreshCanvas = false;
                }
                if (!this.$refs.canvasRef) {
                    await this.$nextTick();
                    if (seq !== this.stageSeq || !this.$refs.canvasRef) return;
                }

                const baseUrl = await this.resolveBaseModelUrl();
                if (seq !== this.stageSeq) return;
                this.stageProgressPercent = Math.max(this.stageProgressPercent, 14);

                const onProgress = (p) => {
                    if (seq !== this.stageSeq) return;
                    if (p?.phase === "parts") this.stageProgressText = "正在加载模型与材质…";
                    else if (p?.phase === "finalizing") this.stageProgressText = "正在装配人物效果…";
                    this.stageProgressPercent = Math.max(
                        this.stageProgressPercent,
                        calcProgressPercent(p, 14)
                    );
                };

                if (this.preview) {
                    await this.preview.load(baseUrl, {
                        view: this.activeView,
                        playing: this.playing,
                        onProgress,
                    });
                } else {
                    // 每次重建挂载全新的 OffscreenCanvas 所有权，避免切换画质二次转移报错。
                    this.needsFreshCanvas = true;
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
                this.stageProgressPercent = 100;
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
                } else if (
                    this.equippedItems.length ||
                    this.equippedPosture ||
                    this.equippedEffect ||
                    this.locomotion !== "idle"
                ) {
                    await this.rehydrateEquippedOnBase();
                }

                this.$refs.bodyEditorRef?.refreshControls?.();
                this.$refs.faceEditorRef?.refreshControls?.();
            } catch (err) {
                if (seq !== this.stageSeq) return;
                if (err?.code === 40301 || String(err?.message || "").includes("账号认证")) {
                    this.verifyChecked = true;
                    this.verifyRequired = true;
                    this.disposePreview();
                    return;
                }
                this.stageError = err?.message || "试衣间模型初始化失败";
            } finally {
                if (seq === this.stageSeq) {
                    this.stageLoading = false;
                    this.stageProgressPercent = 0;
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
                return true;
            }
            return this.executeApplyFaceProfile(req);
        },
        async executeApplyFaceProfile(req) {
            if (!this.preview) return false;
            const seq = ++this._faceSeq;
            const actionSeq = ++this._actionSeq;
            this.actionProgressText = `正在应用「${req.label || "脸型"}」…`;
            this.actionProgressPercent = 12;
            try {
                const res = await this.preview.applyProfile(req.profile, {
                    textureDefinitionUrl: req.textureDefinitionUrl,
                    onProgress: (p) => {
                        if (actionSeq !== this._actionSeq) return;
                        this.actionProgressPercent = Math.max(
                            this.actionProgressPercent,
                            calcProgressPercent(p, 15)
                        );
                    },
                });
                if (seq !== this._faceSeq) return false;
                await this.$refs.faceEditorRef?.refreshControls?.();
                const unapplied = res?.unappliedFaceParts?.length || 0;
                if (unapplied > 0) {
                    ElMessage.info(`已应用「${req.label || "脸型"}」（${unapplied} 项专属面饰暂无模型，其余妆容已完整还原）`);
                } else {
                    ElMessage.success(`已应用「${req.label || "脸型"}」`);
                }
                return true;
            } catch (err) {
                if (err?.name === "AbortError" || seq !== this._faceSeq) return false;
                ElMessage.error(err?.message || "脸型应用失败");
                return false;
            } finally {
                if (actionSeq === this._actionSeq) {
                    this.actionProgressText = "";
                    this.actionProgressPercent = 0;
                }
            }
        },
        async rehydrateEquippedOnBase() {
            if (!this.preview) return;
            const prevItems = [...this.equippedItems];
            const prevPosture = this.equippedPosture;
            const prevEffect = this.equippedEffect;
            const prevExpression = this.equippedExpression;
            this.activePetMode = "wear";
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
                    this.recordCachedAndHistory(item);
                } catch {
                    // 目标体型不适用此件外观时自动跳过。
                }
            }
            await this.syncPartsToViewer(undefined, nextEquipped);

            if (prevPosture && this.locomotion === "idle") {
                try {
                    const { modelUrl } = await getExteriorModel(prevPosture.key, this.activeRole);
                    if (this.hasWeaponEquipped) {
                        await this.applyWeaponStance("sheathed", { keepPosture: true });
                    }
                    await this.preview.loadPosture(modelUrl);
                    this.equippedPosture = { ...prevPosture, modelUrl };
                } catch {
                    this.equippedPosture = null;
                }
            } else if (this.locomotion !== "idle") {
                await this.applyLocomotion(this.locomotion);
            } else if (this.hasWeaponEquipped) {
                await this.applyWeaponStance(this.weaponStance);
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
            if (prevExpression) {
                const exprMeta = this.faceExpressionsManifest?.expressions?.find(
                    (e) => e.key === prevExpression.exprKey
                );
                const roleSupported =
                    !exprMeta || (Array.isArray(exprMeta.roles) && exprMeta.roles.includes(this.activeRole));
                if (roleSupported) {
                    const nextUrl = getFaceExpressionUrl(this.activeRole, prevExpression.exprKey);
                    try {
                        await this.preview.loadFaceExpression(nextUrl, { loop: this.faceExpressionLoop });
                        this.equippedExpression = { ...prevExpression, url: nextUrl };
                    } catch {
                        this.equippedExpression = null;
                        this.faceExpressionLoop = false;
                    }
                } else {
                    await this.preview.loadFaceExpression(null).catch(() => {});
                    this.equippedExpression = null;
                    this.faceExpressionLoop = false;
                }
            }
        },
        computeResolvedPartNames(items) {
            const slotWinner = new Map();
            const userWinner = new Map();

            for (const bp of this.baseParts) {
                const list = slotWinner.get(bp.slot) || [];
                list.push(bp);
                slotWinner.set(bp.slot, list);
            }
            for (const item of items) {
                const grouped = new Map();
                for (const p of item.parts || []) {
                    if (!grouped.has(p.slot)) grouped.set(p.slot, []);
                    grouped.get(p.slot).push(p);
                }
                for (const [slot, slotParts] of grouped) {
                    slotWinner.set(slot, slotParts);
                    userWinner.set(slot, item.key);
                }
            }
            const worn = [...slotWinner.values()].flat();
            const candidates = worn.some((p) => p.slot !== "hat" && (p.hide || []).includes("hat"))
                ? worn.filter((p) => p.slot !== "hat")
                : worn;
            const hidden = new Set(candidates.flatMap((p) => p.hide || []));
            const partNames = candidates
                .filter((p) => !hidden.has(String(p.slot || "").replaceAll("_", "")))
                .map((p) => p.name);
            const visibleSet = new Set(partNames);
            const keptItems = items.filter((item) =>
                (item.parts || []).some((p) => userWinner.get(p.slot) === item.key && visibleSet.has(p.name))
            );

            return { partNames, keptItems };
        },
        async syncPartsToViewer(onProgress, candidateItems = this.equippedItems) {
            if (!this.preview) return;
            const { partNames, keptItems } = this.computeResolvedPartNames(candidateItems);
            await this.preview.setParts(partNames, { onProgress });
            this.equippedItems = keptItems;
        },
        async onWearRelatedItem(item) {
            return this.onToggleCatalogItem(item);
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
        async equipSingleOrBundle(item, options = {}) {
            if (!this.preview || !item?.key) return;
            const domain = item.domain || String(item.key).split("_")[0];
            if (domain === "bundle") {
                const detail = item.relations ? item : await getExteriorsDetail(item.key);
                let relations = detail?.relations || [];
                if (!relations.length) {
                    const g = await getExteriorGraphCached(item.key).catch(() => null);
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
                    await this.equipAtomicItem(child, { ...options, skipAutoHair: true });
                }
                ElMessage.success(`已整套穿戴「${item.name || item.key}」`);
                return;
            }
            await this.equipAtomicItem(item, options);
        },
        async resolvePairedHairForOutfit(outfitKey, occupiedItems) {
            const hasHair = occupiedItems.some(
                (entry) => entry.domain === "hair" || (entry.parts || []).some((p) => p.slot === "hair")
            );
            if (hasHair) return null;
            const graph = await getExteriorGraphCached(outfitKey).catch(() => null);
            if (!graph) return null;
            const { pairedHairs } = extractStudioGraphRelations(graph, outfitKey);
            for (const hair of pairedHairs) {
                try {
                    const { modelUrl } = await getExteriorModel(hair.key, this.activeRole);
                    const reg = await this.preview.registerProduct(modelUrl);
                    const images =
                        hair.covers ? { cover: hair.covers } : hair.cover ? { cover: { all: hair.cover } } : null;
                    return {
                        item: { ...hair, images },
                        entry: {
                            key: hair.key,
                            name: hair.name || hair.game_name || hair.key,
                            domain: "hair",
                            cover: pickExteriorCover(images, this.activeRole),
                            rawImages: images,
                            modelUrl,
                            parts: reg.parts,
                        },
                    };
                } catch {
                    // 尝试下一个候选配套发型。
                }
            }
            return null;
        },
        async equipAtomicItem(item, options = {}) {
            const domain = item.domain || String(item.key).split("_")[0];
            const rawImages = item.images || (item.covers ? { cover: item.covers } : item.cover ? { cover: { all: item.cover } } : null);
            const cover = pickExteriorCover(rawImages, this.activeRole);
            const name = item.name || item.game_name || item.key;

            const actionSeq = ++this._actionSeq;
            this.actionProgressText = `正在装配「${name}」…`;
            this.actionProgressPercent = 12;

            try {
                if (domain === "expression") {
                    const url = item.url || getFaceExpressionUrl(this.activeRole, item.exprKey);
                    this.actionProgressPercent = 60;
                    this.faceExpressionLoop = false;
                    await this.preview.loadFaceExpression(url, { loop: false });
                    this.equippedExpression = { key: item.key, exprKey: item.exprKey, name, url };
                    return;
                }
                if (domain === "posture") {
                    const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                    this.actionProgressPercent = 55;
                    if (this.locomotion !== "idle") {
                        this.locomotion = "idle";
                        await this.preview.setLocomotion("idle");
                    }
                    if (this.hasWeaponEquipped && this.weaponStance !== "sheathed") {
                        await this.applyWeaponStance("sheathed", { keepPosture: true });
                    }
                    await this.preview.loadPosture(modelUrl);
                    this.equippedPosture = { key: item.key, name, cover, modelUrl };
                    this.recordCachedAndHistory({ ...item, images: rawImages });
                    return;
                }
                if (domain === "effect") {
                    const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                    this.actionProgressPercent = 55;
                    const effectInfo = await this.preview.loadProductEffect(modelUrl);
                    this.equippedEffect = { key: item.key, name, cover, modelUrl };
                    this.recordCachedAndHistory({ ...item, images: rawImages });
                    if (effectInfo?.hasFootprint && this.locomotion === "idle") {
                        await this.applyLocomotion("walk");
                    }
                    return;
                }

                const { modelUrl } = await getExteriorModel(item.key, this.activeRole);
                this.actionProgressPercent = 30;
                const reg = await this.preview.registerProduct(modelUrl);

                // 检查散件是否会被当前已穿戴整套成衣完全遮挡，避免用户点击后毫无反应。
                if (domain === "part" && reg.parts?.length) {
                    const activeOutfit = this.equippedItems.find((e) => e.domain === "outfit");
                    if (activeOutfit) {
                        const outfitSlots = new Set((activeOutfit.parts || []).map((p) => p.slot));
                        const outfitHidden = new Set((activeOutfit.parts || []).flatMap((p) => p.hide || []));
                        const anyVisible = reg.parts.some((p) => {
                            const normSlot = String(p.slot || "").replaceAll("_", "");
                            return outfitSlots.has(p.slot) || !outfitHidden.has(normSlot);
                        });
                        if (!anyVisible) {
                            ElMessage.warning(
                                `「${name}」会被当前成衣「${activeOutfit.name}」完全遮挡，请先卸下或更换套装`
                            );
                            return;
                        }
                    }
                }

                this.actionProgressPercent = 48;
                const filtered = this.equippedItems.filter(
                    (entry) =>
                        entry.key !== item.key &&
                        !(domain === "outfit" && entry.domain === "outfit") &&
                        !(domain === "hair" && entry.domain === "hair") &&
                        !(domain === "weapon" && entry.domain === "weapon")
                );
                const mainEntry = {
                    key: item.key,
                    name,
                    domain,
                    cover,
                    rawImages,
                    modelUrl,
                    parts: reg.parts,
                };
                filtered.push(mainEntry);

                // 穿戴整套成衣且当前未自选发型时，自动为玩家搭配同款原配发型。
                let pairedHair = null;
                if (domain === "outfit" && !options.skipAutoHair) {
                    pairedHair = await this.resolvePairedHairForOutfit(item.key, filtered);
                    if (pairedHair?.entry) {
                        filtered.push(pairedHair.entry);
                    }
                }

                await this.syncPartsToViewer((p) => {
                    if (actionSeq !== this._actionSeq) return;
                    this.actionProgressPercent = Math.max(
                        this.actionProgressPercent,
                        calcProgressPercent(p, 50)
                    );
                }, filtered);

                this.recordCachedAndHistory({ ...item, images: rawImages });
                if (pairedHair) {
                    this.recordCachedAndHistory(pairedHair.item);
                }

                if (domain === "weapon") {
                    const nextStance = this.equippedPosture ? "sheathed" : this.weaponStance;
                    await this.applyWeaponStance(nextStance, { keepPosture: Boolean(this.equippedPosture) });
                }
                if (reg.parts?.some((p) => p.petMount) || String(item.key || "").startsWith("pendant_")) {
                    this.activePetMode = "wear";
                    if (!this.petBehaviorsManifest) {
                        getPetBehaviorsManifest()
                            .then((manifest) => {
                                this.petBehaviorsManifest = manifest;
                            })
                            .catch(() => {});
                    }
                }
            } catch (err) {
                if (err?.code === 40301 || String(err?.message || "").includes("账号认证")) {
                    this.verifyChecked = true;
                    this.verifyRequired = true;
                    this.disposePreview();
                    return;
                }
                throw err;
            } finally {
                if (actionSeq === this._actionSeq) {
                    this.actionProgressText = "";
                    this.actionProgressPercent = 0;
                }
            }
        },
        async selectPetBehaviorMode(modeObj) {
            if (!this.preview || !modeObj) return;
            const prevMode = this.activePetMode;
            this.activePetMode = modeObj.mode;
            try {
                if (modeObj.mode === "wear") {
                    await this.preview.setPetPose({ mode: "wear" });
                } else {
                    await this.preview.setPetPose({
                        mode: modeObj.mode,
                        socket: modeObj.socket ?? null,
                        ground: Boolean(modeObj.ground),
                        scale: modeObj.scale ?? null,
                        clipUrl: resolvePetBehaviorClipUrl(modeObj.clip),
                    });
                }
            } catch (err) {
                this.activePetMode = prevMode;
                if (err?.name !== "AbortError") {
                    ElMessage.error(err?.message || "切换挂宠行为失败");
                }
            }
        },
        async unequipByKey(key) {
            if (!this.preview || this.busyKey) return;
            this.busyKey = key;
            try {
                if (this.equippedExpression?.key === key) {
                    await this.preview.loadFaceExpression(null);
                    this.equippedExpression = null;
                    this.faceExpressionLoop = false;
                    return;
                }
                if (this.equippedPosture?.key === key) {
                    await this.preview.loadPosture(null);
                    this.equippedPosture = null;
                    if (this.hasWeaponEquipped && this.weaponStance !== "sheathed") {
                        await this.applyWeaponStance(this.weaponStance);
                    }
                    return;
                }
                if (this.equippedEffect?.key === key) {
                    await this.preview.loadProductEffect(null);
                    this.equippedEffect = null;
                    return;
                }
                const wasWeapon = this.equippedItems.some(
                    (entry) =>
                        entry.key === key && (entry.domain === "weapon" || entry.parts?.some((p) => p.weaponMount))
                );
                const wasPet = this.equippedItems.some(
                    (entry) =>
                        entry.key === key &&
                        (entry.parts?.some((p) => p.petMount) || String(entry.key || "").startsWith("pendant_"))
                );
                const remaining = this.equippedItems.filter((entry) => entry.key !== key);
                await this.syncPartsToViewer(undefined, remaining);
                if (wasPet) {
                    this.activePetMode = "wear";
                    await this.preview.setPetPose(null).catch(() => {});
                }
                if (wasWeapon && !this.hasWeaponEquipped) {
                    if (this.locomotion !== "idle") {
                        await this.applyLocomotion(this.locomotion);
                    } else if (!this.equippedPosture) {
                        await this.preview.loadAnimation(null).catch(() => {});
                    }
                }
            } finally {
                this.busyKey = "";
            }
        },
        async clearAllEquipped() {
            if (!this.preview || this.busyKey) return;
            this.busyKey = "__clear_all__";
            try {
                if (this.equippedExpression) {
                    await this.preview.loadFaceExpression(null).catch(() => {});
                    this.equippedExpression = null;
                    this.faceExpressionLoop = false;
                }
                if (this.equippedPosture) {
                    await this.preview.loadPosture(null);
                    this.equippedPosture = null;
                }
                if (this.equippedEffect) {
                    await this.preview.loadProductEffect(null);
                    this.equippedEffect = null;
                }
                this.locomotion = "idle";
                await this.preview.setLocomotion("idle").catch(() => {});
                this.activePetMode = "wear";
                await this.preview.setPetPose(null).catch(() => {});
                await this.preview.loadAnimation(null).catch(() => {});
                await this.syncPartsToViewer(undefined, []);
            } finally {
                this.busyKey = "";
            }
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
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    pointer-events: none;

    > * {
        pointer-events: auto;
    }
}

.m-topbar-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    max-width: 100%;

    :deep(.el-button) {
        height: 32px;
        padding: 0 13px;
        margin-left: 0;
        font-size: 12px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: @pvx-radius-pill;
    }
}

.m-role-pills,
.m-view-pills,
.m-locomotion-pills,
.m-weapon-pills {
    display: inline-flex;
    align-items: center;
    height: 32px;
    box-sizing: border-box;
    gap: 3px;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.68);
    backdrop-filter: blur(8px);
}

.u-pill-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 26px;
    padding: 0 11px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: transparent;
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
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

.m-topbar-row > .u-pill-btn {
    height: 32px;
    padding: 0 12px;
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

.m-topbar-row > .u-expr-replay-btn {
    gap: 5px;
}

.m-topbar-row > .u-skill-teaser-btn {
    gap: 5px;
    color: #e0e7ff;
    background: linear-gradient(135deg, rgba(67, 56, 202, 0.44), rgba(15, 23, 42, 0.72));
    box-shadow: 0 0 0 1px rgba(165, 180, 252, 0.34) inset;

    &:hover:not(:disabled) {
        background: linear-gradient(135deg, rgba(79, 70, 229, 0.64), rgba(30, 41, 59, 0.88));
        box-shadow: 0 0 0 1px rgba(199, 210, 254, 0.56) inset;
        color: #fff;
    }
}

.u-stage-select {
    width: 124px;

    :deep(.el-select__wrapper) {
        height: 32px;
        min-height: 32px;
        box-sizing: border-box;
        padding: 0 11px;
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
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 240px;
    padding: 12px 18px;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.88);
    color: #fff;
    font-size: 13px;
    font-weight: 500;
    box-shadow: 0 12px 28px rgba(15, 23, 42, 0.28);

    .m-loader-head {
        display: flex;
        align-items: center;
        gap: 10px;
    }

    .u-spinner {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: studio-spin 0.8s linear infinite;
    }
}

.m-action-progress {
    position: absolute;
    right: 14px;
    top: 94px;
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 220px;
    padding: 8px 14px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.82);
    backdrop-filter: blur(8px);
    color: #f8fafc;
    font-size: 12px;
    font-weight: 500;
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22);
    pointer-events: none;

    .m-action-head {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .u-spinner {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
        border: 2px solid rgba(255, 255, 255, 0.25);
        border-top-color: #a5b4fc;
        border-radius: 50%;
        animation: studio-spin 0.8s linear infinite;
    }
}

.u-loader-pct {
    margin-left: auto;
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: #a5b4fc;
}

.u-loader-bar {
    width: 100%;
    height: 4px;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.16);
    overflow: hidden;
}

.u-loader-fill {
    height: 100%;
    border-radius: @pvx-radius-pill;
    background: linear-gradient(90deg, #6366f1 0%, #38bdf8 100%);
    transition: width 0.18s ease-out;
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

.m-gate-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
}

.m-immersive-exit {
    position: absolute;
    top: 14px;
    right: 14px;
    z-index: 6;
    padding: 7px 14px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.56);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
    backdrop-filter: blur(8px);
    color: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        background: rgba(15, 23, 42, 0.85);
    }
}

.m-stage-docks {
    position: absolute;
    left: 14px;
    bottom: 14px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    max-width: min(64%, 560px);
}

.m-pet-dock {
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.72);
    backdrop-filter: blur(8px);
    color: #f8fafc;

    &__label {
        font-size: 11px;
        font-weight: 700;
        color: #cbd5e1;
        margin-right: 2px;
    }

    &__pills {
        display: inline-flex;
        flex-wrap: wrap;
        gap: 4px;
    }
}

.u-pet-mode-btn {
    padding: 4px 10px;
    border: none;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.12);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.14s;

    &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.22);
        color: #ffffff;
    }

    &.is-active {
        background: @pvx-primary;
        color: #ffffff;
    }

    &:disabled {
        opacity: 0.5;
        cursor: wait;
    }
}

.m-worn-dock {
    width: 100%;
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
