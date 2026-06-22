<!--
 * Partner Index - 侠客行模块主入口
 *
 * @description 三栏布局：左侧选择（Selector） + 中间立绘（Portrait） + 右侧信息 / 传记（Info / Bio）
 * 对齐 jxl/Index.vue 的整体结构
 *
 * @components
 * - CommonHeader: 公共头部（全局注册）
 * - Nav: 导航栏
 * - Main: 主内容容器（全局注册）
 * - Selector: 左侧侠客选择
 * - Portrait: 中间侠客立绘
 * - Info: 右侧信息 TAB
 * - Bio: 右侧传记 TAB
 * - CommonFooter: 公共页脚（全局注册）
 *
 * @data-flow
 * - Selector 选择侠客 → Index 触发 handleSelect
 * - Index 调用 getPartnerDetail 加载详情 → 更新 selectedPartner
 * - Index 通过 activeTab 控制右侧显示 Info / Bio
 -->
<template>
    <div id="app" class="p-pvx-partner">
        <CommonHeader></CommonHeader>
        <Nav @statusChange="statusChange" class="p-nav"></Nav>
        <Main :class="navStatusClass" :withoutRight="true" :withoutLeft="true" :withoutBread="true">
            <div class="m-main">
                <!-- 三栏布局 -->
                <div class="m-partner-layout">
                    <!-- 左侧选择 -->
                    <Selector :partner-list="partnerList" :selected-id="selectedPartnerId" :expanded="listExpanded"
                        @select="handleSelect" @search="handleSearch" @toggleExpand="handleToggleExpand"
                        @filterChange="handleFilterChange" />

                    <!-- 中间立绘 -->
                    <Portrait :partner="selectedPartner" />

                    <!-- 右侧面板（Figma: Frame 304 = 顶部工具栏 + 内容面板） -->
                    <div class="m-pvx-partner-right">
                        <!-- 顶部工具栏（Figma: Frame 287, 前进/后退 + 标题） -->
                        <div class="m-partner-right__topbar">
                            <div class="u-partner-topbar-nav">
                                <PvxRobotTip reply="侠客行" typeName="侠客行" hidden />
                                <a href="https://jq.qq.com/?_wv=1027&k=5RgGcYT" target="_blank" rel="noopener"
                                    class="u-partner-btn">
                                    <i class="el-icon-warning-outline"></i>
                                    <span>错误反馈</span>
                                </a>
                            </div>
                        </div>

                        <!-- 内容面板（Figma: Frame 290, 名字+ID+TAB+内容） -->
                        <div class="m-pvx-partner-info">
                            <!-- 头部：名字+ID + TAB（Figma: Frame 307, 水平 SPACE_BETWEEN） -->
                            <PartnerTabs :active="activeTab" :tabs="infoTabs" :name="selectedPartner?.name || '—'"
                                :id="selectedPartner?.id || null" @change="handleTabChange" />

                            <!-- 内容区域 -->
                            <div class="m-partner-info__body">
                                <!-- 基础信息 TAB（含结识方式+武学招式+武学境界+属性） -->
                                <Info v-if="activeTab === 'info'" :partner="selectedPartner" />
                                <!-- 传记 TAB -->
                                <Bio v-else :partner="selectedPartner" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Main>
        <CommonFooter></CommonFooter>
    </div>
</template>

<script>
import Nav from "@/components/Nav_v5.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import Selector from "./Selector.vue";
import Portrait from "./Portrait.vue";
import Info from "./Info.vue";
import Bio from "./Bio.vue";
import PartnerTabs from "./InfoTabs.vue";
import { getPartnerList, getPartnerDetail, getPartnerSkillDetail, PARTNER_SKILL_FIELDS } from "@/service/partner";
import { mapPartnerListItem, mapPartnerDetail, resolveSkillIcon } from "@/utils/partner";
import { INFO_TABS } from "./const";

export default {
    name: "PartnerIndex",
    components: {
        Nav,
        PvxRobotTip,
        Selector,
        Portrait,
        Info,
        Bio,
        PartnerTabs,
    },
    data() {
        return {
            // 导航栏状态类名
            navStatusClass: "is-regular",
            // 侠客列表
            partnerList: [],
            // 当前选中侠客的详情
            selectedPartner: null,
            // 当前选中侠客的 ID
            selectedPartnerId: null,
            // 当前激活的 TAB
            activeTab: "info",
            // TAB 列表
            infoTabs: INFO_TABS,
            // 左侧列表展开状态
            listExpanded: false,
            // 加载状态
            loading: false,
        };
    },
    watch: {
        // 监听路由参数 id（独立多页入口支持 /:id(\d+) 直接进入详情）
        "$route.params.id": {
            immediate: true,
            handler(id) {
                if (id) {
                    this.selectedPartnerId = Number(id);
                    this.fetchPartnerDetail(Number(id));
                }
            },
        },
    },
    mounted() {
        this.fetchPartnerList();
    },
    methods: {
        statusChange(navStatusClass) {
            this.navStatusClass = navStatusClass;
        },
        /**
         * 拉取侠客列表
         * 接口返回原始字段（dwID, szName 等），通过 mapPartnerListItem 转换
         * 第一个元素 szName 为空时显示"全部"
         */
        async fetchPartnerList() {
            this.loading = true;
            try {
                const res = await getPartnerList({ client: "std" });
                const rawData = res?.data?.data || [];
                // 映射接口字段为组件友好格式，传入 index 参数处理"全部"
                this.partnerList = Array.isArray(rawData)
                    ? rawData.map((item, index) => mapPartnerListItem(item, index)).filter(Boolean)
                    : [];
                // 过滤掉 "全部" 占位项，默认选中第一个真实侠客
                this.partnerList = this.partnerList.filter((p) => !p.isAll);
                if (this.partnerList.length > 0 && !this.selectedPartnerId) {
                    this.handleSelect(this.partnerList[0]);
                }
            } catch (err) {
                console.error("[partner] 拉取列表失败:", err);
                this.partnerList = [];
            } finally {
                this.loading = false;
            }
        },
        /**
         * 拉取侠客详情
         * 详情接口返回完整数据（含 skills/stages/stories/voices），通过 mapPartnerDetail 转换
         * params 中需要传入 id（对应 dwID）
         */
        async fetchPartnerDetail(id) {
            if (!id) return;
            this.loading = true;
            try {
                const res = await getPartnerDetail(id, { client: "std", id: id });
                const rawDetail = res?.data?.data || null;
                // 映射详情字段
                const partner = mapPartnerDetail(rawDetail);
                if (!partner) {
                    this.selectedPartner = null;
                    return;
                }

                // 收集技能 ID，通过 getPartnerSkillDetail 获取技能详情（名称/图标/描述）
                const skillIds = [];
                if (rawDetail.Skills) {
                    rawDetail.Skills.forEach((s) => {
                        if (s.skillID) skillIds.push(s.skillID);
                    });
                }
                if (rawDetail.Stages) {
                    rawDetail.Stages.forEach((s) => {
                        if (s.skillID) skillIds.push(s.skillID);
                    });
                }

                if (skillIds.length > 0) {
                    // 去重
                    const uniqueIds = [...new Set(skillIds)];
                    try {
                        const skillRes = await getPartnerSkillDetail(uniqueIds);
                        // 兼容两种响应格式:
                        //   1. { data: { "id": {...} } }  — 对象以 ID 为 key
                        //   2. [ {SkillID,IconID,Name,Desc,Type}, ... ] — 数组通过 SkillID 字段匹配
                        let skillData = skillRes?.data;
                        if (skillData?.data) skillData = skillData.data;
                        const skillMap = {};
                        if (Array.isArray(skillData)) {
                            // 数组格式：通过 SkillID 字段匹配（接口返回顺序不保证）
                            skillData.forEach((item) => {
                                const skillId = item.SkillID;
                                if (skillId && uniqueIds.includes(skillId)) {
                                    skillMap[skillId] = item;
                                }
                            });
                        } else if (skillData && typeof skillData === "object") {
                            Object.assign(skillMap, skillData);
                        }
                        // 合并技能详情到 partner.skills（武学招式）
                        if (partner.skills && skillMap) {
                            partner.skills = partner.skills.map((s) => {
                                const detail = skillMap[s.id];
                                if (detail) {
                                    return {
                                        ...s,
                                        name: detail.Name || s.name,
                                        desc: detail.Desc || s.desc,
                                        icon: resolveSkillIcon(detail.IconID),
                                        iconId: detail.IconID,
                                        level: detail.Level ?? s.level,
                                        type: detail.Type ?? s.type,
                                        typeLabel: detail.Type === 1 ? "被动" : detail.Type === 2 ? "主动" : s.typeLabel,
                                    };
                                }
                                return s;
                            });
                        }
                        // 合并境界技能详情到 partner.stages（武学境界）
                        if (partner.stages && skillMap) {
                            partner.stages = partner.stages.map((s) => {
                                const detail = skillMap[s.skillId];
                                if (detail) {
                                    return {
                                        ...s,
                                        skillName: detail.Name || s.skillName,
                                        skillDesc: detail.Desc || s.skillDesc,
                                        name: detail.Name || s.name,
                                        desc: detail.Desc || s.desc,
                                        icon: resolveSkillIcon(detail.IconID),
                                        iconId: detail.IconID,
                                        level: detail.Level ?? s.level,
                                    };
                                }
                                return s;
                            });
                        }
                    } catch (skillErr) {
                        console.error("[partner] 拉取技能详情失败:", skillErr);
                    }
                }

                this.selectedPartner = partner;
            } catch (err) {
                console.error("[partner] 拉取详情失败:", err);
                this.selectedPartner = null;
            } finally {
                this.loading = false;
            }
        },
        /**
         * 处理 Selector 选择
         */
        handleSelect(partner) {
            if (!partner) return;
            this.selectedPartnerId = partner.id;
            // 切换侠客时重置为基础信息 TAB
            this.activeTab = "info";
            this.fetchPartnerDetail(partner.id);
        },
        /**
         * 处理搜索（防抖由 Selector 内置）
         */
        handleSearch(keyword) {
            // 重新拉取列表（按 keyword）
            this.fetchPartnerListWithKeyword(keyword);
        },
        async fetchPartnerListWithKeyword(keyword) {
            try {
                const params = { client: "std" };
                if (keyword) params.keyword = keyword;
                const res = await getPartnerList(params);
                const rawData = res?.data?.data || [];
                this.partnerList = Array.isArray(rawData)
                    ? rawData.map((item, index) => mapPartnerListItem(item, index)).filter(Boolean)
                    : [];
                this.partnerList = this.partnerList.filter((p) => !p.isAll);
            } catch (err) {
                console.error("[partner] 搜索失败:", err);
            }
        },
        /**
         * 处理展开 / 收起
         */
        handleToggleExpand(expanded) {
            this.listExpanded = expanded;
        },
        /**
         * 处理筛选标签切换
         */
        handleFilterChange(filterKey) {
            // 当前仅"全部"筛选，后续可扩展其他筛选逻辑
            console.log("[partner] 筛选标签切换:", filterKey);
        },
        /**
         * 处理 TAB 切换
         */
        handleTabChange(key) {
            this.activeTab = key;
        },
    },
};
</script>

<style lang="less">
    @import "~@/assets/css/app.less";
    @import "~@/assets/css/miniprogram.less";
    @import "~@/assets/css/partner/index.less";
</style>
