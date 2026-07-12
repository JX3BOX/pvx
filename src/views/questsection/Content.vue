<!--
 * QuestSection - 剑侠录右侧内容区域组件
 *
 * @description 展示剑侠录章节详情内容，包含固定按钮区域、图片、章节分组按钮和章节内容
 * @version 2.0.0
 *
 * @components
 * - PvxRobotTip: QQ机器人提示组件
 *
 * @props
 * - seasonData: 当前选中的资料片数据
 * - chapterData: 当前选中的大章节数据（包含 sections 小节列表）
 *
 * @emits
 * - section-change: 小节选中变化时触发，参数为选中的小节对象
 -->
<template>
    <div class="m-pvx-questsection-content">
        <!-- 右上角固定按钮区域 -->
        <div class="m-questsection-content__toolbar">
            <PvxRobotTip :reply="$t('pages.questsection.title')" :typeName="$t('pages.questsection.title')"
                :quickGuideText="$t('pages.questsection.ui.qqRobot')"
                :copySuccessTitle="$t('pages.questsection.ui.copySuccess')" hidden />
            <div class="u-feedback">
                <a href="https://jq.qq.com/?_wv=1027&k=5RgGcYT" target="_blank" class="u-btn u-btn--feedback"
                    :title="$t('pages.questsection.ui.feedback')" :aria-label="$t('pages.questsection.ui.feedback')">
                    <i class="el-icon-warning-outline"></i>
                    <span>{{ $t("pages.questsection.ui.feedback") }}</span>
                </a>
            </div>
        </div>

        <!-- 内容主体区域 -->
        <div class="m-questsection-content__body">
            <!-- 图片区块 -->
            <div class="m-questsection-content__header-image">
                <!-- 图片展示区块：地图背景 + 信息标签浮层 -->
                <div class="m-questsection-content__image" v-if="firstSectionDetail?.Chapter?.imagePath">
                    <img :src="getImageUrl(firstSectionDetail.Chapter.imagePath, firstSectionDetail.Chapter.imageFrame)"
                        :alt="pageTitle" class="u-image" />
                    <div class="m-questsection-content__map-info">
                        <div class="u-map-info-item" v-if="firstSectionDetail.Chapter.title">
                            <span class="u-map-info-text">{{ firstSectionDetail.Chapter.title }}</span>
                        </div>
                        <div class="u-map-info-item" v-if="firstSectionDetail.Chapter.time">
                            <span class="u-map-info-text">{{ firstSectionDetail.Chapter.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 章节分组按钮 -->
            <div ref="chapterNav" class="m-questsection-content__chapters"
                :class="{ 'is-stuck': isChapterNavStuck }" v-if="chapterGroups.length > 0">
                <div class="m-chapter-list">
                    <div v-for="(group, gIndex) in chapterGroups" :key="gIndex" class="u-chapter-group"
                        :class="{ 'is-active': activeGroupIndex === gIndex }"
                        @click="handleGroupClick(gIndex)">
                        <span class="u-chapter-name">{{ group.label }}</span>
                    </div>
                </div>
            </div>

            <!-- 章节内容展示区块 -->
            <div class="m-questsection-content__detail" v-if="visibleSectionDetails.length > 0">
                <div v-for="item in visibleSectionDetails" :key="item.sectionId" class="m-section-block">
                    <h3 class="u-section-title">{{ $t("pages.questsection.ui.sectionTitle", {
                        number: item.sectionIndex + 1,
                        title: item.sectionTitle,
                    }) }}</h3>
                    <div class="u-section-detail" v-html="item.formattedDetail"></div>
                </div>

                <!-- 加载更多按钮 -->
                <div class="u-load-more" :class="{ 'is-loading-state': loading }"
                    v-if="hasMoreSections || loading" @click="!loading && loadMore()">
                    <template v-if="loading">
                        <el-icon class="u-loading-icon is-loading">
                            <Loading />
                        </el-icon>
                        <span>{{ $t("pages.questsection.ui.loading") }}</span>
                    </template>
                    <span v-else>{{ $t("pages.questsection.ui.loadMore") }}</span>
                </div>
            </div>

            <!-- 空状态展示 -->
            <div class="m-questsection-content__empty" v-if="visibleSectionDetails.length === 0 && !loading">
                <div class="u-empty-text">{{ $t("pages.questsection.ui.empty") }}</div>
            </div>

            <!-- 加载状态 -->
            <div class="m-questsection-content__loading" v-if="loading && visibleSectionDetails.length === 0">
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
                <span>{{ $t("pages.questsection.ui.loading") }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import { getDetail } from "@/service/questsection.js";
import { Loading } from "@element-plus/icons-vue";
import { getQuestsectionImageUrl, formatQuestsectionDetail } from "@/utils/questsection.js";

const SECTION_PAGE_SIZE = 4;

export default {
    name: "QuestsectionContent",
    components: {
        PvxRobotTip,
        Loading,
    },
    props: {
        seasonData: {
            type: Object,
            default: () => null,
        },
        chapterData: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            sectionDetailsMap: {},
            activeGroupIndex: 0,
            displayGroupIndex: 0,
            loadedGroupsCount: 1,
            loading: false,
            isChapterNavStuck: false,
        };
    },
    computed: {
        pageTitle() {
            if (this.seasonData && this.chapterData) {
                return `${this.seasonData.szTitle} - ${this.chapterData.szTitle}`;
            }
            return this.$t("pages.questsection.title");
        },
        chapterSections() {
            return this.chapterData?.Sections || [];
        },
        chapterGroups() {
            const sections = this.chapterSections;
            if (!sections.length) return [];
            const groups = [];
            for (let i = 0; i < sections.length; i += SECTION_PAGE_SIZE) {
                const start = i + 1;
                const end = Math.min(i + SECTION_PAGE_SIZE, sections.length);
                groups.push({
                    label: start === end ? `${start}` : `${start}-${end}`,
                    startIndex: i,
                    sections: sections.slice(i, i + SECTION_PAGE_SIZE),
                });
            }
            return groups;
        },
        currentGroupSections() {
            if (this.activeGroupIndex >= this.chapterGroups.length) return [];
            return this.chapterGroups[this.activeGroupIndex]?.sections || [];
        },
        visibleSections() {
            const sections = [];
            for (let i = 0; i < this.loadedGroupsCount; i++) {
                const groupIndex = this.displayGroupIndex + i;
                if (groupIndex < this.chapterGroups.length) {
                    const group = this.chapterGroups[groupIndex];
                    group.sections.forEach((section, localIdx) => {
                        sections.push({
                            ...section,
                            _globalIndex: group.startIndex + localIdx,
                        });
                    });
                }
            }
            return sections;
        },
        hasMoreSections() {
            return this.displayGroupIndex + this.loadedGroupsCount < this.chapterGroups.length;
        },
        visibleSectionDetails() {
            return this.visibleSections
                .map((section) => {
                    const detail = this.sectionDetailsMap[section.nSectionID];
                    if (!detail) return null;
                    return {
                        sectionId: section.nSectionID,
                        sectionIndex: section._globalIndex,
                        sectionTitle: section.szTitle || detail.szTitle || "",
                        formattedDetail: detail.szDetail
                            ? formatQuestsectionDetail(detail.szDetail)
                            : "",
                    };
                })
                .filter(Boolean);
        },
        firstSectionDetail() {
            const firstSection = this.chapterGroups[this.displayGroupIndex]?.sections?.[0];
            if (!firstSection) return null;
            return this.sectionDetailsMap[firstSection.nSectionID] || null;
        },
    },
    watch: {
        chapterData: {
            handler(newVal) {
                this.sectionDetailsMap = {};
                this.activeGroupIndex = 0;
                this.displayGroupIndex = 0;
                this.loadedGroupsCount = 1;
                if (newVal && newVal.Sections?.length > 0) {
                    this.loadGroupSections(0);
                }
                this.$nextTick(this.updateChapterNavStickyState);
            },
            immediate: true,
        },
    },
    mounted() {
        window.addEventListener("scroll", this.updateChapterNavStickyState, { passive: true });
        window.addEventListener("resize", this.updateChapterNavStickyState);
        this.$nextTick(this.updateChapterNavStickyState);
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.updateChapterNavStickyState);
        window.removeEventListener("resize", this.updateChapterNavStickyState);
    },
    methods: {
        updateChapterNavStickyState() {
            const chapterNav = this.$refs.chapterNav;
            if (!chapterNav) {
                this.isChapterNavStuck = false;
                return;
            }

            const stickyTop = Number.parseFloat(window.getComputedStyle(chapterNav).top) || 0;
            this.isChapterNavStuck = chapterNav.getBoundingClientRect().top <= stickyTop + 0.5;
        },

        getImageUrl(imagePath, nImageFrame) {
            return getQuestsectionImageUrl(imagePath, nImageFrame);
        },

        async loadSectionDetail(sectionId) {
            if (!sectionId) return null;
            if (this.sectionDetailsMap[sectionId]) return this.sectionDetailsMap[sectionId];

            try {
                const params = {
                    client: "std",
                    season_id: this.seasonData?.nSeasonID,
                    chapter_id: this.chapterData?.nChapterID,
                };
                const res = await getDetail(sectionId, params);
                if (res.data?.data) {
                    this.sectionDetailsMap = {
                        ...this.sectionDetailsMap,
                        [sectionId]: res.data.data,
                    };
                    return res.data.data;
                }
            } catch (error) {
                console.error("加载小节详情失败:", error);
            }
            return null;
        },

        async loadGroupSections(groupIndex) {
            const group = this.chapterGroups[groupIndex];
            if (!group) return;

            this.loading = true;
            this.activeGroupIndex = groupIndex;

            const promises = group.sections.map((section) =>
                this.loadSectionDetail(section.nSectionID)
            );
            try {
                await Promise.all(promises);
                this.displayGroupIndex = groupIndex;
                this.loadedGroupsCount = 1;
            } finally {
                this.loading = false;
            }
        },

        handleGroupClick(groupIndex) {
            if (this.activeGroupIndex === groupIndex) return;
            this.loadGroupSections(groupIndex);
            const group = this.chapterGroups[groupIndex];
            if (group?.sections?.[0]) {
                this.$emit("section-change", group.sections[0]);
            }
        },

        async loadMore() {
            if (this.loading) return;

            const nextGroupIndex = this.displayGroupIndex + this.loadedGroupsCount;
            if (nextGroupIndex >= this.chapterGroups.length) return;

            const nextGroup = this.chapterGroups[nextGroupIndex];
            this.loading = true;
            await Promise.all(
                nextGroup.sections.map((section) =>
                    this.loadSectionDetail(section.nSectionID)
                )
            );
            this.loadedGroupsCount++;
            this.loading = false;
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/questsection/content.less";
</style>
