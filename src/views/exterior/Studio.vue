<!-- 自由试衣间：仿剑网三商城的三栏交互结构（左侧多级分类导航、中间商品/体型/捏脸抽屉、右侧 65%+ 全高 3D 试穿舞台），支持礼盒一键穿戴、多槽位自动替换与遮挡、写意/写实双体系捏脸、体型参数微调、高清 PNG 拍照与分享链接。 -->
<template>
    <div
        ref="studioRootRef"
        class="m-ext-studio"
        :class="{
            'is-fullscreen': isFullscreen,
            'is-viewport-fullscreen': isViewportFullscreen,
            'is-immersive': immersiveMode,
            'is-sidebar-collapsed': sidebarCollapsed,
            'is-drawer-collapsed': drawerCollapsed,
        }"
    >
        <div ref="stageContainerRef" class="m-studio-shell">
            <!-- 左侧分类栏 -->
            <aside v-show="!immersiveMode && !sidebarCollapsed" class="m-studio-nav" :aria-label="$t('exteriorStudio.nav')">
                <button type="button" class="u-nav-back" @click="goBack">
                    <el-icon><ArrowLeft /></el-icon>
                    <span>{{ $t('exteriorStudio.back') }}</span>
                </button>

                <nav class="m-nav-list">
                    <button
                        v-for="item in menuItems"
                        :key="item.id"
                        type="button"
                        class="u-nav-btn"
                        :class="{ 'is-active': activeMenuId === item.id }"
                        :title="activeMenuId === item.id ? (drawerCollapsed ? $t('exteriorStudio.expandList') : $t('exteriorStudio.clickCollapse')) : $t(item.labelKey)"
                        @click="selectMenu(item.id)"
                    >
                        <el-icon class="u-nav-icon"><component :is="item.icon" /></el-icon>
                        <span>{{ navItemLabel(item) }}</span>
                    </button>
                </nav>

                <button
                    type="button"
                    class="u-nav-collapse-btn"
                    :title="$t('exteriorStudio.collapseBoth')"
                    @click="toggleSidebarCollapsed(true)"
                >
                    <el-icon><DArrowLeft /></el-icon>
                    <span>{{ $t('exteriorStudio.collapseSide') }}</span>
                </button>
            </aside>

            <!-- 中间商品格 / 体型 / 捏脸编辑抽屉 -->
            <section
                v-show="!immersiveMode && !sidebarCollapsed && !drawerCollapsed"
                class="m-studio-drawer"
                :aria-label="$t('exteriorStudio.customize')"
            >
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
                    :teleport-target="popoverTeleportTarget"
                    @select="onToggleCatalogItem"
                    @wear-related="onWearRelatedItem"
                />
            </section>

            <!-- 右侧 3D 实时试穿舞台（占 65%+ 宽度） -->
            <main class="m-studio-stage" :class="`is-bg-${skybox}`" :aria-label="$t('exteriorStudio.stage')">
                <button
                    v-if="!immersiveMode"
                    type="button"
                    class="m-stage-panel-tab"
                    :class="{ 'is-collapsed': sidebarCollapsed || drawerCollapsed, 'is-both-collapsed': sidebarCollapsed }"
                    :title="panelTabTitle"
                    :aria-label="panelTabTitle"
                    @click="onPanelTabClick"
                >
                    <el-icon>
                        <DArrowRight v-if="sidebarCollapsed" />
                        <ArrowRight v-else-if="drawerCollapsed" />
                        <ArrowLeft v-else />
                    </el-icon>
                    <span v-if="sidebarCollapsed" class="u-panel-tab-label">{{ $t('exteriorStudio.expandSide') }}</span>
                </button>

                <!-- 登录门禁 -->
                <div v-if="!loggedIn" class="m-stage-gate">
                    <div class="m-gate-card">
                        <span class="u-gate-pill">{{ $t('exteriorStudio.room') }}</span>
                        <h2>{{ $t('exteriorStudio.loginTitle') }}</h2>
                        <p>{{ $t('exteriorStudio.loginDesc') }}</p>
                        <el-button type="primary" round size="large" @click="login">
                            {{ $t("exterior.modelLogin") }}
                        </el-button>
                    </div>
                </div>

                <!-- 账号认证门禁 -->
                <div v-else-if="verifyRequired" class="m-stage-gate">
                    <div class="m-gate-card">
                        <span class="u-gate-pill">{{ $t('exteriorStudio.verification') }}</span>
                        <h2>{{ $t('exteriorStudio.verifyTitle') }}</h2>
                        <p>{{ $t('exteriorStudio.verifyDesc') }}</p>
                        <div class="m-gate-actions">
                            <el-button type="primary" round size="large" @click="goVerifyAuth">
                                {{ $t('exteriorStudio.verify') }}
                            </el-button>
                            <el-button round size="large" @click="recheckVerifyStatus">
                                {{ $t('exteriorStudio.recheck') }}
                            </el-button>
                        </div>
                    </div>
                </div>

                <template v-else>
                    <canvas
                        ref="canvasRef"
                        :key="canvasKey"
                        class="m-stage-canvas"
                        :class="{ 'is-ready': stageReady && !stageLoading && !stageError }"
                        :aria-label="$t('exteriorStudio.canvas')"
                    />

                    <button
                        v-if="immersiveMode"
                        type="button"
                        class="m-immersive-exit"
                        @click="toggleImmersive(false)"
                    >
                        {{ $t('exteriorStudio.exitImmersive') }}
                    </button>

                    <!-- 顶部悬浮控制条 -->
                    <header v-show="!immersiveMode" class="m-stage-topbar">
                        <div class="m-role-pills" role="group" :aria-label="$t('exteriorStudio.switchBody')">
                            <button
                                v-for="b in bodyTypes"
                                :key="b.id"
                                type="button"
                                class="u-pill-btn"
                                :class="{ 'is-active': activeRole === b.id }"
                                :disabled="stageLoading"
                                @click="selectRole(b.id)"
                            >
                                {{ $t('exterior.bodyTypes.' + b.key) }}
                            </button>
                        </div>

                        <div class="m-view-pills" role="group" :aria-label="$t('exteriorStudio.camera')">
                            <button
                                v-for="v in viewPresets"
                                :key="v.value"
                                type="button"
                                class="u-pill-btn"
                                :class="{ 'is-active': activeView === v.value }"
                                @click="selectCameraView(v.value)"
                            >
                                {{ $t(v.labelKey) }}
                            </button>
                        </div>

                        <div class="m-stage-playback" role="group" :aria-label="$t('exteriorStudio.playback')">
                            <button type="button" class="u-pill-btn u-stage-play-toggle" @click="togglePlaying">
                                {{ playing ? $t('exteriorStudio.pause') : $t('exteriorStudio.play') }}
                            </button>
                            <el-dropdown
                                trigger="hover"
                                placement="bottom-start"
                                :append-to="popoverTeleportTarget"
                                :disabled="stageLoading"
                                :show-arrow="false"
                                @command="selectLocomotion"
                            >
                                <button
                                    type="button"
                                    class="u-pill-btn u-stage-locomotion"
                                    :aria-label="$t('exteriorStudio.movementNamed', { name: locomotionLabel })"
                                    :disabled="stageLoading"
                                >
                                    <el-icon aria-hidden="true"><ArrowDown /></el-icon>
                                </button>
                                <template #dropdown>
                                    <el-dropdown-menu class="m-stage-locomotion-menu" :aria-label="$t('exteriorStudio.movement')">
                                        <el-dropdown-item
                                            v-for="loc in locomotionModes"
                                            :key="loc.value"
                                            :command="loc.value"
                                            :aria-current="locomotion === loc.value ? 'true' : undefined"
                                        >
                                            {{ $t(loc.labelKey) }}
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>

                        <div class="m-topbar-actions">
                            <el-popover
                                v-model:visible="stageMoreOpen"
                                trigger="click"
                                placement="bottom-end"
                                width="min(320px, calc(100vw - 32px))"
                                :append-to="popoverTeleportTarget"
                                :show-arrow="false"
                                popper-class="m-studio-more-popper"
                                @after-enter="focusStageMore"
                            >
                                <template #reference>
                                    <span class="m-stage-tooltip-anchor">
                                        <el-tooltip
                                            :content="$t('exteriorStudio.moreSettings')"
                                            :disabled="stageMoreOpen"
                                            :trigger-keys="[]"
                                            :append-to="popoverTeleportTarget"
                                        >
                                            <button
                                                ref="stageMoreButtonRef"
                                                type="button"
                                                class="u-pill-btn u-stage-tool"
                                                :aria-label="$t('exteriorStudio.moreSettings')"
                                                :aria-expanded="stageMoreOpen"
                                            >
                                                <el-icon aria-hidden="true"><MoreFilled /></el-icon>
                                            </button>
                                        </el-tooltip>
                                    </span>
                                </template>

                                <div class="m-stage-more">
                                    <section class="m-stage-more__group">
                                        <h3>{{ $t('exteriorStudio.actions') }}</h3>
                                        <div class="m-stage-more__actions">
                                            <button
                                                ref="stageMoreFirstControlRef"
                                                type="button"
                                                class="u-pill-btn u-skill-teaser-btn"
                                                :title="$t('exteriorStudio.skillsComing')"
                                                @click="onSkillActionTeaser"
                                            >
                                                <el-icon><MagicStick /></el-icon>
                                                <span>{{ $t('exteriorStudio.skillAction') }}</span>
                                            </button>

                                            <button
                                                v-if="equippedExpression"
                                                type="button"
                                                class="u-pill-btn u-expr-replay-btn"
                                                :class="{ 'is-active': faceExpressionLoop }"
                                                :title="
                                                    faceExpressionLoop
                                                        ? $t('exteriorStudio.loopHint')
                                                        : $t('exteriorStudio.replayHint')
                                                "
                                                @click="replayFaceExpression"
                                                @dblclick.prevent="toggleFaceExpressionLoop"
                                            >
                                                <el-icon><RefreshRight /></el-icon>
                                                <span>{{ faceExpressionLoop ? $t('exteriorStudio.replayLoop') : $t('exteriorStudio.replay') }}</span>
                                            </button>
                                        </div>
                                        <div v-if="hasWeaponEquipped" class="m-weapon-pills" role="group" :aria-label="$t('exteriorStudio.weaponPose')">
                                            <button
                                                v-for="st in weaponStances"
                                                :key="st.value"
                                                type="button"
                                                class="u-pill-btn"
                                                :class="{ 'is-active': weaponStance === st.value }"
                                                @click="selectWeaponStance(st.value)"
                                            >
                                                {{ $t(st.labelKey) }}
                                            </button>
                                        </div>
                                    </section>

                                    <section class="m-stage-more__group">
                                        <div class="m-stage-more__settings">
                                            <div class="m-stage-more__setting">
                                                <label for="studio-stage-scene">{{ $t('exteriorStudio.scene') }}</label>
                                                <el-select
                                                    id="studio-stage-scene"
                                                    v-model="skybox"
                                                    size="small"
                                                    class="u-stage-select"
                                                    :aria-label="$t('exteriorStudio.scene')"
                                                    :teleported="false"
                                                    @change="onSkyboxChange"
                                                >
                                                    <el-option
                                                        v-for="bg in skyboxes"
                                                        :key="bg.value"
                                                        :label="$t(bg.labelKey)"
                                                        :value="bg.value"
                                                    />
                                                </el-select>
                                            </div>

                                            <div class="m-stage-more__setting">
                                                <label for="studio-stage-quality">{{ $t('exteriorStudio.quality') }}</label>
                                                <el-select
                                                    id="studio-stage-quality"
                                                    v-model="quality"
                                                    size="small"
                                                    class="u-stage-select"
                                                    :aria-label="$t('exteriorStudio.quality')"
                                                    :teleported="false"
                                                    @change="onQualityChange"
                                                >
                                                    <el-option :label="$t('exteriorStudio.auto')" value="auto" />
                                                    <el-option :label="$t('exteriorStudio.high')" value="high" />
                                                    <el-option :label="$t('exteriorStudio.medium')" value="medium" />
                                                    <el-option :label="$t('exteriorStudio.low')" value="low" />
                                                </el-select>
                                            </div>
                                        </div>
                                    </section>

                                    <section class="m-stage-more__group">
                                        <h3>{{ $t('exteriorStudio.look') }}</h3>
                                        <div class="m-stage-more__actions">
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
                                        </div>
                                    </section>
                                </div>
                            </el-popover>
                        </div>
                        <div class="m-topbar-display" role="group" :aria-label="$t('exteriorStudio.display')">
                            <el-tooltip :content="$t('exteriorStudio.immersive')" :trigger-keys="[]" :append-to="popoverTeleportTarget">
                                <button
                                    type="button"
                                    class="u-pill-btn u-stage-tool"
                                    :aria-label="$t('exteriorStudio.immersive')"
                                    @click="toggleImmersive(true)"
                                >
                                    <el-icon aria-hidden="true"><View /></el-icon>
                                </button>
                            </el-tooltip>
                            <el-tooltip
                                :content="isFullscreen ? $t('exteriorStudio.exitFull') : $t('exteriorStudio.full')"
                                :trigger-keys="[]"
                                :append-to="popoverTeleportTarget"
                            >
                                <button
                                    type="button"
                                    class="u-pill-btn u-stage-tool"
                                    :class="{ 'is-active': isFullscreen }"
                                    :aria-label="isFullscreen ? $t('exteriorStudio.exitFull') : $t('exteriorStudio.full')"
                                    @click="toggleFullscreen"
                                >
                                    <el-icon aria-hidden="true"><FullScreen /></el-icon>
                                </button>
                            </el-tooltip>
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
                            <h4>{{ $t('exteriorStudio.stageError') }}</h4>
                            <p>{{ stageError }}</p>
                            <el-button type="primary" round size="small" @click="reloadStage">{{ $t('exteriorStudio.reload') }}</el-button>
                        </div>
                    </div>

                    <div v-if="!immersiveMode && wornCapsules.length" class="m-worn-dock">
                        <button
                            type="button"
                            class="m-worn-dock__toggle"
                            :aria-expanded="wornDockOpen"
                            aria-controls="studio-worn-list"
                            @click="wornDockOpen = !wornDockOpen"
                        >
                            {{ $t('exteriorStudio.wornCount', { count: wornCapsules.length }) }}
                            <el-icon :class="{ 'is-expanded': wornDockOpen }" aria-hidden="true"><ArrowDown /></el-icon>
                        </button>
                        <ul
                            v-show="wornDockOpen"
                            id="studio-worn-list"
                            class="m-worn-dock__list"
                            :aria-label="$t('exteriorStudio.wornList')"
                        >
                            <li v-for="entry in wornCapsules" :key="entry.key" class="u-worn-capsule">
                                <img v-if="entry.cover" :src="entry.cover" alt="" class="u-cap-thumb" />
                                <router-link
                                    v-if="entry.linkable !== false"
                                    :to="{ name: 'exterior-list', query: { id: entry.key } }"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="u-cap-name"
                                    :title="$t('exteriorStudio.detailsNamed', { name: entry.name })"
                                >
                                    {{ entry.name }}
                                </router-link>
                                <span v-else class="u-cap-name" :title="entry.name">{{ entry.name }}</span>
                                <span class="u-cap-tag">{{ entry.badge }}</span>
                                <button
                                    type="button"
                                    class="u-cap-remove"
                                    :aria-label="$t('exteriorStudio.removeNamed', { name: entry.name })"
                                    @click="unequipByKey(entry.key)"
                                >
                                    <el-icon><Close /></el-icon>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <div v-show="!immersiveMode" class="m-stage-footer">
                        <div class="m-stage-footer__left">
                            <div v-if="petBehaviorModes.length > 1" class="m-pet-dock" :aria-label="$t('exteriorStudio.switchPet')">
                                <span class="m-pet-dock__label">{{ $t('exteriorStudio.petPose') }}</span>
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
                                        {{ petPoseLabel($t, modeObj.label) }}
                                    </button>
                                </div>
                            </div>
                            <ExteriorStageHint>{{ $t('exteriorStudio.stageHint') }}</ExteriorStageHint>
                        </div>
                        <el-tooltip
                            :content="$t('exterior.studio.capture')"
                            placement="top"
                            :trigger-keys="[]"
                            :append-to="popoverTeleportTarget"
                        >
                            <el-button
                                type="primary"
                                circle
                                class="u-stage-capture"
                                :aria-label="$t('exterior.studio.capture')"
                                :loading="capturing"
                                :disabled="!stageReady"
                                @click="captureSnapshot"
                            >
                                <template #icon><Camera aria-hidden="true" /></template>
                            </el-button>
                        </el-tooltip>
                    </div>
                </template>
            </main>
        </div>
    </div>
</template>

<script>
import {
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    Brush,
    Camera,
    Clock,
    Close,
    DArrowLeft,
    DArrowRight,
    Delete,
    FullScreen,
    MagicStick,
    MoreFilled,
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
import ExteriorStageHint from "@/components/exterior/ExteriorStageHint.vue";
import StudioBodyEditor from "@/components/exterior/studio/StudioBodyEditor.vue";
import StudioCatalogGrid from "@/components/exterior/studio/StudioCatalogGrid.vue";
import StudioFaceEditor from "@/components/exterior/studio/StudioFaceEditor.vue";
import { extractStudioGraphRelations } from "@/components/exterior/studio/StudioItemHoverPopover.vue";
import { expressionLabel, petPoseLabel } from "@/components/exterior/studio/studio-labels";
import { STUDIO_MENU, STUDIO_SKYBOXES } from "@/components/exterior/studio/studio-menu";
import { localizedExteriorLabel, BODY_LABEL_MAP, BODY_TYPES, DOMAIN_META, pickExteriorCover } from "@/components/exterior/meta";
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
        ArrowDown,
        ArrowLeft,
        ArrowRight,
        Brush,
        Camera,
        Clock,
        Close,
        DArrowLeft,
        DArrowRight,
        Delete,
        ExteriorStageHint,
        FullScreen,
        MagicStick,
        MoreFilled,
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
            stageMoreOpen: false,
            wornDockOpen: !window.matchMedia("(max-width: 720px)").matches,
            menuItems: STUDIO_MENU,
            activeMenuId: "outfit",
            bodyTypes: BODY_TYPES,
            skyboxes: STUDIO_SKYBOXES,
            viewPresets: [
                { value: "front", labelKey: "exteriorStudio.front" },
                { value: "back", labelKey: "exteriorStudio.backView" },
                { value: "face", labelKey: "exteriorStudio.faceView" },
            ],
            locomotionModes: [
                { value: "idle", labelKey: "exteriorStudio.idle" },
                { value: "walk", labelKey: "exteriorStudio.walk" },
                { value: "run", labelKey: "exteriorStudio.run" },
            ],
            weaponStances: [
                { value: "sheathed", labelKey: "exteriorStudio.sheathed" },
                { value: "unsheathed", labelKey: "exteriorStudio.unsheathed" },
                { value: "fight", labelKey: "exteriorStudio.fight" },
            ],
            explicitRole: initRole,
            preserveCatalogRole: this.$router.options.history.state.preserveCatalogRole === true,
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
            isNativeFullscreen: false,
            isViewportFullscreen: false,
            sidebarCollapsed: false,
            drawerCollapsed: false,
            canvasKey: 0,
            needsFreshCanvas: false,

            preview: null,
            baseParts: [],
            stageLoading: false,
            stageReady: false,
            stageError: "",
            stageProgressText: this.$t('exteriorStudio.initStage'),
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
        locomotionLabel() {
            return this.$t('exteriorStudio.' + this.locomotion);
        },
        isFullscreen() {
            return this.isNativeFullscreen || this.isViewportFullscreen;
        },
        popoverTeleportTarget() {
            return this.isNativeFullscreen && this.$refs.studioRootRef ? this.$refs.studioRootRef : "body";
        },
        panelTabTitle() {
            if (this.sidebarCollapsed) return this.$t('exteriorStudio.expandNavList');
            return this.drawerCollapsed ? this.$t('exteriorStudio.expandListPanel') : this.$t('exteriorStudio.collapseListPanel');
        },
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
                badge: localizedExteriorLabel(this.$t, DOMAIN_META[entry.domain]?.label || entry.domain),
            }));
            if (this.equippedPosture) {
                list.push({
                    key: this.equippedPosture.key,
                    name: this.equippedPosture.name,
                    cover: this.equippedPosture.cover,
                    badge: this.$t('exterior.domains.posture'),
                });
            }
            if (this.equippedEffect) {
                list.push({
                    key: this.equippedEffect.key,
                    name: this.equippedEffect.name,
                    cover: this.equippedEffect.cover,
                    badge: this.$t('exterior.domains.effect'),
                });
            }
            if (this.equippedExpression) {
                list.push({
                    key: this.equippedExpression.key,
                    name: expressionLabel(this.$t, this.equippedExpression.exprKey, this.equippedExpression.name),
                    cover: "",
                    badge: this.$t('exteriorStudio.expression'),
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
        if (this.explicitRole && !this.preserveCatalogRole) {
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
        petPoseLabel,
        navItemLabel(item) {
            const key = `exteriorStudio.navLabels.${item.id}`;
            return this.$te(key) ? this.$t(key) : this.$t(item.labelKey);
        },
        goBack() {
            const { back } = this.$router.options.history.state;
            const previousRoute = typeof back === "string" ? this.$router.resolve(back) : null;
            if (previousRoute?.matched.length && previousRoute.name !== "exterior-studio") {
                this.$router.back();
                return;
            }
            this.$router.replace({ name: "exterior-list" });
        },
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
                ElMessage.warning(this.$t('exteriorStudio.unverified'));
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
            this.stageMoreOpen = false;
            this.immersiveMode = Boolean(active);
        },
        focusStageMore() {
            if (this.stageMoreOpen) this.$refs.stageMoreFirstControlRef?.focus({ preventScroll: true });
        },
        closeStageMore() {
            this.stageMoreOpen = false;
            this.$refs.stageMoreButtonRef?.focus({ preventScroll: true });
        },
        onStageKeydown(event) {
            if (event.key !== "Escape") return;
            if (this.stageMoreOpen) {
                this.closeStageMore();
                return;
            }
            if (this.immersiveMode) {
                this.immersiveMode = false;
                return;
            }
            if (this.isViewportFullscreen) {
                this.isViewportFullscreen = false;
            }
        },
        selectMenu(id) {
            if (this.activeMenuId === id) {
                this.drawerCollapsed = !this.drawerCollapsed;
                return;
            }
            this.activeMenuId = id;
            this.drawerCollapsed = false;
        },
        toggleSidebarCollapsed(force) {
            const next = typeof force === "boolean" ? force : !this.sidebarCollapsed;
            this.sidebarCollapsed = next;
            if (!next) this.drawerCollapsed = false;
        },
        onPanelTabClick() {
            if (this.sidebarCollapsed) {
                this.sidebarCollapsed = false;
                this.drawerCollapsed = false;
            } else {
                this.drawerCollapsed = !this.drawerCollapsed;
            }
        },
        onFullscreenChange() {
            this.isNativeFullscreen = document.fullscreenElement === this.$refs.studioRootRef;
            if (this.isNativeFullscreen) this.isViewportFullscreen = false;
        },
        async toggleFullscreen() {
            this.stageMoreOpen = false;
            const el = this.$refs.studioRootRef;
            if (!el) return;
            if (this.isNativeFullscreen) {
                try {
                    await document.exitFullscreen();
                } catch {
                    this.isNativeFullscreen = false;
                }
                return;
            }
            if (this.isViewportFullscreen) {
                this.isViewportFullscreen = false;
                return;
            }
            if (typeof el.requestFullscreen === "function") {
                try {
                    await el.requestFullscreen();
                    return;
                } catch {
                    // 原生全屏被浏览器拦截时无缝回退到整窗铺满模式。
                }
            }
            this.isViewportFullscreen = true;
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
                ? this.$t('exteriorStudio.switchWeaponMove', { name: this.locomotionLabel })
                : this.$t('exteriorStudio.switchWeapon', { name: this.$t('exteriorStudio.' + validStance) });
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
                    ElMessage.error(err?.message || this.$t('exteriorStudio.weaponFailed'));
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
            this.actionProgressText = this.$t('exteriorStudio.moveNamed', { name: this.$t('exteriorStudio.' + validMode) });
            this.actionProgressPercent = 40;
            try {
                await this.preview.loadAnimation(clipUrl);
                await this.preview.setLocomotion(validMode);
                if (actionSeq === this._actionSeq) {
                    this.actionProgressPercent = 100;
                }
            } catch (err) {
                if (err?.name !== "AbortError") {
                    ElMessage.error(err?.message || this.$t('exteriorStudio.moveFailed'));
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
            ElMessage.info(this.$t('exteriorStudio.skillsNotice'));
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
                    ? this.$t('exteriorStudio.loopEnabled')
                    : this.$t('exteriorStudio.loopDisabled')
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
            if (!res?.modelUrl) throw new Error(this.$t('exteriorStudio.missingBase'));
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
                    ? this.$t('exteriorStudio.prepReal', { body: localizedExteriorLabel(this.$t, BODY_LABEL_MAP[this.activeRole]) })
                    : this.$t('exteriorStudio.prepBody', { body: localizedExteriorLabel(this.$t, BODY_LABEL_MAP[this.activeRole]) });

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

                const rawWear =
                    !this.preview && !this.initialWearApplied && this.$route.query.wear
                        ? String(this.$route.query.wear)
                        : "";
                const [baseUrl, initialPlan] = await Promise.all([
                    this.resolveBaseModelUrl(),
                    rawWear ? this.resolveInitialWearPlan(rawWear) : Promise.resolve(null),
                ]);
                if (seq !== this.stageSeq) return;
                this.stageProgressPercent = Math.max(this.stageProgressPercent, 14);

                const onProgress = (p) => {
                    if (seq !== this.stageSeq) return;
                    if (p?.phase === "parts") this.stageProgressText = this.$t('exteriorStudio.loadTextures');
                    else if (p?.phase === "finalizing") this.stageProgressText = this.$t('exteriorStudio.applyEffects');
                    this.stageProgressPercent = Math.max(
                        this.stageProgressPercent,
                        calcProgressPercent(p, 14)
                    );
                };

                let directWearApplied = false;
                const directMeshItems = initialPlan?.meshItems || [];
                if (this.preview) {
                    await this.preview.load(baseUrl, {
                        view: this.activeView,
                        playing: this.playing,
                        onProgress,
                    });
                } else {
                    const createOptions = (useDirectWear) => {
                        const opts = {
                            modelUrl: useDirectWear ? directMeshItems[0].modelUrl : baseUrl,
                            quality: this.quality,
                            view: this.activeView,
                            playing: this.playing,
                            transparent: true,
                            background: null,
                            onProgress,
                            onError: (err) => {
                                if (seq === this.stageSeq) {
                                    this.preview = null;
                                    this.stageReady = false;
                                    this.stageError = err?.message || this.$t('exteriorStudio.renderFailed');
                                    this.stageLoading = false;
                                }
                            },
                        };
                        if (useDirectWear) {
                            opts.baseUrl = baseUrl;
                            if (directMeshItems.length > 1) {
                                opts.attachments = directMeshItems.slice(1).map((entry) => entry.modelUrl);
                            }
                        }
                        return opts;
                    };
                    // 每次重建挂载全新的 OffscreenCanvas 所有权，避免切换画质二次转移报错。
                    this.needsFreshCanvas = true;
                    if (directMeshItems.length) {
                        try {
                            this.preview = await createWorkerPreview(this.$refs.canvasRef, createOptions(true));
                            directWearApplied = true;
                        } catch (wearErr) {
                            if (
                                seq !== this.stageSeq ||
                                wearErr?.code === 40301 ||
                                String(wearErr?.message || "").includes("账号认证")
                            ) {
                                throw wearErr;
                            }
                            // 初始指定外观加载失败时回退到基础模型，避免首屏阻塞。
                            this.canvasKey += 1;
                            await this.$nextTick();
                            if (seq !== this.stageSeq || !this.$refs.canvasRef) return;
                            this.preview = await createWorkerPreview(this.$refs.canvasRef, createOptions(false));
                        }
                    } else {
                        this.preview = await createWorkerPreview(this.$refs.canvasRef, createOptions(false));
                    }
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

                // 若 URL 携带初始 wear 参数且尚未解析，优先直载入身；否则重新装配现有搭配。
                const pendingRawWear = !this.initialWearApplied && this.$route.query.wear ? String(this.$route.query.wear) : "";
                this.initialWearApplied = true;
                if (directWearApplied && initialPlan) {
                    await this.finalizeDirectInitialWear(initialPlan);
                } else if (pendingRawWear) {
                    await this.equipKeysFromQuery(pendingRawWear);
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
                this.stageError = err?.message || this.$t('exteriorStudio.initFailed');
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
            if (!this.preserveCatalogRole) {
                this.$store.commit("setPreferredRole", { role: nextRole, persist: true });
            }
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
            this.actionProgressText = this.$t('exteriorStudio.applyingNamed', { name: req.label || this.$t('exteriorStudio.facePreset') });
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
                    ElMessage.info(this.$t('exteriorStudio.partialFace', { name: req.label || this.$t('exteriorStudio.facePreset'), count: unapplied }));
                } else {
                    ElMessage.success(this.$t('exteriorStudio.appliedNamed', { name: req.label || this.$t('exteriorStudio.facePreset') }));
                }
                return true;
            } catch (err) {
                if (err?.name === "AbortError" || seq !== this._faceSeq) return false;
                ElMessage.error(err?.message || this.$t('exteriorStudio.applyFaceFailed'));
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
                ElMessage.error(err?.message || this.$t('exteriorStudio.wearFailed', { name: item.name || item.key }));
            } finally {
                this.busyKey = "";
            }
        },
        extractBundleTargetSpecs(bundleKey, detail, graph) {
            const edges = [];
            const seen = new Set();
            for (const edge of [...(detail?.relations || []), ...(graph?.edges || [])]) {
                if (!edge?.from_key || !edge?.to_key) continue;
                const sig = `${edge.from_key}|${edge.to_key}|${edge.kind || ""}`;
                if (seen.has(sig)) continue;
                seen.add(sig);
                edges.push(edge);
            }
            const directKeys = [];
            const directSet = new Set();
            for (const edge of edges) {
                if (!["contains", "package_link", "wrapped_outfit"].includes(edge.kind)) continue;
                let other = "";
                if (edge.from_key === bundleKey) other = edge.to_key;
                else if (edge.to_key === bundleKey) other = edge.from_key;
                if (!other || other === bundleKey || directSet.has(other)) continue;
                const domain = String(other).split("_")[0];
                if (domain !== "bundle" && EQUIPABLE_DOMAINS.has(domain)) {
                    directSet.add(other);
                    directKeys.push(other);
                }
            }
            const hasDirectOutfit = directKeys.some((k) => k.startsWith("outfit_"));
            const specs = [];
            const pushedKeys = new Set();
            const pushSpec = (key, fallbackKey = "") => {
                if (!key || pushedKeys.has(key)) return;
                pushedKeys.add(key);
                specs.push({ key, fallbackKey });
            };
            // 礼盒常通过 package_link -> part <- contains -- outfit 关联成衣；无直连成衣时优先还原完整成衣模型，失败再回退散件。
            for (const key of directKeys) {
                if (!hasDirectOutfit && key.startsWith("part_")) {
                    const parentOutfit = edges.find(
                        (e) =>
                            e.kind === "contains" &&
                            e.to_key === key &&
                            String(e.from_key).startsWith("outfit_")
                    )?.from_key;
                    if (parentOutfit) {
                        pushSpec(parentOutfit, key);
                        continue;
                    }
                }
                pushSpec(key);
            }
            const priority = { outfit: 0, hair: 1, part: 2, pendant: 3, weapon: 4, posture: 5, effect: 6 };
            specs.sort((a, b) => (priority[a.key.split("_")[0]] ?? 9) - (priority[b.key.split("_")[0]] ?? 9));
            return specs;
        },
        async resolveInitialWearPlan(rawWear) {
            const keys = rawWear
                .split(",")
                .map((s) => s.trim())
                .filter((s) => /^(bundle|outfit|part|hair|pendant|weapon|effect|posture)_\d+$/.test(s));
            if (!keys.length) return null;
            const role = this.activeRole;
            const isAuthError = (err) =>
                err?.code === 40301 || String(err?.message || "").includes("账号认证");
            const hasExplicitHair = keys.some((k) => k.startsWith("hair_"));
            const meshDomains = new Set(["outfit", "part", "hair", "pendant", "weapon"]);

            // 并行拉取商品详情、模型地址与套装配套关系，将初始直载收敛至最少网络往返。
            const rawResults = await Promise.all(
                keys.map(async (key) => {
                    const domain = key.split("_")[0];
                    const detailPromise = getExteriorsDetail(key).catch((err) => {
                        if (isAuthError(err)) throw err;
                        return null;
                    });
                    const modelPromise = meshDomains.has(domain)
                        ? getExteriorModel(key, role).catch((err) => {
                              if (isAuthError(err)) throw err;
                              return null;
                          })
                        : Promise.resolve(null);
                    const graphPromise =
                        domain === "bundle" || (domain === "outfit" && !hasExplicitHair)
                            ? getExteriorGraphCached(key).catch(() => null)
                            : Promise.resolve(null);
                    const [detail, model, graph] = await Promise.all([detailPromise, modelPromise, graphPromise]);
                    return { key, domain, detail, model, graph };
                })
            );

            const atomicEntries = [];
            for (const res of rawResults) {
                if (!res.detail && res.domain !== "bundle") continue;
                const domain = res.detail?.domain || res.domain;
                if (domain === "bundle") {
                    const targetSpecs = this.extractBundleTargetSpecs(res.key, res.detail, res.graph);
                    const children = await Promise.all(
                        targetSpecs.map(async ({ key: childKey, fallbackKey }) => {
                            const resolveOne = async (targetKey) => {
                                const targetDomain = targetKey.split("_")[0];
                                const [childDetail, childModel] = await Promise.all([
                                    getExteriorsDetail(targetKey).catch((err) => {
                                        if (isAuthError(err)) throw err;
                                        return null;
                                    }),
                                    meshDomains.has(targetDomain)
                                        ? getExteriorModel(targetKey, role).catch((err) => {
                                              if (isAuthError(err)) throw err;
                                              return null;
                                          })
                                        : Promise.resolve(null),
                                ]);
                                if (!childDetail) return null;
                                if (meshDomains.has(targetDomain) && !childModel?.modelUrl) return null;
                                return {
                                    item: childDetail,
                                    domain: childDetail.domain || targetDomain,
                                    modelUrl: childModel?.modelUrl || "",
                                    skipAutoHair: true,
                                    graph: null,
                                };
                            };
                            return (await resolveOne(childKey)) || (fallbackKey ? await resolveOne(fallbackKey) : null);
                        })
                    );
                    for (const child of children) {
                        if (child) atomicEntries.push(child);
                    }
                } else {
                    atomicEntries.push({
                        item: res.detail,
                        domain,
                        modelUrl: res.model?.modelUrl || "",
                        skipAutoHair: false,
                        graph: res.graph,
                    });
                }
            }

            let meshItems = [];
            const postItems = [];
            for (const entry of atomicEntries) {
                if (entry.domain === "posture" || entry.domain === "effect") {
                    postItems.push(entry.item);
                    continue;
                }
                if (!meshDomains.has(entry.domain) || !entry.modelUrl) continue;
                meshItems = meshItems.filter(
                    (prev) =>
                        prev.item.key !== entry.item.key &&
                        !(entry.domain === "outfit" && prev.domain === "outfit") &&
                        !(entry.domain === "hair" && prev.domain === "hair") &&
                        !(entry.domain === "weapon" && prev.domain === "weapon")
                );
                meshItems.push(entry);
            }

            const outfitEntry = meshItems.find((e) => e.domain === "outfit" && !e.skipAutoHair);
            const alreadyHasHair = meshItems.some((e) => e.domain === "hair");
            if (outfitEntry && !alreadyHasHair) {
                const graph =
                    outfitEntry.graph || (await getExteriorGraphCached(outfitEntry.item.key).catch(() => null));
                if (graph) {
                    const { pairedHairs } = extractStudioGraphRelations(graph, outfitEntry.item.key);
                    for (const hair of pairedHairs) {
                        try {
                            const { modelUrl } = await getExteriorModel(hair.key, role);
                            if (modelUrl) {
                                const images = hair.covers
                                    ? { cover: hair.covers }
                                    : hair.cover
                                      ? { cover: { all: hair.cover } }
                                      : null;
                                meshItems.push({
                                    item: { ...hair, images },
                                    domain: "hair",
                                    modelUrl,
                                    skipAutoHair: true,
                                    graph: null,
                                });
                                break;
                            }
                        } catch (err) {
                            if (isAuthError(err)) throw err;
                        }
                    }
                }
            }

            return { meshItems, postItems };
        },
        async finalizeDirectInitialWear(plan) {
            if (!this.preview || !plan) return;
            const registrations = await Promise.all(
                plan.meshItems.map(async (entry) => {
                    try {
                        const reg = await this.preview.registerProduct(entry.modelUrl);
                        return { entry, reg };
                    } catch {
                        return null;
                    }
                })
            );
            const equipped = [];
            const seenSlots = new Set();
            let hasSlotCollision = false;
            for (const pair of registrations) {
                if (!pair) continue;
                const { entry, reg } = pair;
                const item = entry.item;
                const rawImages =
                    item.images ||
                    (item.covers ? { cover: item.covers } : item.cover ? { cover: { all: item.cover } } : null);
                const cover = pickExteriorCover(rawImages, this.activeRole);
                const name = item.name || item.game_name || item.key;
                for (const p of reg.parts || []) {
                    if (seenSlots.has(p.slot)) hasSlotCollision = true;
                    seenSlots.add(p.slot);
                }
                equipped.push({
                    key: item.key,
                    name,
                    domain: entry.domain,
                    cover,
                    rawImages,
                    modelUrl: entry.modelUrl,
                    parts: reg.parts,
                });
                this.recordCachedAndHistory({ ...item, images: rawImages });
            }

            if (hasSlotCollision) {
                await this.syncPartsToViewer(undefined, equipped);
            } else {
                const { keptItems } = this.computeResolvedPartNames(equipped);
                this.equippedItems = keptItems;
            }

            const hasPosture = plan.postItems.some((it) => (it.domain || String(it.key).split("_")[0]) === "posture");
            if (this.hasWeaponEquipped && !hasPosture) {
                await this.applyWeaponStance(this.weaponStance);
            }
            if (
                this.equippedItems.some(
                    (e) => (e.parts || []).some((p) => p.petMount) || String(e.key || "").startsWith("pendant_")
                )
            ) {
                this.activePetMode = "wear";
                if (!this.petBehaviorsManifest) {
                    getPetBehaviorsManifest()
                        .then((manifest) => {
                            this.petBehaviorsManifest = manifest;
                        })
                        .catch(() => {});
                }
            }
            for (const postItem of plan.postItems) {
                try {
                    await this.equipAtomicItem(postItem);
                } catch {
                    // ignore invalid post item
                }
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
                const [detail, graph] = await Promise.all([
                    item.relations ? Promise.resolve(item) : getExteriorsDetail(item.key).catch(() => item),
                    getExteriorGraphCached(item.key).catch(() => null),
                ]);
                const targetSpecs = this.extractBundleTargetSpecs(item.key, detail, graph);
                if (!targetSpecs.length) throw new Error(this.$t('exteriorStudio.emptyBundle'));
                const children = await Promise.all(
                    targetSpecs.map(async ({ key, fallbackKey }) => ({
                        primary: await getExteriorsDetail(key).catch(() => null),
                        fallback: fallbackKey ? await getExteriorsDetail(fallbackKey).catch(() => null) : null,
                    }))
                );
                let equippedCount = 0;
                for (const { primary, fallback } of children) {
                    if (primary) {
                        try {
                            await this.equipAtomicItem(primary, { ...options, skipAutoHair: true });
                            equippedCount++;
                            continue;
                        } catch (err) {
                            if (!fallback) throw err;
                        }
                    }
                    if (fallback) {
                        await this.equipAtomicItem(fallback, { ...options, skipAutoHair: true });
                        equippedCount++;
                    }
                }
                if (!equippedCount) throw new Error(this.$t('exteriorStudio.incompatibleBundle'));
                ElMessage.success(this.$t('exteriorStudio.bundleWorn', { name: item.name || item.key }));
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
            this.actionProgressText = this.$t('exteriorStudio.equipNamed', {
                name: domain === 'expression' ? expressionLabel(this.$t, item.exprKey, name) : name,
            });
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
                                this.$t('exteriorStudio.occluded', { name, outfit: activeOutfit.name })
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
                    ElMessage.error(err?.message || this.$t('exteriorStudio.petFailed'));
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
                ElMessage.success(this.$t('exteriorStudio.photoSaved'));
            } catch (err) {
                ElMessage.error(err?.message || this.$t('exteriorStudio.photoFailed'));
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
                ElMessage.success(this.$t('exteriorStudio.linkCopied'));
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

    &.is-viewport-fullscreen {
        position: fixed;
        inset: 0;
        z-index: 2000;
        width: 100vw;
        height: 100vh;
        background: #0f172a;
    }

    &.is-fullscreen {
        width: 100vw;
        height: 100vh;
        background: #0f172a;
    }
}

.m-studio-shell {
    display: flex;
    height: calc(100vh - 96px);
    min-height: 620px;
    border: 1px solid @pvx-border;
    border-radius: 16px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);

    @media (max-width: @ipad-y) {
        display: grid;
        grid-template-columns: clamp(240px, 32%, 320px) minmax(0, 1fr);
        grid-template-rows: auto minmax(0, 1fr);
    }

    @media (max-width: @phone) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-rows: auto auto auto;
        height: auto;
        min-height: 0;
    }
}

.m-ext-studio.is-fullscreen .m-studio-shell {
    height: 100vh;
    height: 100dvh;
    min-height: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;

    @media (max-width: @phone) {
        overflow-y: auto;
        align-content: start;
    }
}

.m-studio-nav {
    display: flex;
    flex-direction: column;
    width: 102px;
    flex-shrink: 0;
    min-height: 0;
    padding: 12px 8px;
    overflow-y: auto;
    scrollbar-width: thin;
    background: #0f172a;
    color: #cbd5e1;
    gap: @pvx-space-1;

    @media (max-width: @ipad-y) {
        grid-column: 1 / -1;
        width: auto;
        flex-direction: row;
        overflow-x: auto;
        overflow-y: hidden;
        padding: 8px 10px;
    }
}

.u-nav-back {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 7px 6px;
    border: none;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.08);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    flex-shrink: 0;
    cursor: pointer;

    &:hover {
        background: rgba(255, 255, 255, 0.16);
        color: #fff;
    }
}

.m-nav-list {
    display: flex;
    flex-direction: column;
    flex-shrink: 0;
    gap: 4px;

    @media (max-width: @ipad-y) {
        flex-direction: row;
    }
}

.u-nav-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 6px;
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

.u-nav-collapse-btn {
    margin-top: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 8px 6px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.06);
    color: #cbd5e1;
    font-size: 11.5px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.16s;

    &:hover {
        background: rgba(255, 255, 255, 0.14);
        color: #ffffff;
    }

    @media (max-width: 1024px) {
        display: none;
    }
}

.m-studio-drawer {
    width: clamp(280px, 26vw, 400px);
    flex-shrink: 0;
    border-right: 1px solid @pvx-border;
    background: #ffffff;
    min-height: 0;
    overflow: hidden;

    @media (min-width: 1920px) {
        width: 430px;
    }

    @media (max-width: @ipad-y) {
        width: 100%;
        height: auto;
        min-width: 0;
    }

    @media (max-width: @phone) {
        grid-row: 3;
        height: clamp(360px, 60vh, 560px);
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

    @media (max-width: @ipad-y) {
        min-height: 0;
    }
    @media (max-width: @phone) {
        grid-row: 2;
        height: clamp(400px, 64vh, 580px);
        height: clamp(400px, 64svh, 580px);
    }

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
    opacity: 0;
    touch-action: none;
    cursor: grab;

    &.is-ready {
        opacity: 1;

        @media (prefers-reduced-motion: no-preference) {
            transition: opacity 160ms ease-out;
        }
    }

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
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    pointer-events: none;

    @media (max-width: @phone) {
        top: 8px;
        left: 8px;
        right: 8px;
        gap: 4px;
    }

    > * {
        flex-shrink: 0;
        pointer-events: auto;
    }
}

.m-topbar-actions,
.m-topbar-display,
.m-stage-more__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    max-width: 100%;
    gap: 6px;

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

.m-topbar-display {
    margin-inline-start: auto;
}

.m-stage-playback {
    display: inline-flex;
    align-items: center;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.78);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16) inset;
}

.m-stage-tooltip-anchor {
    display: inline-flex;
}

.m-role-pills,
.m-view-pills,
.m-weapon-pills {
    display: inline-flex;
    align-items: center;
    height: 32px;
    box-sizing: border-box;
    gap: 3px;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: rgba(15, 23, 42, 0.78);
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

.u-stage-tool {
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 16px;
    background: rgba(15, 23, 42, 0.78);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.16) inset;

    &:hover:not(:disabled) {
        background: rgba(30, 41, 59, 0.85);
    }

    &.is-active,
    &[aria-expanded="true"] {
        background: @pvx-primary;
    }
}

.u-stage-play-toggle {
    height: 32px;
    border-start-end-radius: 0;
    border-end-end-radius: 0;
}

.u-stage-locomotion {
    display: grid;
    box-sizing: border-box;
    width: 32px;
    height: 32px;
    padding: 0;
    place-items: center;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    box-shadow: inset 1px 0 rgba(255, 255, 255, 0.16);
}

.m-stage-locomotion-menu {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 6px;

    :deep(.el-dropdown-menu__item) {
        min-height: 28px;
        padding: 0 10px;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface-muted;
        font-size: 12px;
        white-space: nowrap;

        &[aria-current="true"],
        &:hover,
        &:focus {
            background: @pvx-primary-soft;
            color: @pvx-primary-hover;
        }

        &[aria-current="true"] {
            font-weight: 600;
        }
    }
}

.u-expr-replay-btn,
.u-skill-teaser-btn {
    gap: 5px;
}

@media (max-width: @phone) {
    .m-role-pills .u-pill-btn,
    .m-view-pills .u-pill-btn {
        padding-inline: 8px;
    }
}

.m-stage-panel-tab {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    z-index: 4;
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    min-width: 24px;
    padding: 12px 5px;
    border: 1px solid rgba(255, 255, 255, 0.18);
    border-left: none;
    border-radius: 0 12px 12px 0;
    background: rgba(15, 23, 42, 0.72);
    color: #e2e8f0;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    box-shadow: 4px 0 14px rgba(15, 23, 42, 0.18);
    transition: background 0.16s, color 0.16s, padding 0.16s;

    &:hover {
        background: rgba(30, 41, 59, 0.92);
        color: #ffffff;
        padding-right: 7px;
    }

    &.is-both-collapsed {
        padding: 12px 7px;
        background: rgba(15, 23, 42, 0.82);

        .u-panel-tab-label {
            writing-mode: vertical-rl;
            letter-spacing: 2px;
            font-size: 11.5px;
            line-height: 1.1;
        }
    }

    @media (max-width: 1024px) {
        display: none;
    }
}

:global(.el-popper.m-studio-more-popper) {
    padding: 12px;
    border-radius: @pvx-radius-control;
    box-shadow: @pvx-shadow-hover;
}

.m-stage-more {
    display: grid;
    gap: @pvx-space-2;

    .u-pill-btn {
        min-height: 32px;
        background: @pvx-surface-muted;
        color: @pvx-text-regular;

        &:hover:not(:disabled),
        &.is-active {
            color: @pvx-primary-hover;
            background: @pvx-primary-soft;
        }
    }

    .m-weapon-pills {
        justify-self: start;
        height: auto;
        background: @pvx-surface-muted;
    }
}

.m-stage-more__group {
    display: grid;
    gap: @pvx-space-1;
    min-width: 0;

    & + & {
        padding-top: @pvx-space-2;
        border-top: 1px solid @pvx-border-light;
    }

    h3 {
        margin: 0;
        color: @pvx-text-secondary;
        font-size: 12px;
        font-weight: 600;
    }
}

.m-stage-more__settings {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: end;
    gap: @pvx-space-1;

    .m-stage-more__setting {
        display: grid;
        gap: @pvx-space-1;
        min-width: 0;

        label {
            color: @pvx-text-secondary;
            font-size: 12px;
            font-weight: 600;
        }
    }

    .u-stage-select {
        min-width: 0;
    }

    :deep(.el-select__wrapper) {
        min-height: 32px;
        border-radius: @pvx-radius-pill;
    }
}

.m-stage-overlay {
    position: absolute;
    inset: 0;
    z-index: 4;
    display: grid;
    place-items: center;
    background: rgba(15, 23, 42, 0.44);

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
    background: rgba(15, 23, 42, 0.86);
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
    background: rgba(15, 23, 42, 0.72);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18) inset;
    color: #f8fafc;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;

    &:hover {
        background: rgba(15, 23, 42, 0.85);
    }
}

.m-stage-footer {
    position: absolute;
    left: 14px;
    right: 14px;
    bottom: 14px;
    z-index: 3;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: @pvx-space-1;
    pointer-events: none;
}

.m-stage-footer__left {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: @pvx-space-1;
    min-width: 0;
    max-width: 560px;
}

.el-button.u-stage-capture {
    flex: none;
    width: 52px;
    height: 52px;
    padding: 0;
    font-size: 24px;
    box-shadow: @pvx-shadow-hover;
    pointer-events: auto;

    @media (max-width: @phone) {
        width: 48px;
        height: 48px;
    }
}

.m-pet-dock {
    max-width: 100%;
    pointer-events: auto;
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.82);
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
    --worn-dock-top: clamp(80px, 12%, 100px);
    position: absolute;
    top: var(--worn-dock-top);
    right: 14px;
    z-index: 3;
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 28px);
    max-height: calc(100% - var(--worn-dock-top) - 76px);
    overflow: hidden;
    border-radius: 14px;
    background: rgba(15, 23, 42, 0.82);
    color: #f8fafc;

    @media (max-width: @phone) {
        --worn-dock-top: 106px;
        right: 8px;
        max-width: 65%;
    }

    &__toggle {
        display: flex;
        flex: none;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        min-height: 34px;
        padding: 6px 10px;
        border: 0;
        background: transparent;
        color: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;

        &:hover {
            background: rgba(255, 255, 255, 0.12);
        }

        &:focus-visible {
            outline: 2px solid #a5b4fc;
            outline-offset: -3px;
        }

        .is-expanded {
            transform: rotate(180deg);
        }
    }

    &__list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        box-sizing: border-box;
        width: 210px;
        max-width: 100%;
        min-height: 0;
        margin: 0;
        padding: 0 8px 8px;
        overflow-y: auto;
        overscroll-behavior: contain;
        scrollbar-width: thin;
        list-style: none;
    }
}

.u-worn-capsule {
    display: flex;
    flex: none;
    align-items: center;
    gap: 5px;
    padding: 3px 6px 3px 4px;
    border-radius: @pvx-radius-pill;
    background: rgba(255, 255, 255, 0.14);
    line-height: 1.25;

    .u-cap-thumb {
        display: block;
        flex: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        object-fit: cover;
        object-position: top center;
    }

    .u-cap-name {
        flex: 1;
        min-width: 0;
        color: #f8fafc;
        font-size: 10px;
        font-weight: 600;
        white-space: normal;
        overflow-wrap: anywhere;

        &:hover {
            color: #a5b4fc;
        }
    }

    .u-cap-tag {
        flex: none;
        max-width: 35%;
        padding: 2px 4px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 9px;
        color: #cbd5e1;
        text-align: center;
        overflow-wrap: anywhere;
    }

    .u-cap-remove {
        flex: none;
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
        line-height: 1;
        cursor: pointer;

        &:hover {
            background: #ef4444;
        }
    }
}

</style>
