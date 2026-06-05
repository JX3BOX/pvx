<!--
 * JXL - 剑侠录右侧内容区域组件
 *
 * @description 展示剑侠录章节详情内容，包含固定按钮区域、标题、图片、章节列表和章节内容
 * @version 1.0.0
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
    <div class="m-pvx-jxl-content">
        <!-- 右上角固定按钮区域 -->
        <div class="m-jxl-content__toolbar">
            <PvxRobotTip reply="剑侠录" typeName="剑侠录" hidden />
            <div class="u-feedback">
                <a href="https://jq.qq.com/?_wv=1027&k=5RgGcYT" target="_blank" class="u-btn u-btn--feedback">
                    <i class="el-icon-warning-outline"></i>
                    <span>错误反馈</span>
                </a>
            </div>
        </div>

        <!-- 内容主体区域 -->
        <div class="m-jxl-content__body">
            <!-- 标题和图片区块（阴影容器） -->
            <div class="m-jxl-content__header-image">
                <!-- 标题 -->
                <div class="m-jxl-content__header">
                    <h1 class="u-title">{{ chapterData?.szTitle || '-' }}</h1>
                </div>

                <!-- 图片展示区块：地图背景 + 信息标签浮层 -->
                <div class="m-jxl-content__image" v-if="sectionDetail?.Chapter?.imagePath">
                    <img :src="getImageUrl(sectionDetail.Chapter.imagePath, sectionDetail.Chapter.imageFrame)"
                        :alt="pageTitle" class="u-image" />
                    <div class="m-jxl-content__map-info">
                        <div class="u-map-info-item" v-if="sectionDetail.Chapter.title">
                            <span class="u-map-info-text">{{ sectionDetail.Chapter.title }}</span>
                        </div>
                        <div class="u-map-info-item" v-if="sectionDetail.Chapter.time">
                            <span class="u-map-info-text">{{ sectionDetail.Chapter.time }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 章节列表展示 -->
            <div class="m-jxl-content__chapters" v-if="chapterSections.length > 0">
                <div class="m-chapter-list">
                    <div v-for="(section, index) in chapterSections" :key="section.nSectionID" class="u-chapter-item"
                        :class="{ 'is-active': activeSectionId === section.nSectionID }"
                        @click="handleSectionClick(section)">
                        <span class="u-chapter-name">章节{{ index + 1 }}：{{ section.szTitle }}</span>
                    </div>
                </div>
            </div>

            <!-- 章节内容展示区块 -->
            <div class="m-jxl-content__detail" v-if="sectionDetail">
                <div class="u-detail-content" v-html="formattedDetail"></div>
            </div>

            <!-- 空状态展示 -->
            <div class="m-jxl-content__empty" v-if="!sectionDetail && !loading">
                <div class="u-empty-text">暂无内容</div>
            </div>

            <!-- 加载状态 -->
            <div class="m-jxl-content__loading" v-if="loading">
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
import { getDetail } from "@/service/jxl.js";
import { Loading } from "@element-plus/icons-vue";
import { getChapterImageUrl, formatJxlDetail } from "@/utils/jxl.js";

export default {
    name: "JxlContent",
    components: {
        PvxRobotTip,
        Loading,
    },
    props: {
        // 当前选中的资料片数据
        seasonData: {
            type: Object,
            default: () => null,
        },
        // 当前选中的大章节数据（包含 sections 小节列表）
        chapterData: {
            type: Object,
            default: () => null,
        },
    },
    data() {
        return {
            // 小节详情数据
            sectionDetail: null,
            // 当前激活的小节ID
            activeSectionId: null,
            // 加载状态
            loading: false,
        };
    },
    computed: {
        // 页面标题：资料片名称 - 大章节名称
        pageTitle() {
            if (this.seasonData && this.chapterData) {
                return `${this.seasonData.szTitle} - ${this.chapterData.szTitle}`;
            }
            return "剑侠录";
        },
        // 页面副标题
        pageSubtitle() {
            if (this.sectionDetail) {
                return this.sectionDetail.szTitle || "";
            }
            return "";
        },
        // 当前大章节下的所有小节（从 chapterData 中获取）
        chapterSections() {
            return this.chapterData?.Sections || [];
        },
        // 当前选中的小节索引
        currentSectionIndex() {
            if (!this.activeSectionId || !this.chapterSections.length) return -1;
            return this.chapterSections.findIndex(
                (section) => section.nSectionID === this.activeSectionId
            );
        },
        // 格式化后的详情内容
        formattedDetail() {
            if (!this.sectionDetail || !this.sectionDetail.szDetail) return "";
            return formatJxlDetail(this.sectionDetail.szDetail);
        },
    },
    watch: {
        // 监听大章节数据变化，自动加载第一个小节详情
        chapterData: {
            handler(newVal) {
                if (newVal && newVal.Sections?.length > 0) {
                    // 默认选中第一个小节
                    const firstSection = newVal.Sections[0];
                    this.activeSectionId = firstSection.nSectionID;
                    this.loadSectionDetail(firstSection.nSectionID);
                } else {
                    // 清空数据
                    this.activeSectionId = null;
                    this.sectionDetail = null;
                }
            },
            immediate: true,
        },
    },
    methods: {
        /**
         * 获取图片完整URL
         * - 使用 getChapterImageUrl 处理章节图片路径
         * @param {String} imagePath - 图片路径（如 "ui\\Image\\WorldMap\\MainPlotMap\\MainPlotMap10.UITex"）
         * @param {Number} nImageFrame - 图片帧数
         * @returns {String} 完整的图片URL
         */
        getImageUrl(imagePath, nImageFrame) {
            if (!imagePath) return "";

            // 使用剑侠录专用的图片处理函数
            return getChapterImageUrl({
                imagePath: imagePath,
                nImageFrame: nImageFrame
            });
        },

        /**
         * 加载小节详情
         * @param {number} sectionId - 小节ID
         */
        async loadSectionDetail(sectionId) {
            if (!sectionId) return;

            this.loading = true;
            try {
                const params = {
                    client: "std",
                    season_id: this.seasonData?.nSeasonID,
                    chapter_id: this.chapterData?.nChapterID,
                };
                const res = await getDetail(sectionId, params);
                if (res.data?.data) {
                    this.sectionDetail = res.data.data;
                }
            } catch (error) {
                console.error("加载小节详情失败:", error);
                this.sectionDetail = null;
            } finally {
                this.loading = false;
            }
        },

        /**
         * 点击章节项
         * @param {Object} section - 小节数据
         */
        handleSectionClick(section) {
            if (this.activeSectionId === section.nSectionID) return;
            this.activeSectionId = section.nSectionID;
            this.loadSectionDetail(section.nSectionID);
            // 通知父组件选中变化
            this.$emit("section-change", section);
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/jxl/content.less";
</style>