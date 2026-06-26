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
            <PvxRobotTip reply="剑侠录" typeName="剑侠录" hidden />
            <div class="u-feedback">
                <a href="https://jq.qq.com/?_wv=1027&k=5RgGcYT" target="_blank" class="u-btn u-btn--feedback">
                    <i class="el-icon-warning-outline"></i>
                    <span>错误反馈</span>
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
            <div class="m-questsection-content__chapters" v-if="chapterGroups.length > 0">
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
                    <h3 class="u-section-title">章节{{ item.sectionIndex + 1 }}：{{ item.sectionTitle }}</h3>
                    <div class="u-section-detail" v-html="item.formattedDetail"></div>
                </div>

                <!-- 加载更多按钮 -->
                <div class="u-load-more" v-if="hasMoreSections" @click="loadMore">
                    加载更多
                </div>
            </div>

            <!-- 空状态展示 -->
            <div class="m-questsection-content__empty" v-if="visibleSectionDetails.length === 0 && !loading">
                <div class="u-empty-text">暂无内容</div>
            </div>

            <!-- 加载状态 -->
            <div class="m-questsection-content__loading" v-if="loading">
                <el-icon class="is-loading">
                    <Loading />
                </el-icon>
                <span>加载中...</span>
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
            loadedGroupsCount: 1,
            loading: false,
        };
    },
    computed: {
        pageTitle() {
            if (this.seasonData && this.chapterData) {
                return `${this.seasonData.szTitle} - ${this.chapterData.szTitle}`;
            }
            return "剑侠录";
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
                const groupIndex = this.activeGroupIndex + i;
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
            return this.activeGroupIndex + this.loadedGroupsCount < this.chapterGroups.length;
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
            const firstSection = this.currentGroupSections[0];
            if (!firstSection) return null;
            return this.sectionDetailsMap[firstSection.nSectionID] || null;
        },
    },
    watch: {
        chapterData: {
            handler(newVal) {
                this.sectionDetailsMap = {};
                this.activeGroupIndex = 0;
                this.loadedGroupsCount = 1;
                if (newVal && newVal.Sections?.length > 0) {
                    this.loadGroupSections(0);
                }
            },
            immediate: true,
        },
    },
    methods: {
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
            this.loadedGroupsCount = 1;

            const promises = group.sections.map((section) =>
                this.loadSectionDetail(section.nSectionID)
            );
            await Promise.all(promises);
            this.loading = false;
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
            const nextGroupIndex = this.activeGroupIndex + this.loadedGroupsCount;
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
