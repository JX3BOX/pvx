<!--
 * Partner Info - 侠客信息 TAB 内容组件
 *
 * @description 结识方式 + 武学招式 + 武学境界 + 属性
 * TAB 和头部（名字+ID）已移到 Index.vue 统一管理
 *
 * @features
 * - 结识道具：从 API 获取物品详情，展示图标 + 悬停 popover
 * - 加载状态：道具加载中显示 loading 效果
 * - 错误处理：API 失败时优雅降级，仍可点击跳转
 -->
<template>
    <div class="m-partner-info-content">
        <!-- 结识方式 -->
        <div class="m-partner-intro">
            <span class="u-partner-intro-title">{{ $t("pages.partner.ui.sections.introduction") }}</span>
            <div v-if="partner?.introduce" class="u-partner-intro-map">
                {{ partner.introduce }}
            </div>
            <div v-if="partner?.limitTip" class="u-partner-intro-desc" v-html="formatDesc(partner.limitTip)"></div>

            <!-- 结识道具列表（网格布局 + 圆形图标 + 悬停 popover） -->
            <div v-if="partner?.drawItems && partner.drawItems.length" class="m-partner-item-grid">
                <template v-for="it in partner.drawItems" :key="getSourceId(it)">
                    <!-- 有物品详情时显示带 popover 的圆形图标 -->
                    <el-popover v-if="itemDetails[getSourceId(it)]" :key="'pop-' + getSourceId(it)" placement="top"
                        trigger="hover" width="400" popper-class="m-pvx-item-popover">
                        <template #reference>
                            <!-- 圆形图标（类似武学招式） -->
                            <a class="u-partner-item-icon is-circle" :href="getItemWikiUrl(getSourceId(it))"
                                target="_blank" rel="noopener noreferrer" :title="getItemName(it)">
                                <img v-if="getItemIconId(it) && !failedItemIcons[getSourceId(it)]"
                                    :src="resolveSkillIcon(getItemIconId(it))" :alt="getItemName(it)"
                                    @error="handleImageError(it)" />
                                <span v-else class="u-partner-item-fallback">{{ getItemFallback(it) }}</span>
                            </a>
                        </template>
                        <!-- Popover 内容区域 -->
                        <div class="m-pvx-item-detail">
                            <h4 class="u-pvx-item-name">{{ getItemName(it) }}</h4>
                            <div class="u-pvx-item-meta">
                                <p v-if="getBindType(getItemSource(it)) !== null">
                                    {{ getBindType(getItemSource(it)) }}
                                </p>
                                <p v-if="getTimeLimit(getItemSource(it))">
                                    {{ $t("pages.partner.ui.timeLimit", { days: getTimeLimit(getItemSource(it)) }) }}
                                </p>
                                <p v-if="getMaxStack(getItemSource(it))">
                                    {{ $t("pages.partner.ui.maxOwned", { count: getMaxStack(getItemSource(it)) }) }}
                                </p>
                            </div>
                            <!-- 描述内容：优先使用 post.content（HTML 格式） -->
                            <div v-if="getItemPost(it)?.content" class="u-pvx-item-desc"
                                v-html="getItemPost(it).content">
                            </div>
                            <div v-else-if="getDesc(getItemSource(it))" class="u-pvx-item-desc"
                                v-html="formatItemDesc(getDesc(getItemSource(it)))">
                            </div>
                            <div v-if="getSourceText(getItemSource(it))" class="u-pvx-item-source">
                                {{ getSourceText(getItemSource(it)) }}
                            </div>
                        </div>
                    </el-popover>

                    <!-- 加载中的道具 -->
                    <div v-else-if="loadingItems.includes(getSourceId(it))" :key="'load-' + getSourceId(it)"
                        class="u-partner-item-icon is-circle u-partner-item-icon--loading"
                        :title="$t('pages.partner.ui.itemLoading', { id: getSourceId(it) })">
                        <i class="el-icon-loading"></i>
                    </div>

                    <!-- 加载失败或无数据的降级显示 -->
                    <a v-else :key="'fallback-' + getSourceId(it)" :href="getItemWikiUrl(getSourceId(it))"
                        target="_blank" rel="noopener noreferrer" class="u-partner-item-icon is-circle" :title="getItemName(it)">
                        <span class="u-partner-item-fallback">{{ getItemFallback(it) }}</span>
                    </a>
                </template>
            </div>

            <div v-if="!hasIntro" class="u-partner-intro-desc">{{ $t("pages.partner.ui.emptyIntroduction") }}</div>
        </div>

        <!-- 武学招式（被动默认圆；其它方） -->
        <SkillList v-if="partner?.skills && partner.skills.length" :skills="partner.skills" type="skill" />

        <!-- 武学境界 + 属性（同一行两列） -->
        <div class="m-partner-info__row">
            <div class="m-partner-info__col">
                <SkillList v-if="partner?.stages && partner.stages.length" :skills="partner.stages" type="realm" />
            </div>
            <div class="m-partner-info__col">
                <AttributeTable :attrs="partner?.attrs || []" />
            </div>
        </div>
    </div>
</template>

<script>
import SkillList from "./SkillList.vue";
import AttributeTable from "./AttributeTable.vue";
import { getItemWikiUrl, resolveSkillIcon } from "@/utils/partner";
import { getPartnerItemsDetail } from "@/service/partner";
import { sanitizeBasicHtml } from "@/utils/sanitize-html";

export default {
    name: "PartnerInfo",
    components: {
        SkillList,
        AttributeTable,
    },
    props: {
        // 当前选中的侠客
        partner: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            // 物品详情缓存 { itemId: itemData }
            itemDetails: {},
            // 正在加载的物品 ID 列表
            loadingItems: [],
            failedItemIcons: {},
        };
    },
    computed: {
        hasIntro() {
            const p = this.partner;
            if (!p) return false;
            return !!(p.introduce || p.limitTip || (p.drawItems && p.drawItems.length));
        },
    },
    watch: {
        // 监听侠客变化时重新获取物品详情
        "partner.drawItems": {
            handler(items) {
                if (items && items.length > 0) {
                    this.fetchItemDetails(items);
                } else {
                    this.itemDetails = {};
                    this.loadingItems = [];
                    this.failedItemIcons = {};
                }
            },
            immediate: true, // 初始化时也触发
            deep: true,
        },
    },
    methods: {
        formatDesc(desc) {
            if (!desc) return "";
            return sanitizeBasicHtml(desc);
        },
        /**
         * 格式化物品描述（支持 \n 和 \\n 换行）
         */
        formatItemDesc(content) {
            if (!content) return "";
            return sanitizeBasicHtml(content);
        },
        /**
         * 获取完整的 sourceId（tableId_itemId 格式，如 "5_45838"）
         * 用于 API 查询和作为缓存 key
         */
        getSourceId(item) {
            if (!item) return "";
            // 组合 tableId 和 itemId 为完整 sourceId
            return `${item.tableId}_${item.itemId}`;
        },
        /**
         * 获取物品详情中的 source 对象
         * API 返回数据结构：itemDetails[sourceId] = { code, msg, data: { source, post, ... } }
         * 正确路径：detail.data.source
         */
        getItemSource(item) {
            const sourceId = this.getSourceId(item);
            const detail = this.itemDetails[sourceId];
            // 正确提取路径：detail.data.source
            return detail?.data?.source || null;
        },
        /**
         * 获取物品详情中的 post 对象（用户编辑的内容）
         * API 返回数据结构：detail.data.post
         */
        getItemPost(item) {
            const sourceId = this.getSourceId(item);
            const detail = this.itemDetails[sourceId];
            return detail?.data?.post || null;
        },
        /**
         * 获取物品 IconID（从 source 对象中提取）
         */
        getItemIconId(item) {
            const source = this.getItemSource(item);
            return source?.IconID || null;
        },
        /**
         * 获取物品显示名称（优先使用 post.title，其次 source.Name）
         */
        getItemName(item) {
            const post = this.getItemPost(item);
            const source = this.getItemSource(item);
            // 优先使用用户编辑的标题
            if (post?.title) return post.title;
            if (source?.Name) return source.Name;
            const sourceId = this.getSourceId(item);
            return sourceId
                ? this.$t("pages.partner.ui.itemFallback", { id: sourceId })
                : this.$t("pages.partner.ui.unknownItem");
        },
        /**
         * 获取物品 fallback 文本（无图标时显示首字）
         */
        getItemFallback(item) {
            const name = this.getItemName(item);
            return name.slice(0, 1);
        },
        /**
         * 获取绑定类型文本（从 source 对象中提取）
         * BindType: null=可交易, 0=不可交易, 3=拾取绑定
         */
        getBindType(source) {
            if (!source) return null;
            const bindType = source.BindType;
            if (bindType === undefined || bindType === null) return this.$t("pages.partner.ui.bindTypes.tradeable");
            if (bindType === 0) return this.$t("pages.partner.ui.bindTypes.untradeable");
            if (bindType === 3) return this.$t("pages.partner.ui.bindTypes.bindOnPickup");
            return this.$t("pages.partner.ui.bindTypes.other", { type: bindType });
        },
        /**
         * 获取限时时间（从 source.MaxExistTime 计算，单位秒）
         */
        getTimeLimit(source) {
            if (!source) return null;
            const maxExistTime = source.MaxExistTime;
            if (!maxExistTime) return null;
            // 转换秒为天
            return Math.floor(maxExistTime / 86400);
        },
        /**
         * 获取最大拥有数（从 source 对象中提取）
         */
        getMaxStack(source) {
            if (!source) return null;
            return source.MaxExistAmount || source.MaxStack || null;
        },
        /**
         * 获取物品描述（优先使用 post.content，其次 source.Desc）
         * post.content 是用户编辑的 HTML 内容
         * source.Desc 是原始游戏数据（XML 格式）
         */
        getDesc(source) {
            // 注意：此方法接收的是 source 对象，但需要从 post 获取内容
            // 在模板中通过 getItemPost(it) 获取 post 对象
            if (!source) return "";
            // source.Desc 是 XML 格式，需要特殊处理
            return source.Desc ?? "";
        },
        /**
         * 获取物品来源文本（从 source.Source 字段）
         */
        getSourceText(source) {
            if (!source) return "";
            const sourceType = source.Source;
            if (!sourceType) return "";
            // 映射来源类型
            const sourceMap = {
                other: this.$t("pages.partner.ui.sources.other"),
                drop: this.$t("pages.partner.ui.sources.drop"),
                quest: this.$t("pages.partner.ui.sources.quest"),
                craft: this.$t("pages.partner.ui.sources.craft"),
                shop: this.$t("pages.partner.ui.sources.shop"),
            };
            return sourceMap[sourceType] || sourceType;
        },
        /**
         * 获取物品品质颜色（从 source.Quality 字段）
         * Quality: 1-5 对应白/绿/蓝/紫/金
         */
        getQualityColor(source) {
            if (!source) return null;
            const quality = source.Quality;
            if (!quality) return null;
            const colors = {
                1: "#ffffff", // 白
                2: "#00ff88", // 绿
                3: "#4a9eff", // 蓝
                4: "#ff6b6b", // 紫
                5: "#ffd700", // 金
            };
            return colors[quality] || null;
        },
        /**
         * 获取结识道具的详细信息
         * 使用完整的 sourceId（tableId_itemId）作为 API 查询参数
         */
        async fetchItemDetails(drawItems) {
            if (!drawItems || drawItems.length === 0) return;

            // 提取所有道具的完整 sourceId（如 "5_45838"）
            const sourceIds = drawItems.map((it) => this.getSourceId(it)).filter(Boolean);

            // 设置加载状态
            this.loadingItems = [...new Set([...this.loadingItems, ...sourceIds])];

            try {
                // 批量请求物品详情（使用完整 sourceId）
                const details = await getPartnerItemsDetail(sourceIds);

                // 更新物品详情缓存
                this.itemDetails = { ...this.itemDetails, ...details };
            } catch (err) {
                console.error("[partner] 获取物品详情失败:", err);
                // 错误时不清空已有数据，保持降级显示
            } finally {
                // 移除加载状态
                this.loadingItems = this.loadingItems.filter((id) => !sourceIds.includes(id));
            }
        },
        /**
         * 图片加载失败处理
         */
        handleImageError(item) {
            this.failedItemIcons[this.getSourceId(item)] = true;
        },
        getItemWikiUrl,
        resolveSkillIcon,
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/partner/partner-info.less";
</style>
