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
        <div class="m-questsection-content__top">
            <PvxSurface class="m-questsection-content__header-image" padding="small">
                <div class="m-questsection-content__image">
                    <img v-if="firstSectionDetail?.Chapter?.imagePath"
                        :src="getImageUrl(firstSectionDetail.Chapter.imagePath, firstSectionDetail.Chapter.imageFrame)"
                        :alt="pageTitle" class="u-image" />
                    <div v-if="firstSectionDetail?.Chapter" class="m-questsection-content__map-info">
                        <div class="u-map-info-item" v-if="firstSectionDetail.Chapter.title">
                            <span class="u-map-info-text">{{ firstSectionDetail.Chapter.title }}</span>
                        </div>
                        <div class="u-map-info-meta">
                            <span v-if="firstSectionDetail.Chapter.time" class="u-map-info-text">
                                {{ firstSectionDetail.Chapter.time }}
                            </span>
                            <span
                                v-if="firstSectionDetail.Chapter.time && chapterSections.length"
                                class="u-map-info-separator"
                                aria-hidden="true"
                            >·</span>
                            <span v-if="chapterSections.length" class="u-map-info-text">
                                {{ $t("pages.questsection.ui.totalSections", { count: chapterSections.length }) }}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="m-questsection-content__chapters m-questsection-content__chapters--desktop"
                    v-if="chapterGroups.length > 0">
                    <div class="m-chapter-list">
                        <div v-for="(group, gIndex) in chapterGroups" :key="gIndex" class="u-chapter-group"
                            :class="{ 'is-active': activeGroupIndex === gIndex }"
                            @click="handleGroupClick(gIndex)">
                            <span class="u-chapter-name">{{ group.label }}</span>
                        </div>
                    </div>
                </div>
                <div class="m-questsection-content__aside">
                    <PvxActionButton
                        href="https://jq.qq.com/?_wv=1027&k=5RgGcYT"
                        class="u-btn u-btn--feedback"
                        variant="ghost"
                        :title="$t('pages.questsection.ui.feedback')" :aria-label="$t('pages.questsection.ui.feedback')">
                        <i class="el-icon-warning-outline"></i>
                        <span>{{ $t("pages.questsection.ui.feedback") }}</span>
                    </PvxActionButton>
                    <PvxRobotTip :reply="$t('pages.questsection.title')" :typeName="$t('pages.questsection.title')"
                        :quickGuideText="$t('pages.questsection.ui.qqRobot')"
                        :copySuccessTitle="$t('pages.questsection.ui.copySuccess')" hidden />
                </div>
            </PvxSurface>
        </div>

        <div class="m-questsection-content__chapters m-questsection-content__chapters--mobile"
            v-if="chapterGroups.length > 0">
            <div class="m-chapter-list">
                <div v-for="(group, gIndex) in chapterGroups" :key="gIndex" class="u-chapter-group"
                    :class="{ 'is-active': activeGroupIndex === gIndex }"
                    @click="handleGroupClick(gIndex)">
                    <span class="u-chapter-name">{{ group.label }}</span>
                </div>
            </div>
        </div>

        <!-- 内容主体区域 -->
        <div class="m-questsection-content__body">
            <!-- 章节内容展示区块 -->
            <PvxSurface class="m-questsection-content__detail" padding="large"
                v-if="visibleSectionDetails.length > 0">
                <div v-for="item in visibleSectionDetails" :key="item.sectionId" class="m-section-block">
                    <h3 class="u-section-title">{{ $t("pages.questsection.ui.sectionTitle", {
                        number: item.sectionIndex + 1,
                        title: item.sectionTitle,
                    }) }}</h3>
                    <div class="u-section-detail" v-html="item.formattedDetail"></div>
                </div>

            </PvxSurface>

            <!-- 空状态展示 -->
            <PvxSurface class="m-questsection-content__empty" padding="medium"
                v-if="visibleSectionDetails.length === 0 && !loading">
                <PvxEmptyState illustrated
                    :title="$t(loadFailed ? 'pages.questsection.ui.loadFailed' : 'pages.questsection.ui.empty')">
                    <template v-if="loadFailed" #action>
                        <PvxActionButton @click="retryFailedLoad">
                            {{ $t("pages.questsection.ui.retry") }}
                        </PvxActionButton>
                    </template>
                </PvxEmptyState>
            </PvxSurface>

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
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { getDetail } from "@/service/questsection.js";
import { Loading } from "@element-plus/icons-vue";
import { getQuestsectionImageUrl, formatQuestsectionDetail } from "@/utils/questsection.js";

const SECTION_PAGE_SIZE = 4;

export default {
    name: "QuestsectionContent",
    components: {
        PvxRobotTip,
        PvxActionButton,
        PvxEmptyState,
        PvxSurface,
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
            loading: false,
            requestSequence: 0,
            loadFailed: false,
            failedRequest: null,
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
        visibleSections() {
            const group = this.chapterGroups[this.displayGroupIndex];
            if (!group) return [];
            return group.sections.map((section, localIdx) => ({
                ...section,
                _globalIndex: group.startIndex + localIdx,
            }));
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
                this.requestSequence++;
                this.loadFailed = false;
                this.failedRequest = null;
                if (newVal && newVal.Sections?.length > 0) {
                    const routeSectionId = Number(this.$route?.params?.id);
                    const routeSectionIndex = newVal.Sections.findIndex(
                        (section) => Number(section.nSectionID) === routeSectionId
                    );
                    const initialGroupIndex = routeSectionIndex >= 0
                        ? Math.floor(routeSectionIndex / SECTION_PAGE_SIZE)
                        : 0;
                    this.loadGroupSections(initialGroupIndex);
                }
            },
            immediate: true,
        },
    },
    methods: {
        getImageUrl(imagePath, nImageFrame) {
            return getQuestsectionImageUrl(imagePath, nImageFrame);
        },

        async loadSectionDetail(sectionId, requestId) {
            if (!sectionId) return null;
            if (this.sectionDetailsMap[sectionId]) return this.sectionDetailsMap[sectionId];

            try {
                const params = {
                    client: "std",
                    season_id: this.seasonData?.nSeasonID,
                    chapter_id: this.chapterData?.nChapterID,
                };
                const res = await getDetail(sectionId, params);
                if (requestId === this.requestSequence && res.data?.data) {
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

            const requestId = ++this.requestSequence;
            this.loading = true;
            this.loadFailed = false;
            this.failedRequest = null;
            this.activeGroupIndex = groupIndex;

            const promises = group.sections.map((section) =>
                this.loadSectionDetail(section.nSectionID, requestId)
            );
            try {
                const details = await Promise.all(promises);
                if (requestId !== this.requestSequence) return;
                if (details.some((detail) => !detail)) {
                    this.activeGroupIndex = this.displayGroupIndex;
                    this.loadFailed = true;
                    this.failedRequest = { type: "group", groupIndex };
                    return;
                }
                this.displayGroupIndex = groupIndex;
            } finally {
                if (requestId === this.requestSequence) {
                    this.loading = false;
                }
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

        retryFailedLoad() {
            const failedRequest = this.failedRequest;
            if (!failedRequest || this.loading) return;
            this.loadGroupSections(failedRequest.groupIndex);
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/questsection/content.less";
</style>
