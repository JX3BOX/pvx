<!-- 外观详情主组件：整合高清图集与 3D 实时试穿舞台、元信息卡片、全图画廊、关联图谱、玩家返图与评论区。 -->
<template>
    <div class="m-ext-detail">
        <PvxSurface tag="header" padding="medium" class="m-ext-header">
            <div class="m-ext-title-block">
                <img v-if="itemIconUrl" :src="itemIconUrl" :alt="item.name" class="u-title-icon" />
                <div class="m-title-texts">
                    <div class="m-title-badges">
                        <span v-if="domainInfo" class="u-domain-tag" :style="domainTagStyle">
                            {{ domainInfo.label }}
                            <template v-if="slotLabel"> · {{ slotLabel }}</template>
                        </span>
                        <span
                            v-for="badge in playerTags"
                            :key="badge.key"
                            class="u-player-tag"
                            :class="`is-${badge.tone}`"
                        >
                            {{ badge.label }}
                        </span>
                    </div>
                    <h1 class="u-ext-name">{{ item.name || item.game_name || item.key }}</h1>
                    <p v-if="item.game_name && item.game_name !== item.name" class="u-game-origin">
                        游戏原名：{{ item.game_name }}
                    </p>
                </div>
            </div>

            <!-- 操作按钮组（收藏 / 加入仓库 / 带入试衣间 / 分享） -->
            <div class="m-ext-actions">
                <el-button
                    v-if="!item.local_preview"
                    :type="starred ? 'primary' : 'default'"
                    :plain="!starred"
                    :loading="starBusy"
                    @click="toggleStar"
                >
                    <template #icon>
                        <StarFilled v-if="starred" />
                        <Star v-else />
                    </template>
                    <span>{{ $t(starLabel) }}</span>
                    <span v-if="favoriteCount > 0" class="u-star-count">{{ favoriteCount }}</span>
                </el-button>

                <el-button
                    v-if="!item.local_preview && canPreviewModel"
                    type="primary"
                    @click="enterFittingRoom"
                >
                    <el-icon class="el-icon--left"><View /></el-icon>
                    {{ $t("exterior.studio.enterDetail") }}
                </el-button>

                <el-button v-if="!item.local_preview" plain @click="addToWarehouse">
                    <el-icon class="el-icon--left"><Box /></el-icon>
                    {{ $t("exterior.warehouse.add") }}
                </el-button>

                <el-button plain @click="copyShareLink">
                    <el-icon class="el-icon--left"><Share /></el-icon>
                    {{ $t("exterior.copyLink") }}
                </el-button>
            </div>
        </PvxSurface>

        <!-- 主舞台 + 核心资料区 -->
        <PvxSurface padding="medium" class="m-ext-hero">
            <div class="m-ext-stage-bar">
                <div class="m-mode-switch" role="tablist" :aria-label="$t('exterior.preview')">
                    <button
                        type="button"
                        role="tab"
                        class="u-mode-btn"
                        :class="{ 'is-active': previewMode === 'image' }"
                        :aria-selected="previewMode === 'image'"
                        @click="previewMode = 'image'"
                    >
                        <el-icon><Picture /></el-icon>
                        <span>{{ $t("exterior.staticPreview") }}</span>
                    </button>
                    <button
                        v-if="canPreviewModel"
                        type="button"
                        role="tab"
                        class="u-mode-btn"
                        :class="{ 'is-active': previewMode === 'model' }"
                        :aria-selected="previewMode === 'model'"
                        @click="previewMode = 'model'"
                    >
                        <el-icon><View /></el-icon>
                        <span>{{ $t("exterior.modelPreview") }}</span>
                    </button>
                </div>

                <span v-if="previewMode === 'model'" class="u-stage-caption">
                    左键旋转（支持俯仰）· 右键平移 · 滚轮缩放 · 双击复位
                </span>
            </div>

            <!-- 左侧：视觉展示舞台（高清图集 / 3D 试穿无缝切换） -->
            <section class="m-ext-stage-col">
                <div class="m-ext-stage-frame" :class="{ 'is-3d': previewMode === 'model' }">
                    <template v-if="previewMode === 'model'">
                        <slot name="preview-3d" :item="item" :body-type="activeCoverRole">
                            <ExteriorModelPreview
                                v-if="!item.local_preview"
                                :item="item"
                                :initial-role="activeCoverRole"
                                :graph-nodes="graphNodes"
                                :graph-edges="graphEdges"
                                @back-to-image="previewMode = 'image'"
                                @role-change="onModelRoleChange"
                            />
                        </slot>
                    </template>

                    <template v-else>
                        <el-image
                            v-if="activeMedia"
                            :key="activeMedia.url"
                            :src="activeMedia.url"
                            :alt="item.name"
                            :preview-src-list="allMediaUrls"
                            :initial-index="activeMediaIndex"
                            fit="contain"
                            preview-teleported
                            class="m-ext-stage-img"
                        >
                            <template #error>
                                <div class="m-ext-stage-fallback">
                                    <img v-if="itemIconUrl" :src="itemIconUrl" alt="" class="u-fallback-icon" />
                                    <span>{{ $t("exterior.imageUnavailable") }}</span>
                                </div>
                            </template>
                        </el-image>
                        <div v-else class="m-ext-stage-fallback">
                            <img v-if="itemIconUrl" :src="itemIconUrl" alt="" class="u-fallback-icon" />
                            <span>{{ $t("exterior.imageUnavailable") }}</span>
                        </div>
                    </template>
                </div>

                <!-- 舞台底部视图切换条（各体型封面 + 合照 + 近景） -->
                <div
                    v-if="previewMode === 'image' && stageMediaList.length > 1"
                    class="m-ext-stage-pills"
                    role="group"
                    :aria-label="$t('exterior.preview')"
                >
                    <button
                        v-for="media in stageMediaList"
                        :key="media.id"
                        type="button"
                        class="u-media-pill"
                        :class="{ 'is-active': activeMedia?.id === media.id }"
                        :aria-pressed="activeMedia?.id === media.id"
                        @click="selectStageMedia(media)"
                    >
                        {{ media.label }}
                    </button>
                </div>
            </section>

            <!-- 外观资料 -->
            <section class="m-ext-info-col">
                <!-- 核心状态三格卡片 -->
                <div class="m-ext-facts">
                    <div class="u-fact-card">
                        <span class="u-fact-label">{{ $t("exterior.price") }}</span>
                        <div v-if="formattedPrices.length" class="u-fact-prices">
                            <span v-for="price in formattedPrices" :key="price" class="u-price-val">
                                {{ price }}
                            </span>
                        </div>
                        <span v-else class="u-fact-val is-muted">{{ $t("exterior.noDirectPrice") }}</span>
                    </div>

                    <div class="u-fact-card">
                        <span class="u-fact-label">{{ $t("exterior.obtainable") }}</span>
                        <span
                            class="u-fact-val"
                            :class="item.obtainable === true ? 'is-good' : item.obtainable === false ? 'is-muted' : ''"
                        >
                            {{ obtainableText }}
                        </span>
                    </div>

                    <div class="u-fact-card">
                        <span class="u-fact-label">{{ $t("exterior.tradable") }}</span>
                        <span class="u-fact-val" :class="item.tradable_item ? 'is-good' : 'is-muted'">
                            {{ item.tradable_item ? $t("exterior.tradableYes") : $t("exterior.tradableNo") }}
                        </span>
                    </div>
                </div>

                <!-- 所属系列与关联礼盒（帮助玩家一眼看懂非商城直购外观的出处） -->
                <div v-if="quickParentLinks.length" class="m-ext-section-box">
                    <div class="u-box-label">所属系列与礼盒</div>
                    <div class="m-quick-links">
                        <router-link
                            v-for="link in quickParentLinks"
                            :key="link.key"
                            :to="{ name: 'exterior-list', query: { id: link.key, view: $route.query.view } }"
                            class="u-quick-link"
                        >
                            <span class="u-quick-badge" :style="link.badgeStyle">{{ link.domainLabel }}</span>
                            <span class="u-quick-name">{{ link.name }}</span>
                        </router-link>
                    </div>
                </div>

                <!-- 常用俗称 -->
                <div v-if="distinctAliases.length" class="m-ext-section-box">
                    <div class="u-box-label">{{ $t("exterior.aliases") }}</div>
                    <div class="m-alias-list">
                        <span v-for="alias in distinctAliases" :key="alias" class="u-alias-chip">
                            {{ alias }}
                        </span>
                    </div>
                </div>

                <!-- 游戏说明 -->
                <div v-if="description" class="m-ext-section-box m-ext-desc-box">
                    <div class="u-box-label">外观介绍</div>
                    <p class="u-desc-text">{{ description }}</p>
                </div>

                <!-- 各体型名称差异 -->
                <div v-if="variantList.length" class="m-ext-section-box">
                    <div class="u-box-label">{{ $t("exterior.variants") }}</div>
                    <div class="m-variant-grid">
                        <div v-for="variant in variantList" :key="variant.role_type" class="u-variant-item">
                            <span class="u-variant-role">{{ bodyLabels[variant.role_type] || variant.role_type }}</span>
                            <span class="u-variant-name">{{ variant.name || item.game_name }}</span>
                        </div>
                    </div>
                </div>
            </section>
        </PvxSurface>

        <!-- 关联外观与图谱（默认卡片，可切交互图谱） -->
        <ExteriorRelatedGraph
            class="m-ext-section"
            :exterior-key="item.key"
            :fallback-relations="item.relations || []"
            :current-item="item"
            @graph-loaded="onGraphLoaded"
        />

        <!-- 玩家晒外观 / 返图区（礼盒与 1:1 散件自动聚合至主成衣返图墙） -->
        <slot name="showcase" :exterior-id="showcaseTarget.publishKey" :item="item">
            <ExteriorShowcase
                class="m-ext-section"
                :item="item"
                :exterior-id="showcaseTarget.publishKey"
                :query-keys="showcaseTarget.queryKeys"
                :canonical-name="showcaseTarget.publishName"
                :is-canonical-redirect="showcaseTarget.isCanonicalRedirect"
            />
        </slot>

        <!-- 底部评论区 -->
        <PvxSurface v-if="!item.local_preview && commentTargetId" tag="section" padding="medium" class="m-ext-section">
            <PvxSectionHeader
                :title="$t('exterior.comments')"
                :description="$t('exterior.commentsDesc')"
            >
                <template #icon><ChatDotRound /></template>
            </PvxSectionHeader>
            <Comment :key="commentTargetId" :id="commentTargetId" category="exterior" order="desc" />
        </PvxSurface>
    </div>
</template>

<script>
import { Box, ChatDotRound, Picture, Share, Star, StarFilled, View } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import Comment from "@jx3box/jx3box-ui/src/single/Comment.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import ExteriorModelPreview from "./ExteriorModelPreview.vue";
import ExteriorRelatedGraph from "./ExteriorRelatedGraph.vue";
import ExteriorShowcase from "./ExteriorShowcase.vue";
import {
    BODY_LABEL_MAP,
    BODY_TYPES,
    CHARACTER_BOUND_DOMAINS,
    DOMAIN_META,
    MODEL_CAPABLE_DOMAINS,
    SLOT_LABELS,
    formatExteriorPrice,
    getPlayerTags,
    parseExteriorDescription,
    resolveCanonicalShowcaseTarget,
    resolveExteriorAssetUrl,
    resolveExteriorModelPlan,
} from "./meta";
import {
    addExteriorStar,
    getExteriorFavoriteCount,
    prefetchExteriorModel,
    removeExteriorStar,
} from "@/service/exterior";

export default {
    name: "ExteriorDetail",
    components: {
        Box,
        ChatDotRound,
        PvxSectionHeader,
        Comment,
        ExteriorModelPreview,
        ExteriorRelatedGraph,
        ExteriorShowcase,
        Picture,
        PvxSurface,
        Share,
        Star,
        StarFilled,
        View,
    },
    props: {
        item: { type: Object, required: true },
    },
    data() {
        return {
            bodyLabels: BODY_LABEL_MAP,
            previewMode: "image",
            previewRole: null,
            selectedMediaId: "",
            graphNodes: [],
            graphEdges: [],
            starred: false,
            favoriteCount: 0,
            starBusy: false,
            starStatusError: false,
            prefetchTimer: null,
            prefetchedPlanSig: "",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        preferredRole() {
            return this.previewRole || this.$store.state.preferredRole || 2;
        },
        itemIconUrl() {
            return Number(this.item.icon_id) > 0 ? iconLink(this.item.icon_id, this.client) : "";
        },
        domainInfo() {
            return DOMAIN_META[this.item.domain] || null;
        },
        domainTagStyle() {
            if (!this.domainInfo) return {};
            return {
                color: this.domainInfo.color,
                backgroundColor: this.domainInfo.bg,
            };
        },
        slotLabel() {
            return this.item.slot && SLOT_LABELS[this.item.slot] ? SLOT_LABELS[this.item.slot] : "";
        },
        playerTags() {
            return getPlayerTags(this.item);
        },
        canPreviewModel() {
            return (
                Boolean(this.item.local_preview) ||
                (MODEL_CAPABLE_DOMAINS.has(this.item.domain) &&
                    /^(bundle|outfit|part|hair|pendant|weapon|effect|posture)_\d+$/.test(this.item.key))
            );
        },
        bodyCovers() {
            const coverMap = this.item.images?.cover || {};
            const ordered = [];
            for (const { id, label } of BODY_TYPES) {
                const raw = coverMap[String(id)];
                if (raw) {
                    ordered.push({
                        id: `cover:${id}`,
                        kind: "cover",
                        role: id,
                        label,
                        url: resolveExteriorAssetUrl(raw),
                    });
                }
            }
            if (coverMap.all) {
                ordered.push({
                    id: "cover:all",
                    kind: "cover",
                    role: null,
                    label: this.item.domain === "weapon" ? "武器总览" : "外观展示",
                    url: resolveExteriorAssetUrl(coverMap.all),
                });
            }
            return ordered;
        },
        groupPhotos() {
            const list = [];
            const seen = new Set();
            const domain = this.item.domain;
            const buildLabel = (kind, role, idx, total) => {
                const suffix = total > 1 ? ` ${idx + 1}` : "";
                if (domain === "weapon") {
                    if (kind === "detail") return total > 1 ? `阶段 ${idx + 1}` : "武器细节";
                    return `武器特写${suffix}`;
                }
                if (domain === "pendant" || domain === "effect") {
                    if (kind === "detail") return `细节展示${suffix}`;
                    return `近景特写${suffix}`;
                }
                const roleText = BODY_LABEL_MAP[role] || (kind === "portrait" ? "近景" : "全家福");
                const baseLabel = kind === "portrait" ? "特写" : "细节";
                return `${roleText}${baseLabel}${suffix}`;
            };
            const pushGroup = (slots, kind) => {
                for (const [role, value] of Object.entries(slots || {})) {
                    const urls = [].concat(value || []);
                    urls.forEach((raw, idx) => {
                        const url = resolveExteriorAssetUrl(raw);
                        if (!url || seen.has(url)) return;
                        seen.add(url);
                        list.push({
                            id: `${kind}:${role}:${idx}`,
                            kind,
                            role: BODY_LABEL_MAP[role] ? Number(role) : null,
                            label: buildLabel(kind, role, idx, urls.length),
                            url,
                        });
                    });
                }
            };
            pushGroup(this.item.images?.detail, "detail");
            pushGroup(this.item.images?.portrait, "portrait");
            return list;
        },
        // 全家福细节与近景特写排在前方，随后展示四体型全身封面；武器等多阶段细节与 cover.all 重图时自动去重。
        stageMediaList() {
            const groupUrls = new Set(this.groupPhotos.map((entry) => entry.url));
            const filteredCovers = this.bodyCovers.filter(
                (entry) => entry.role != null || !groupUrls.has(entry.url)
            );
            return [...this.groupPhotos, ...filteredCovers];
        },
        allMediaUrls() {
            const seen = new Set();
            const urls = [];
            for (const entry of this.stageMediaList) {
                if (!entry.url || seen.has(entry.url)) continue;
                seen.add(entry.url);
                urls.push(entry.url);
            }
            return urls;
        },
        mediaIndexMap() {
            return new Map(this.allMediaUrls.map((url, idx) => [url, idx]));
        },
        defaultMedia() {
            const roleMatch = this.bodyCovers.find((entry) => entry.role === this.preferredRole);
            return this.groupPhotos[0] || roleMatch || this.bodyCovers[0] || null;
        },
        activeMedia() {
            return this.stageMediaList.find((entry) => entry.id === this.selectedMediaId) || this.defaultMedia;
        },
        activeMediaIndex() {
            if (!this.activeMedia) return 0;
            return this.mediaIndexMap.get(this.activeMedia.url) ?? 0;
        },
        activeCoverRole() {
            return this.activeMedia?.role || this.preferredRole || 2;
        },
        showcaseTarget() {
            return resolveCanonicalShowcaseTarget(this.item, this.graphNodes, this.graphEdges);
        },
        formattedPrices() {
            return [...new Set((this.item.prices || []).map(formatExteriorPrice).filter(Boolean))];
        },
        obtainableText() {
            if (this.item.obtainable === true) return this.$t("exterior.obtainableYes");
            if (this.item.obtainable === false) return this.$t("exterior.obtainableNo");
            return this.$t("exterior.obtainableUnknown");
        },
        distinctAliases() {
            const name = (this.item.name || "").trim();
            const gameName = (this.item.game_name || "").trim();
            return [...new Set((this.item.aliases || []).map((s) => String(s || "").trim()))].filter(
                (s) => s && s !== name && s !== gameName
            );
        },
        description() {
            return parseExteriorDescription(this.item.description);
        },
        variantList() {
            const rows = this.item.variants || [];
            if (!rows.length) return [];
            const distinctNames = new Set(rows.map((r) => (r.name || "").trim()).filter(Boolean));
            if (distinctNames.size <= 1 && distinctNames.has((this.item.game_name || "").trim())) {
                return [];
            }
            return rows;
        },
        starLabel() {
            if (this.starred === null && this.starBusy) return "exterior.star.loading";
            if (this.starStatusError) return "exterior.star.retry";
            return this.starred ? "exterior.star.remove" : "exterior.star.add";
        },
        // next2 评论接口要求 article id 为整数，exterior_std_item.id 恰好为全局唯一的 64 位整数主键。
        commentTargetId() {
            const numeric = Number(this.item?.id);
            return Number.isSafeInteger(numeric) && numeric > 0 ? String(this.item.id) : "";
        },
        quickParentLinks() {
            const nodeMap = new Map(this.graphNodes.map((n) => [n.key, n]));
            const parentKeys = new Set();
            const ownedParts = new Set();
            const edges = this.graphEdges.length ? this.graphEdges : this.item.relations || [];
            for (const edge of edges) {
                if (edge.to_key === this.item.key && edge.from_key !== this.item.key) {
                    parentKeys.add(edge.from_key);
                }
                if (edge.from_key === this.item.key && edge.kind === "contains") {
                    ownedParts.add(edge.to_key);
                }
            }
            // 成衣与礼盒常通过共享核心散件关联，补充识别所属礼盒，方便玩家一眼看到非直购成衣的出处。
            if (ownedParts.size) {
                for (const edge of edges) {
                    if (ownedParts.has(edge.to_key) && edge.from_key !== this.item.key) {
                        const fromNode = nodeMap.get(edge.from_key);
                        const fromDomain = fromNode?.domain || String(edge.from_key).split("_")[0];
                        if (fromDomain === "bundle") parentKeys.add(edge.from_key);
                    }
                }
            }
            const links = [];
            for (const key of parentKeys) {
                const node = nodeMap.get(key);
                const domain = node?.domain || String(key).split("_")[0];
                if (!["family", "series", "bundle", "outfit"].includes(domain)) continue;
                const meta = DOMAIN_META[domain] || { label: domain, color: "#5b5cf5", bg: "#eef2ff", tier: 9 };
                links.push({
                    key,
                    name: node?.name || node?.game_name || key,
                    domainLabel: meta.label,
                    tier: meta.tier,
                    badgeStyle: { color: meta.color, backgroundColor: meta.bg },
                });
            }
            return links.sort((a, b) => a.tier - b.tier || a.name.localeCompare(b.name, "zh-CN")).slice(0, 6);
        },
    },
    created() {
        this.$store.dispatch("initPreferredRole");
        if (!this.item.local_preview) {
            this.loadStarStatus();
            if (User.isLogin()) {
                this.scheduleModelPrefetch(520);
            }
        }
    },
    beforeUnmount() {
        clearTimeout(this.prefetchTimer);
        this.prefetchTimer = null;
    },
    methods: {
        scheduleModelPrefetch(delay = 360) {
            clearTimeout(this.prefetchTimer);
            if (this.item.local_preview || !this.canPreviewModel || !User.isLogin()) return;
            this.prefetchTimer = setTimeout(() => {
                this.prefetchTimer = null;
                this.prefetchActiveModel();
            }, delay);
        },
        prefetchActiveModel() {
            if (this.item.local_preview || !this.canPreviewModel || !User.isLogin()) return;
            const plan = resolveExteriorModelPlan(this.item, this.graphNodes, this.graphEdges);
            if (!plan.targetKey) return;
            // 礼盒自身无独立模型记录，需等待图谱返回拆解出的主成衣/单品后再预热，避免发出无效 404 请求。
            if (plan.targetDomain === "bundle" && !this.graphEdges.length) return;
            const standaloneDomains = new Set(["pendant", "weapon", "effect"]);
            const isStandaloneDefault = standaloneDomains.has(plan.targetDomain);
            const itemRoles = Array.isArray(this.item.roles)
                ? this.item.roles.map(Number).filter((id) => [1, 2, 5, 6].includes(id))
                : [];
            const availableRoles = CHARACTER_BOUND_DOMAINS.has(plan.targetDomain) && itemRoles.length ? itemRoles : [1, 2, 5, 6];
            const preferred = this.activeCoverRole || this.preferredRole || 2;
            const role = isStandaloneDefault ? null : availableRoles.includes(preferred) ? preferred : availableRoles[0];
            const sig = `${plan.targetKey}:${role || "solo"}:${plan.hairKey || ""}`;
            if (this.prefetchedPlanSig === sig) return;
            this.prefetchedPlanSig = sig;
            // 进入详情页即静默预热渲染 Worker 代码块、原子模型地址与 .gltf 目录 JSON，显著降低点击 3D 试穿后的首帧等待。
            import("@jx3box/jx3box-exterior/worker").catch(() => {});
            prefetchExteriorModel(plan.targetKey, role);
            if (role && plan.hairKey && plan.hairKey !== plan.targetKey) {
                prefetchExteriorModel(plan.hairKey, role);
            }
        },
        selectStageMedia(media) {
            this.selectedMediaId = media.id;
            if (media.role) {
                this.previewRole = media.role;
            }
        },
        onGraphLoaded({ nodes = [], edges = [] } = {}) {
            this.graphNodes = nodes;
            this.graphEdges = edges;
            // 图谱到达后可拿到礼盒拆解目标与配套黑发，立刻静默预热最终 3D 资产。
            if (!this.item.local_preview && User.isLogin()) {
                this.scheduleModelPrefetch(80);
            }
        },
        onModelRoleChange(role) {
            if (role) {
                this.previewRole = role;
            }
        },
        addToWarehouse() {
            this.$router.push({
                name: "exterior-house",
                query: { add: this.item.key },
            });
        },
        enterFittingRoom() {
            this.$router.push({
                name: "exterior-studio",
                query: {
                    role: String(this.activeCoverRole || this.preferredRole || 2),
                    wear: this.item.key,
                },
                state: { preserveCatalogRole: true },
            });
        },
        async copyShareLink() {
            try {
                await navigator.clipboard.writeText(window.location.href);
                ElMessage.success(this.$t("exterior.copyLinkSuccess"));
            } catch {
                ElMessage.info(window.location.href);
            }
        },
        async loadStarStatus() {
            this.starBusy = true;
            this.starStatusError = false;
            try {
                const res = await getExteriorFavoriteCount(this.item.key);
                this.starred = Boolean(res?.starred);
                this.favoriteCount = Number(res?.count) || 0;
            } catch (error) {
                this.starStatusError = true;
                if (User.isLogin()) this.showStarError(error);
            } finally {
                this.starBusy = false;
            }
        },
        async toggleStar() {
            if (this.starBusy) return;
            if (!User.isLogin()) {
                User.toLogin();
                return;
            }
            const nextStarred = !this.starred;
            this.starBusy = true;
            try {
                const res = await (nextStarred ? addExteriorStar(this.item.key, {}) : removeExteriorStar(this.item.key));
                this.starred = nextStarred;
                if (res && typeof res.count === "number") {
                    this.favoriteCount = res.count;
                } else {
                    this.favoriteCount = Math.max(0, this.favoriteCount + (nextStarred ? 1 : -1));
                }
                ElMessage.success(nextStarred ? "已加入我的收藏" : "已取消收藏");
            } catch (error) {
                this.showStarError(error);
            } finally {
                this.starBusy = false;
            }
        },
        showStarError(error) {
            const data = error.response?.data || error.data;
            ElMessage.error(data?.msg || this.$t("exterior.requestError"));
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-ext-detail {
    display: grid;
    min-width: 0;
    gap: 20px;

    @media (max-width: @phone) {
        gap: @pvx-space-4;
    }
}

.m-ext-header,
.m-ext-hero {
    padding: @pvx-space-5;
    border-color: fade(@pvx-border, 80%);
    box-shadow: @pvx-shadow-xs;

    @media (max-width: @phone) {
        padding: @pvx-space-4;
    }
}

.m-ext-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: @pvx-space-4;

    @media (max-width: @ipad-y) {
        flex-direction: column;
        align-items: stretch;
    }
}

.m-ext-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) clamp(290px, 28%, 420px);
    grid-template-areas: "toolbar ." "preview info";
    align-items: start;
    gap: @pvx-space-3 @pvx-space-5;

    @media (max-width: @ipad-y) {
        grid-template-columns: minmax(0, 1fr);
        grid-template-areas: "toolbar" "preview" "info";
    }
}

.m-ext-stage-col {
    grid-area: preview;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
}

.m-ext-stage-bar {
    grid-area: toolbar;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
}

.m-mode-switch {
    display: inline-flex;
    padding: 3px;
    border-radius: @pvx-radius-pill;
    background: @pvx-surface-muted;
    border: 1px solid @pvx-border;

    .u-mode-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 6px 14px;
        border: none;
        border-radius: @pvx-radius-pill;
        background: transparent;
        color: @pvx-text-secondary;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.18s;

        &:hover {
            color: @pvx-primary-hover;
        }

        &.is-active {
            background: @pvx-primary;
            color: @pvx-text-inverse;
            box-shadow: 0 3px 10px rgba(91, 92, 245, 0.28);
        }
    }
}

.u-stage-caption {
    font-size: 12px;
    color: @pvx-text-secondary;
}

.m-ext-stage-frame {
    position: relative;
    width: 100%;
    height: clamp(360px, 56vh, 520px);

    @media (min-width: @smallpc) {
        height: clamp(520px, 56vh, 680px);
    }
    @media (max-width: @phone) {
        height: clamp(280px, 55vh, 420px);
        height: clamp(280px, 55svh, 420px);
    }
    border-radius: 18px;
    border: 1px solid @pvx-border;
    overflow: hidden;
    background: url("~@/assets/img/exterior/stage-bg.webp") center / cover no-repeat,
        linear-gradient(180deg, #eaedf6 0%, #dce2f0 100%);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);

    &.is-3d {
        background: #1b2430;
    }
}

.m-ext-stage-img {
    width: 100%;
    height: 100%;
    padding: 14px 16px 8px;
    box-sizing: border-box;
    display: block;

    :deep(img) {
        cursor: zoom-in;
        filter: drop-shadow(0 12px 20px rgba(30, 41, 59, 0.16));
    }
}

.m-ext-stage-fallback {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    width: 100%;
    height: 100%;
    color: @pvx-text-secondary;
    font-size: 13px;

    .u-fallback-icon {
        width: 64px;
        height: 64px;
        border-radius: 14px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.14);
    }
}

.m-ext-stage-pills {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;

    .u-media-pill {
        padding: 5px 13px;
        border: 1px solid @pvx-border;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface;
        color: @pvx-text-regular;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.16s;

        &:hover {
            border-color: @pvx-border-focus;
            color: @pvx-primary-hover;
        }

        &.is-active {
            border-color: @pvx-primary;
            background: @pvx-primary-soft;
            color: @pvx-primary-hover;
            font-weight: 600;
        }
    }
}

.m-ext-info-col {
    grid-area: info;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: @pvx-space-3;
    min-width: 0;
}

.m-ext-title-block {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: @pvx-space-3;

    .u-title-icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(15, 23, 42, 0.12);
    }

    .m-title-texts {
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
}

.m-title-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.u-domain-tag,
.u-player-tag {
    display: inline-flex;
    align-items: center;
    padding: 2px 9px;
    border-radius: @pvx-radius-pill;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.4;
}

.u-player-tag {
    &.is-rose {
        color: #be123c;
        background: #fff1f2;
    }

    &.is-amber {
        color: #b45309;
        background: #fffbeb;
    }

    &.is-emerald {
        color: #047857;
        background: #ecfdf5;
    }

    &.is-indigo {
        color: #4338ca;
        background: #eef2ff;
    }

    &.is-sky {
        color: #0369a1;
        background: #f0f9ff;
    }

    &.is-violet {
        color: #6d28d9;
        background: #f5f3ff;
    }

    &.is-slate {
        color: #475569;
        background: #f1f5f9;
    }
}

.u-ext-name {
    margin: 0;
    font-size: 32px;
    font-weight: 750;
    line-height: 1.3;
    color: @pvx-text-primary;
    word-break: break-word;

    @media (max-width: @phone) {
        font-size: 22px;
    }
}

.u-game-origin {
    margin: 0;
    font-size: 13px;
    color: @pvx-text-secondary;
}

.m-ext-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .el-button {
        min-height: 40px;
        max-width: 100%;
        height: auto;
        margin-left: 0;
        border-radius: @pvx-radius-control;
        white-space: normal;

        &.is-plain {
            --el-button-text-color: @pvx-primary;
            --el-button-border-color: @pvx-border-focus;
            --el-button-bg-color: @pvx-primary-soft;
            --el-button-hover-text-color: @pvx-text-inverse;
            --el-button-hover-border-color: @pvx-primary;
            --el-button-hover-bg-color: @pvx-primary;
        }
    }

    @media (max-width: @phone) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        align-content: start;
        gap: 6px;

        .el-button {
            min-width: 0;
            min-height: 36px;
            height: 36px;
            padding: 0 8px;
            border-radius: @pvx-radius-small;
            font-size: 13px;
            line-height: 16px;
        }
    }

    .u-star-count {
        margin-left: 5px;
        padding: 1px 6px;
        border-radius: @pvx-radius-pill;
        background: rgba(99, 102, 241, 0.12);
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
    }
}

.m-ext-facts {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 10px;

    @media (min-width: (@phone + 1px)) and (max-width: @ipad-y) {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .u-fact-card {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        flex-wrap: wrap;
        gap: 4px 12px;
        padding: 12px 14px;
        border-radius: 14px;
        border: 1px solid @pvx-border-light;
        background: @pvx-surface-muted;
    }

    .u-fact-label {
        font-size: 12px;
        color: @pvx-text-secondary;
    }

    .u-fact-val,
    .u-price-val {
        font-size: 14px;
        font-weight: 700;
        color: @pvx-text-primary;
        line-height: 1.4;

        &.is-good {
            color: #059669;
        }

        &.is-muted {
            font-weight: 500;
            color: @pvx-text-secondary;
        }
    }

    .u-fact-prices {
        display: flex;
        flex-direction: column;
        gap: 2px;
    }

    .u-price-val {
        color: @pvx-primary-hover;
    }
}

.m-ext-section-box {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 14px 16px;
    border-radius: 14px;
    border: 1px solid @pvx-border-light;
    background: @pvx-surface-muted;

    .u-box-label {
        font-size: 12px;
        font-weight: 600;
        color: @pvx-text-secondary;
    }
}

.m-quick-links {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .u-quick-link {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        max-width: 100%;
        padding: 5px 11px 5px 6px;
        border-radius: 10px;
        border: 1px solid @pvx-border;
        background: @pvx-surface;
        color: @pvx-text-primary;
        text-decoration: none;
        font-size: 13px;
        transition: border-color 0.16s, box-shadow 0.16s, color 0.16s;

        &:hover {
            border-color: @pvx-border-focus;
            color: @pvx-primary;
            box-shadow: 0 3px 10px rgba(91, 92, 245, 0.1);
        }
    }

    .u-quick-badge {
        padding: 1px 7px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .u-quick-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: 500;
    }
}

.m-alias-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    .u-alias-chip {
        padding: 3px 10px;
        border-radius: @pvx-radius-pill;
        background: @pvx-surface;
        border: 1px solid @pvx-border;
        color: @pvx-text-primary;
        font-size: 13px;
        font-weight: 500;
    }
}

.m-ext-desc-box {
    .u-desc-text {
        margin: 0;
        font-size: 13px;
        line-height: 1.7;
        color: @pvx-text-regular;
        white-space: pre-line;
    }
}

.m-variant-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;

    @media (max-width: @phone) {
        grid-template-columns: minmax(0, 1fr);
    }

    .u-variant-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 10px;
        border-radius: 10px;
        background: @pvx-surface;
        border: 1px solid @pvx-border-light;
        font-size: 13px;
    }

    .u-variant-role {
        padding: 1px 7px;
        border-radius: @pvx-radius-pill;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
        font-size: 11px;
        font-weight: 600;
        flex-shrink: 0;
    }

    .u-variant-name {
        color: @pvx-text-primary;
        word-break: break-word;
    }
}

.m-ext-section {
    display: flex;
    flex-direction: column;
    min-width: 0;
    gap: @pvx-space-5;
    padding: @pvx-space-5;
    border-color: fade(@pvx-border, 80%);
    box-shadow: @pvx-shadow-xs;

    :deep(.c-pvx-section-header) {
        align-items: center;
        flex-wrap: wrap;
    }

    :deep(.c-pvx-section-header__main) {
        align-items: center;
        gap: @pvx-space-3;
    }

    :deep(.c-pvx-section-header__icon) {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        background: @pvx-primary-soft;
        color: @pvx-primary;

        svg {
            display: block;
            width: 22px;
            height: 22px;
        }
    }

    :deep(.c-pvx-section-header__title) {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        line-height: 24px;
    }

    :deep(.c-pvx-section-header__description) {
        margin: 2px 0 0;
        line-height: 18px;
    }

    @media (max-width: @phone) {
        padding: @pvx-space-4;
        gap: @pvx-space-4;

        :deep(.c-pvx-section-header__icon) {
            width: 40px;
            height: 40px;
        }
    }
}
</style>
