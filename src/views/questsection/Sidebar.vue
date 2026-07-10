<!--
 * QuestSection Sidebar - 剑侠录左侧导航栏组件
 *
 * @description 剑侠录模块的左侧导航栏，包含搜索框和资料片-大章节折叠列表
 * @version 1.0.0
 *
 * @features
 * - fixed 布局，固定位置不随浏览器滚动
 * - 搜索框支持搜索资料片和大章节
 * - 资料片折叠展开交互，300ms 动画过渡
 * - 默认展开"风起稻香"资料片，默认选择第一个大章节
 * - 支持整体展开/折叠功能：未展开高度314px，展开后最大600px
 *
 * @emits
 * - select: 选择大章节时触发，参数为 { season, chapter }
-->
<template>
    <div class="m-pvx-questsection-sidebar" :class="{ 'is-expanded': isSidebarExpanded }">
        <!-- 搜索框模块 -->
        <div class="m-questsection-sidebar__search">
            <div class="u-questsection-search-input">
                <input
                    v-model="searchKeyword"
                    class="u-questsection-search-field"
                    placeholder="输入资料片或章节关键词"
                    @input="handleSearch"
                />
                <img class="u-questsection-search-icon" src="@/assets/img/questsection/search.svg" alt="" />
            </div>
        </div>

        <!-- 料片列表模块 -->
        <div class="m-questsection-sidebar__list">
            <div class="m-questsection-season" v-for="season in filteredSeasons" :key="season.nSeasonID">
                <!-- 资料片标题（紫底白字） -->
                <div class="u-questsection-season-header" @click="toggleSeason(season.nSeasonID)">
                    <span class="u-questsection-season-name">{{ season.szTitle }}</span>
                    <img class="u-questsection-season-arrow"
                        :class="{ 'is-expanded': expandedSeasons.includes(season.nSeasonID) }"
                        src="@/assets/img/questsection/arrow-expand.svg" alt="展开" />
                </div>

                <!-- 大章节列表（折叠展开区域） -->
                <transition name="questsection-expand">
                    <div class="m-questsection-season__chapters" v-show="expandedSeasons.includes(season.nSeasonID)">
                        <div class="u-questsection-chapter" v-for="chapter in getFilteredChapters(season)"
                            :key="chapter.nChapterID" :class="{
                                'is-active': selectedChapter?.nChapterID === chapter.nChapterID
                            }" @click="selectChapter(season, chapter)" @mouseenter="handleChapterHover(chapter, true)"
                            @mouseleave="handleChapterHover(chapter, false)">
                            <span class="u-questsection-chapter-name">{{ chapter.szTitle }}</span>
                        </div>
                    </div>
                </transition>
            </div>
        </div>

        <!-- 展开/折叠按钮 -->
        <div class="m-questsection-sidebar__toggle" @click="toggleSidebarExpand">
            <img class="u-questsection-toggle-arrow" :class="{ 'is-expanded': isSidebarExpanded }"
                src="@/assets/img/questsection/arrow-expand.svg" alt="展开" />
        </div>
    </div>
</template>

<script>
import { getMenu } from "@/service/questsection.js";

export default {
    name: "QuestsectionSidebar",
    data() {
        return {
            // 搜索关键词
            searchKeyword: "",
            // 资料片列表数据
            seasons: [],
            // 展开的资料片 ID 列表
            expandedSeasons: [],
            // 当前选中的大章节
            selectedChapter: null,
            // 当前选中的资料片
            selectedSeason: null,
            // hover 状态的章节（用于样式控制）
            hoveredChapter: null,
            // 加载状态
            loading: false,
            // 侧边栏整体展开状态
            isSidebarExpanded: false,
        };
    },
    computed: {
        /**
         * 根据搜索关键词过滤资料片
         * - 如果关键词匹配资料片名称，展示对应资料片
         * - 如果关键词匹配大章节名称，展示对应资料片（展开状态）
         */
        filteredSeasons() {
            const keyword = this.searchKeyword.trim().toLowerCase();
            if (!keyword) {
                return this.seasons;
            }

            return this.seasons.filter((season) => {
                // 检查资料片名称是否匹配
                const seasonNameMatch = season.szTitle.toLowerCase().includes(keyword);

                // 检查是否有大章节名称匹配
                const chapterMatch = season.Chapters?.some((chapter) =>
                    chapter.szTitle.toLowerCase().includes(keyword)
                );

                return seasonNameMatch || chapterMatch;
            });
        },
    },
    methods: {
        /**
         * 获取菜单数据
         */
        async fetchMenuData() {
            this.loading = true;
            try {
                const res = await getMenu({
                    client: "std",

                    // hide_lock: 0,
                });

                if (res.data?.data) {
                    this.seasons = res.data.data || [];
                    // 初始化默认展开和选择
                    this.initDefaultSelection();
                }
            } catch (error) {
                console.error("获取剑侠录菜单失败:", error);
            } finally {
                this.loading = false;
            }
        },

        /**
         * 初始化默认选择
         * - 默认展开"风起稻香"资料片
         * - 默认选择第一个大章节
         */
        initDefaultSelection() {
            if (this.seasons.length === 0) return;

            // 查找"风起稻香"资料片
            const defaultSeason = this.seasons.find(
                (season) => season.szTitle === "风起稻香"
            ) || this.seasons[0];

            if (defaultSeason) {
                // 展开默认资料片
                this.expandedSeasons = [defaultSeason.nSeasonID];
                this.selectedSeason = defaultSeason;

                // 选择第一个大章节
                if (defaultSeason.Chapters?.length > 0) {
                    const firstChapter = defaultSeason.Chapters[0];
                    this.selectedChapter = firstChapter;
                    // 触发选择事件
                    this.emitSelect(defaultSeason, firstChapter);
                }
            }
        },

        /**
         * 切换资料片展开/折叠状态（手风琴效果）
         * - 展开一个菜单时关闭其他已展开的菜单
         * @param {number} seasonId - 资料片 ID
         */
        toggleSeason(seasonId) {
            const index = this.expandedSeasons.indexOf(seasonId);
            if (index > -1) {
                // 已展开则折叠
                this.expandedSeasons.splice(index, 1);
            } else {
                // 未展开则展开，同时关闭其他已展开的菜单
                this.expandedSeasons = [seasonId];
            }
        },

        /**
         * 选择大章节
         * @param {Object} season - 资料片对象
         * @param {Object} chapter - 大章节对象
         */
        selectChapter(season, chapter) {
            this.selectedSeason = season;
            this.selectedChapter = chapter;
            this.emitSelect(season, chapter);
        },

        /**
         * 触发选择事件
         * @param {Object} season - 资料片对象
         * @param {Object} chapter - 大章节对象
         */
        emitSelect(season, chapter) {
            this.$emit("select", {
                season: season,
                chapter: chapter,
            });
        },

        /**
         * 处理搜索输入
         * - 搜索时自动展开匹配的资料片
         */
        handleSearch() {
            const keyword = this.searchKeyword.trim().toLowerCase();
            if (!keyword) return;

            // 搜索时自动展开匹配的资料片
            this.filteredSeasons.forEach((season) => {
                // 如果有章节匹配，则展开该资料片
                const chapterMatch = season.Chapters?.some((chapter) =>
                    chapter.szTitle.toLowerCase().includes(keyword)
                );
                if (chapterMatch && !this.expandedSeasons.includes(season.nSeasonID)) {
                    this.expandedSeasons.push(season.nSeasonID);
                }
            });
        },

        /**
         * 获取过滤后的大章节列表
         * - 搜索时隐藏不匹配的大章节
         * @param {Object} season - 资料片对象
         * @returns {Array} 过滤后的大章节列表
         */
        getFilteredChapters(season) {
            const keyword = this.searchKeyword.trim().toLowerCase();
            if (!keyword) {
                return season.Chapters || [];
            }

            // 如果资料片名称匹配，显示所有章节
            if (season.szTitle.toLowerCase().includes(keyword)) {
                return season.Chapters || [];
            }

            // 否则只显示匹配的章节
            return (season.Chapters || []).filter((chapter) =>
                chapter.szTitle.toLowerCase().includes(keyword)
            );
        },

        /**
         * 处理大章节 hover 状态
         * @param {Object} chapter - 大章节对象
         * @param {boolean} isEnter - 是否为 mouseenter
         */
        handleChapterHover(chapter, isEnter) {
            this.hoveredChapter = isEnter ? chapter : null;
        },

        /**
         * 切换侧边栏整体展开/折叠状态
         */
        toggleSidebarExpand() {
            this.isSidebarExpanded = !this.isSidebarExpanded;
        },
    },
    mounted() {
        this.fetchMenuData();
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/questsection/sidebar.less";
</style>
