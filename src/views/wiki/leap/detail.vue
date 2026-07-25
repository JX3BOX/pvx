<template>
    <div class="m-leap-detail">
        <header class="m-achievement-section-header m-leap-detail__header">
            <div>
                <nav
                    class="m-achievement-context-nav"
                    :aria-label="$t('pages.wiki.leap.ui.planDetail')"
                >
                    <button type="button" @click="$router.push({ name: 'leap' })">
                        {{ $t("pages.wiki.leap.ui.title") }}
                    </button>
                    <ArrowRight class="u-achievement-context-separator" />
                    <button type="button" class="is-current" aria-current="page">
                        {{ detail.title || $t("pages.wiki.leap.ui.unnamedPlan") }}
                    </button>
                </nav>
                <span class="u-achievement-section-kicker">
                    {{ $t("pages.wiki.leap.ui.planDetail") }}
                </span>
                <div class="m-achievement-list-heading">
                    <h2>{{ detail.title || $t("pages.wiki.leap.ui.unnamedPlan") }}</h2>
                    <p>
                        {{
                            $t("pages.wiki.leap.ui.achievementCount", {
                                count: detail.achievementsBak?.length || detail.achievements?.length || 0,
                            })
                        }}
                    </p>
                </div>
            </div>
        </header>

        <div class="m-leap-detail__body">
            <nav class="m-leap-detail__filters" :aria-label="$t('pages.wiki.leap.ui.categoryFilter')">
                <div class="m-leap-detail__filter-primary">
                    <button
                        type="button"
                        :class="{ active: detailSelectMenu == null }"
                        @click="changeDetailMenu(null, 0)"
                    >
                        <Grid />
                        <span>{{ $t("pages.wiki.leap.ui.all") }}</span>
                    </button>

                    <button
                        v-for="item in visibleFilterGroups"
                        :key="filterItemKey(item)"
                        type="button"
                        class="is-parent"
                        :class="{ active: isFilterGroupActive(item) }"
                        @click="changeDetailMenu(item, 1)"
                    >
                        <Location v-if="detail.meta?.createBy == 'map'" />
                        <FolderOpened v-else />
                        <span>{{ filterItemLabel(item) }}</span>
                    </button>
                </div>

                <div
                    v-if="activeFilterGroup && activeFilterChildren.length"
                    class="m-leap-detail__filter-secondary"
                >
                    <button
                        v-for="child in activeFilterChildren"
                        :key="filterItemKey(child)"
                        type="button"
                        :class="{ active: detailSelectLevel == 2 && detailSelectMenu == filterItemKey(child) }"
                        @click="changeDetailMenu(child, 2)"
                    >
                        <span>{{ filterItemLabel(child) }}</span>
                    </button>
                </div>
            </nav>

            <div class="m-achievement-table m-leap-detail__table">
                <el-table
                    :data="detail.achievements || []"
                    style="width: 100%"
                    stripe
                    row-class-name="u-table-row"
                    cell-class-name="u-table-cell"
                    header-row-class-name="u-table-header-row"
                    header-cell-class-name="u-table-header-cell"
                    v-loading="loading"
                >
                    <el-table-column
                        prop="Name"
                        :label="$t('pages.wiki.leap.ui.achievementName')"
                        min-width="240"
                    >
                        <template #default="scope">
                            <a
                                :href="getLink('achievement', scope.row.ID)"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span class="u-achievement-name">
                                    <span class="u-achievement-icon-frame">
                                        <img
                                            class="u-icon"
                                            :src="iconLink(scope.row.IconID)"
                                            alt=""
                                        />
                                    </span>
                                    <span class="u-achievement-name-text">{{ scope.row.Name }}</span>
                                </span>
                            </a>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('pages.wiki.leap.ui.points')"
                        width="104"
                        align="center"
                        header-align="center"
                        class-name="u-table-points"
                    >
                        <template #default="scope">{{ scope.row.Point || 0 }}</template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('pages.wiki.leap.ui.status')"
                        width="112"
                        align="center"
                        header-align="center"
                    >
                        <template #default="scope">
                            <el-tag
                                class="u-achievement-status"
                                :class="{
                                    'is-complete': scope.row.isCompleted,
                                    'is-incomplete': !scope.row.isCompleted,
                                }"
                                effect="plain"
                            >
                                <CircleCheckFilled v-if="scope.row.isCompleted" aria-hidden="true" />
                                {{
                                    scope.row.isCompleted
                                        ? $t("pages.wiki.leap.ui.completed")
                                        : $t("pages.wiki.leap.ui.incomplete")
                                }}
                            </el-tag>
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('pages.wiki.leap.ui.difficulty')"
                        width="144"
                        align="center"
                        header-align="center"
                        class-name="u-leap-difficulty"
                    >
                        <template #default="scope">
                            <el-rate
                                :model-value="scope.row.difficulty || 0"
                                disabled
                                allow-half
                                disabled-void-color="#d8cfc2"
                            />
                        </template>
                    </el-table-column>
                    <el-table-column
                        :label="$t('pages.wiki.leap.ui.reward')"
                        width="88"
                        align="center"
                        header-align="center"
                        class-name="u-table-reward"
                    >
                        <template #default="scope">
                            <el-tooltip placement="top" v-if="scope.row.item">
                                <template #content><jx3-item :item="scope.row.item" /></template>
                                <span class="u-reward-trigger">
                                    <img
                                        class="u-reward-icon"
                                        :src="iconLink(scope.row.item.IconID)"
                                        :alt="$t('pages.wiki.leap.ui.reward')"
                                    />
                                </span>
                            </el-tooltip>
                            <span v-else class="u-table-empty">
                                {{ $t("pages.wiki.leap.ui.emptyValue") }}
                            </span>
                        </template>
                    </el-table-column>
                </el-table>

                <PvxEmptyState
                    v-if="!loading && !detail.achievements?.length"
                    class="m-leap-detail__empty"
                    :title="$t('pages.wiki.leap.ui.noAchievements')"
                    :description="$t('pages.wiki.leap.ui.noAchievementsDescription')"
                >
                    <template #icon><Document /></template>
                </PvxEmptyState>
            </div>
        </div>
    </div>
</template>

<script>
import { getMenus, getAchievementsPost, getMapList } from "@/service/achievement";
import { getWikiAchievementLeapSchema, getWikiAchievementLeapSchemaProgress } from "@/service/wiki";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import Item from "@jx3box/jx3box-editor/src/Item";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { cloneDeep, sortBy } from "lodash";
import {
    ArrowRight,
    CircleCheckFilled,
    Document,
    FolderOpened,
    Grid,
    Location,
} from "@element-plus/icons-vue";

const filterKey = (item) => item?.value ?? item?.id;

export default {
    components: {
        ArrowRight,
        CircleCheckFilled,
        Document,
        FolderOpened,
        Grid,
        "jx3-item": Item,
        Location,
        PvxEmptyState,
    },
    props: {
        currentRole: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            menuList: [],
            mapList: [],
            detail: {},
            detailSelectMenu: null,
            detailSelectLevel: 0,
            loading: false,
            loadedSchemaId: null,
        };
    },
    computed: {
        visibleFilterGroups() {
            const source = this.detail.meta?.createBy === "map" ? this.mapList : this.menuList;
            return source.filter((item) => item.show);
        },
        activeFilterGroup() {
            if (this.detailSelectMenu == null) return null;
            if (this.detailSelectLevel === 1) {
                return (
                    this.visibleFilterGroups.find((item) => filterKey(item) == this.detailSelectMenu) || null
                );
            }
            return (
                this.visibleFilterGroups.find((item) =>
                    this.visibleChildren(item.children).some(
                        (child) => filterKey(child) == this.detailSelectMenu
                    )
                ) || null
            );
        },
        activeFilterChildren() {
            return this.activeFilterGroup ? this.visibleChildren(this.activeFilterGroup.children) : [];
        },
    },
    watch: {
        currentRole: {
            deep: true,
            immediate: true,
            handler() {
                this.getSchemaDetail();
            },
        },
        "$route.query.id"() {
            this.detail = {};
            this.detailSelectMenu = null;
            this.detailSelectLevel = 0;
            this.loadedSchemaId = null;
            this.getSchemaDetail();
        },
    },
    methods: {
        iconLink,
        getLink,
        filterItemKey(item) {
            return filterKey(item);
        },
        filterItemLabel(item) {
            return item?.label || item?.name || "";
        },
        isFilterGroupActive(item) {
            return this.activeFilterGroup && filterKey(this.activeFilterGroup) == filterKey(item);
        },
        visibleChildren(children = []) {
            return children.filter((item) => item.show);
        },
        normalizeMenuList(rawMenus) {
            const menus = Array.isArray(rawMenus) ? rawMenus : Object.values(rawMenus || {});
            return menus.map((menu) => ({
                ...menu,
                children: Array.isArray(menu?.children) ? menu.children : Object.values(menu?.children || {}),
            }));
        },
        applyRoleCompletion(achievements = []) {
            const completedIds = new Set(
                String(this.currentRole?.achievements || "")
                    .split(",")
                    .filter(Boolean)
            );
            return achievements.map((item) => ({
                ...item,
                isCompleted: completedIds.has(String(item.ID)),
            }));
        },
        async getSchemaDetail() {
            const schemaId = this.$route.query.id;
            if (!schemaId) return;

            if (this.loadedSchemaId === schemaId && this.detail?.achievementsBak?.length) {
                const achievements = this.applyRoleCompletion(this.detail.achievementsBak);
                this.detail.achievementsBak = cloneDeep(achievements);
                this.detail.achievements = this.filterCurrentSelection(achievements);
                return;
            }

            this.loading = true;
            try {
                const res = await getWikiAchievementLeapSchema(schemaId);
                this.detail = res.data?.data || {};
                this.loadedSchemaId = schemaId;
                if (this.detail.schema?.length) {
                    if (this.detail.meta?.createBy === "map") {
                        await this.loadMapList(this.detail.schema);
                    } else {
                        await this.getMenuList(this.detail.schema);
                    }
                }
            } finally {
                this.loading = false;
            }
        },
        async loadMapList(schema) {
            const res = await getMapList({
                client: this.$store.state.client,
                _no_page: 1,
            });
            const data = res.data?.data || [];
            this.mapList = Object.values(
                data.reduce((acc, cur) => {
                    if (!cur.RegionName) return acc;
                    if (!acc[cur.RegionName]) {
                        acc[cur.RegionName] = {
                            value: Number(cur.Region),
                            label: cur.RegionName,
                            children: [],
                        };
                    }
                    acc[cur.RegionName].children.push({
                        value: Number(cur.ID),
                        label: cur.MapName,
                        parent: Number(cur.Region),
                    });
                    return acc;
                }, {})
            );
            await this.getAchievements(schema);
        },
        async getMenuList(schema) {
            const res = await getMenus({
                general: 1,
                client: this.$store.state.client,
            });
            this.menuList = this.normalizeMenuList(res.data?.data?.menus);
            await this.getAchievements(schema);
        },
        async getAchievements(ids) {
            let attributes = "Name,Sub,Detail,IconID,Point,ID";
            if (this.detail.meta?.createBy === "map") {
                attributes = "Name,IconID,Point,SceneID,ID";
            }
            const res = await getAchievementsPost({
                ids: ids.toString(),
                attributes,
            });
            const achievements = this.applyRoleCompletion(res.data?.data || []);
            this.configureVisibleFilters(achievements);
            await this.getAchievementProgress(ids, achievements);
        },
        configureVisibleFilters(achievements) {
            if (this.detail.meta?.createBy === "map") {
                this.mapList = this.mapList.map((region) => {
                    const children = region.children.map((map) => ({
                        ...map,
                        show: achievements.some((item) => item.SceneID == map.value),
                    }));
                    return {
                        ...region,
                        children,
                        show: children.some((item) => item.show),
                    };
                });
                return;
            }

            this.menuList = this.menuList.map((menu) => {
                const children = (menu.children || []).map((child) => ({
                    ...child,
                    show: achievements.some((item) => item.Detail == child.detail),
                }));
                return {
                    ...menu,
                    children,
                    show: achievements.some((item) => item.Sub == menu.sub),
                };
            });
        },
        async getAchievementProgress(ids, achievements) {
            const res = await getWikiAchievementLeapSchemaProgress(ids);
            const progressList = res.data?.data || [];
            const progressMap = new Map(progressList.map((item) => [String(item.achievement_id), item]));
            const merged = achievements.map((achievement) => {
                const progress = progressMap.get(String(achievement.ID)) || {};
                return {
                    ...achievement,
                    ...progress,
                    difficulty: progress.difficulty ? progress.difficulty / 10 : 0,
                };
            });
            this.detail.achievements = sortBy(merged, "difficulty");
            this.detail.achievementsBak = cloneDeep(this.detail.achievements);
        },
        filterCurrentSelection(achievements) {
            if (this.detailSelectMenu == null) return cloneDeep(achievements);
            const isMap = this.detail.meta?.createBy === "map";
            if (isMap) {
                if (this.detailSelectLevel === 1) {
                    const region = this.mapList.find((item) => item.value == this.detailSelectMenu);
                    const sceneIds = new Set((region?.children || []).map((item) => String(item.value)));
                    return achievements.filter((item) => sceneIds.has(String(item.SceneID)));
                }
                return achievements.filter((item) => item.SceneID == this.detailSelectMenu);
            }

            const parent = this.menuList.find((item) => item.id == this.detailSelectMenu);
            if (parent) return achievements.filter((item) => item.Sub == parent.sub);

            const child = this.menuList
                .flatMap((item) => item.children || [])
                .find((item) => item.id == this.detailSelectMenu);
            return child ? achievements.filter((item) => item.Detail == child.detail) : cloneDeep(achievements);
        },
        changeDetailMenu(item, type) {
            if (type === 0) {
                this.detailSelectMenu = null;
                this.detailSelectLevel = 0;
                this.detail.achievements = cloneDeep(this.detail.achievementsBak || []);
                return;
            }

            this.detailSelectLevel = type;
            this.detailSelectMenu = filterKey(item);
            this.detail.achievements = this.filterCurrentSelection(this.detail.achievementsBak || []);
        },
    },
};
</script>

<style lang="less">
.m-leap-detail {
    color: #4b3b29;

    .m-leap-detail__header {
        margin-bottom: 12px;
    }

    .m-leap-detail__body {
        min-width: 0;
    }

    .m-leap-detail__filters {
        display: block;
        max-width: 100%;
        margin-bottom: 14px;
        border: 1px solid rgba(151, 123, 83, 0.2);
        border-radius: 14px;
        background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.38), transparent 110px),
            rgba(238, 231, 218, 0.68);
        box-shadow: 0 8px 22px rgba(66, 49, 28, 0.055);
        overflow: hidden;

        .m-leap-detail__filter-primary,
        .m-leap-detail__filter-secondary {
            display: flex;
            min-width: 0;
            align-items: center;
            gap: 6px;
            padding: 8px 10px;
            overflow-x: auto;
            overflow-y: hidden;
            overscroll-behavior-inline: contain;
            scroll-padding-inline: 8px;
            scroll-snap-type: x proximity;
            scrollbar-width: none;

            &::-webkit-scrollbar {
                display: none;
            }
        }

        .m-leap-detail__filter-primary {
            min-height: 52px;
        }

        .m-leap-detail__filter-secondary {
            min-height: 46px;
            padding-top: 5px;
            padding-bottom: 7px;
            border-top: 1px solid rgba(151, 123, 83, 0.14);
            background: rgba(255, 255, 255, 0.3);
        }

        button {
            display: inline-flex;
            min-height: 36px;
            flex: none;
            align-items: center;
            gap: 7px;
            padding: 7px 10px;
            border: 1px solid transparent;
            border-radius: 9px;
            color: #625441;
            background: transparent;
            font: inherit;
            font-size: 13px;
            font-weight: 700;
            text-align: left;
            white-space: nowrap;
            cursor: pointer;
            scroll-snap-align: start;
            transition:
                border-color 150ms cubic-bezier(0.2, 0, 0, 1),
                color 150ms cubic-bezier(0.2, 0, 0, 1),
                background-color 150ms cubic-bezier(0.2, 0, 0, 1),
                box-shadow 150ms cubic-bezier(0.2, 0, 0, 1);

            svg {
                width: 14px;
                height: 14px;
                flex: none;
                color: currentColor;
            }

            span {
                white-space: nowrap;
            }

            &:hover {
                color: #5f4526;
                background: rgba(154, 116, 66, 0.075);
            }

            &.active {
                border-color: transparent;
                color: #fff7e8;
                background: linear-gradient(135deg, #8f693a, #6b4a27);
                box-shadow: 0 7px 16px rgba(75, 51, 24, 0.2);
            }
        }

        .m-leap-detail__filter-secondary button {
            min-height: 32px;
            gap: 7px;
            padding: 6px 8px;
            color: #88765f;
            font-size: 12px;
            font-weight: 400;

            &::before {
                width: 3px;
                height: 3px;
                flex: none;
                border-radius: 50%;
                content: "";
                background: rgba(154, 116, 66, 0.42);
            }

            &.active {
                border-color: transparent;
                color: #775328;
                background: linear-gradient(90deg, rgba(206, 174, 111, 0.24), rgba(255, 255, 255, 0.24));
                box-shadow: none;
                font-weight: 650;

                &::before {
                    background: #9a7442;
                    box-shadow: 0 0 0 3px rgba(154, 116, 66, 0.12);
                }
            }
        }
    }

    .m-leap-detail__table {
        min-width: 0;
    }

    .u-leap-difficulty {
        .cell {
            display: flex;
            justify-content: center;
        }

        .el-rate {
            height: 20px;
            white-space: nowrap;
        }
    }

    .m-leap-detail__empty {
        min-height: 300px;
        border: 0;
        background: transparent;
    }
}

@media (max-width: 720px) {
    .m-leap-detail {
        .m-leap-detail__table {
            overflow-x: auto;

            .el-table {
                min-width: 760px;
            }
        }
    }
}
</style>
