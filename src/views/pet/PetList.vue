<template>
    <PvxPageShell class="p-pvx-pet-list" v-loading="loading">
        <div class="m-pvx-pet-layout" ref="listRef">
            <petTabs @change="handleTabChange" :types="Type" :active="active" :Source="Source" :mapList="mapList" />
            <PublicNotice bckey="pet_ac" />

            <PvxSurface
                v-if="luckyList.length > 0 && !showAllList"
                class="m-pvx-pet-section m-pvx-pet-lucky-section"
                padding="medium"
            >
                <PvxSectionHeader
                    class="m-pvx-pet-section-header"
                    :title="$t('pages.pet.ui.lucky.title')"
                    level="h2"
                />
                <div class="m-pvx-pet-lucky-list">
                    <luckyItem
                        v-for="item in luckyList"
                        :key="item.Index || item.source_id"
                        :item="item"
                        variant="modern"
                    />
                </div>
            </PvxSurface>

            <template v-if="!showAllList">
                <PvxSurface
                    v-for="item in visibleOverviewSections"
                    :key="item.class"
                    class="m-pvx-pet-section"
                    padding="medium"
                >
                    <PvxSectionHeader
                        class="m-pvx-pet-section-header"
                        :title="$t('pages.pet.ui.sectionTitle', { type: typeLabel(item.class) })"
                        level="h2"
                    >
                        <template #action>
                            <button
                                type="button"
                                class="u-pvx-pet-view-all"
                                @click="setActive(item.class)"
                            >
                                {{ $t("pages.pet.ui.actions.viewAll") }}
                            </button>
                        </template>
                    </PvxSectionHeader>
                    <div class="m-pvx-pet-list" :style="listGridStyle">
                        <pet-item
                            v-for="pet in item.list"
                            :key="pet.Index"
                            :petObject="pet"
                            variant="modern"
                        />
                    </div>
                </PvxSurface>
            </template>

            <PvxSurface v-else-if="list.length" class="m-pvx-pet-section" padding="medium">
                <PvxSectionHeader
                    class="m-pvx-pet-section-header"
                    :title="$t('pages.pet.ui.sectionTitle', { type: typeName })"
                    level="h2"
                >
                    <template #action>
                        <span class="u-pvx-pet-result-count">
                            {{ $t("pages.pet.ui.resultCount", { count: total }) }}
                        </span>
                    </template>
                </PvxSectionHeader>
                <div class="m-pvx-pet-list" :style="listGridStyle">
                    <pet-item
                        v-for="pet in list"
                        :key="pet.Index"
                        :petObject="pet"
                        variant="modern"
                    />
                </div>
                <el-button
                    v-show="hasNextPage"
                    class="m-archive-more"
                    type="primary"
                    @click="appendPage"
                    :loading="loading"
                >
                    <el-icon v-if="!loading" class="el-icon--left"><ArrowDown /></el-icon>
                    {{ $t("pages.pet.ui.actions.loadMore") }}
                </el-button>
                <el-pagination
                    class="m-archive-pages"
                    background
                    layout="total, prev, pager, next, jumper"
                    :pager-count="responsivePagerCount"
                    :hide-on-single-page="true"
                    :page-size="per_page"
                    :total="total"
                    v-model:current-page="page"
                />
            </PvxSurface>

            <PvxSurface v-if="isNoRes()" class="m-pvx-pet-empty-surface" padding="medium">
                <PvxEmptyState
                    illustrated
                    :title="$t('pages.pet.ui.empty.title')"
                    :description="$t('pages.pet.ui.empty.description')"
                />
            </PvxSurface>
        </div>
    </PvxPageShell>
</template>

<script>
import PublicNotice from "@/components/PublicNotice";
import petTabs from "@/components/pet/tabs";
import petItem from "@/components/pet/item";
import luckyItem from "@/components/pet/lucky";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { clone, debounce } from "lodash";
import Type from "@/assets/data/pet_type.json";
import { getPets, getPet, getPetSearchOptions, getPetLucky, getMapList } from "@/service/pet";
import dayjs from "@/plugins/day";
import { ArrowDown } from "@element-plus/icons-vue";
import responsivePagination from "@/mixins/responsive-pagination";

export default {
    name: "PetList",
    mixins: [responsivePagination],
    components: {
        petTabs,
        petItem,
        luckyItem,
        PublicNotice,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowDown,
    },
    data() {
        return {
            tabsData: {},          // 标签筛选数据
            active: "",            // 当前激活的分类ID
            Type,                  // 宠物类型配置
            Source: [],            // 宠物来源配置
            list: [],              // 单分类宠物列表
            page: 1,               // 当前页码
            per_page: 50,          // 每页显示数量
            pages: 1,              // 总页数
            total: 0,              // 总数量
            appendMode: false,     // 是否为追加模式（加载更多）
            loading: false,        // 加载状态
            luckyList: [],         // 福缘宠物列表
            showAllList: false,    // 是否显示单分类全部列表
            mapList: [],           // 地图列表
            count: 0,              // 每行卡片数
            searchReady: false,    // 筛选项是否已加载
            isInitialized: false,
            requestSerial: 0,
            // 分类宠物列表（首页按分类展示）
            list_type: [
                { class: 1, type: 1, list: [] },
                { class: 2, type: 2, list: [] },
                { class: 3, type: 3, list: [] },
                { class: 4, type: 4, list: [] },
            ],
        };
    },
    computed: {
        // 当前客户端类型（正式服/怀旧服）
        client() {
            return this.$store.state.client;
        },
        // API请求参数
        params() {
            const _params = {
                ...this.tabsData,
                page: this.page || 1,
                client: this.client,
            };
            if (this.active) _params.Class = this.active;
            return _params;
        },
        // 是否有下一页
        hasNextPage() {
            return this.page < this.pages;
        },
        visibleOverviewSections() {
            return this.list_type.filter((item) => item.list.length > 0);
        },
        typeName() {
            return this.typeLabel(this.active);
        },
        // 列表grid动态列数样式
        listGridStyle() {
            if (!this.count) return {};
            return { gridTemplateColumns: `repeat(${this.count}, 1fr)` };
        },
    },
    watch: {
        // 监听参数变化，重新加载数据
        params: {
            deep: true,
            handler() {
                if (!this.isInitialized) return;
                this.$nextTick(() => {
                    this.getPetListInit();
                });
            },
        },
    },
    mounted() {
        this.getPetLucky();
        this.getMapList();
        this.showCount(1);
        this.getPetSearchOptions().finally(() => {
            this.$nextTick(() => {
                this.isInitialized = true;
                this.getPetListInit();
            });
        });

        this.handleResize = debounce(() => {
            this.showCount(this.active ? 3 : 1);
        }, 300);
        window.addEventListener("resize", this.handleResize);
    },
    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
    methods: {
        /**
         * 获取宠物筛选项
         * 来源对应宠物 Source 字段；种类仍遵循本地 Class 配置
         */
        getPetSearchOptions() {
            return getPetSearchOptions()
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    const sourceOptions = data
                        .filter((item) => item.Type === 2 && item.TypeName)
                        .map((item) => ({
                            source: item.ID,
                            name: item.TypeName,
                        }));

                    this.Source = [{ source: "", name: this.$t("pages.pet.ui.filters.allSources") }, ...sourceOptions];
                })
                .catch((err) => {
                    console.error("[pet] Failed to load search options", err);
                })
                .finally(() => {
                    this.searchReady = true;
                });
        },

        /**
         * 获取地图列表
         * 用于筛选组件中的地图下拉框
         */
        getMapList() {
            getMapList().then((res) => {
                const data = res.data;
                this.mapList = Object.keys(data).map((key) => ({
                    label: data[key],
                    value: key
                }));
            });
        },

        /**
         * 判断是否无结果
         * @returns {Boolean} 是否无结果
         */
        isNoRes() {
            if (!this.searchReady || this.loading) return false;
            if (this.params.Class) {
                return this.list.length === 0;
            }
            return this.list_type.every(type => type.list.length === 0);
        },

        /**
         * 设置当前激活的分类（用于"查看全部"按钮）
         * @param {Number} val - 分类ID
         */
        setActive(val) {
            this.active = val;
            this.page = 1;
            document.documentElement.scrollTop = 0;
            // 同步更新 tabsData 中的 Class
            this.tabsData = { ...this.tabsData, Class: val };
        },

        typeLabel(type) {
            return this.$t(`pages.pet.ui.types.${type || "all"}`);
        },

        /**
         * 初始化宠物列表
         * 根据是否有分类决定加载方式
         */
        getPetListInit() {
            const requestSerial = ++this.requestSerial;
            this.loading = true;

            if (!this.params.Class) {
                // 无分类时，加载各分类的首页数据（每分类1行）
                this.showCount(1);
                this.showAllList = false;
                const requests = this.list_type.map((e) => {
                    const params = clone(this.params);
                    params.Class = e.class;
                    params.per = this.per_page;
                    return this.getPetList(params, requestSerial);
                });
                Promise.all(requests.map((request) => request.catch(() => null))).finally(() => {
                    if (requestSerial === this.requestSerial) {
                        this.loading = false;
                    }
                });
            } else {
                // 有分类时，加载该分类的全部数据（3行数据量）
                this.showCount(3);
                const params = clone(this.params);
                params.per = this.per_page;
                this.getPetList(params, requestSerial).finally(() => {
                    if (requestSerial === this.requestSerial) {
                        this.loading = false;
                        this.appendMode = false;
                    }
                });
            }
        },

        /**
         * 获取宠物列表
         * @param {Object} params - 请求参数
         */
        getPetList(params, requestSerial) {
            // 非追加模式下清空列表
            if (!this.appendMode && this.params.Class) {
                this.list = [];
            }

            return getPets(params)
                .then((res) => {
                    if (requestSerial !== this.requestSerial) return;
                    this.handlePetListResponse(res, params);
                });
        },

        /**
         * 处理宠物列表响应
         * @param {Object} res - 响应数据
         * @param {Object} params - 请求参数
         */
        handlePetListResponse(res, params) {
            // 过滤有效宠物数据
            const newList = res.data.list.filter((item) => {
                return item.NameFrame || item.Level;
            });

            // 追加模式
            if (this.appendMode) {
                this.list = this.list.concat(newList);
            } else {
                this.updateListData(newList, params);
            }

            // 更新分页信息
            if (this.params.Class) {
                this.total = res.data.total;
                this.pages = res.data.pages;
            }
        },

        /**
         * 更新列表数据
         * @param {Array} newList - 新宠物列表
         * @param {Object} params - 请求参数
         */
        updateListData(newList, params) {
            if (!this.params.Class) {
                // 按类型分别赋值
                const typeIndex = this.list_type.findIndex(t => t.class === params.Class);
                if (typeIndex !== -1) {
                    this.list_type[typeIndex].list = newList || [];
                }
            } else {
                this.showAllList = true;
                this.list = newList || [];
            }
        },

        /**
         * 获取福缘宠物
         * 仅正式服有效
         */
        getPetLucky() {
            if (this.client !== "std") return;

            getPetLucky(this.client).then((res) => {
                const data = res.data;
                const dateIndex = dayjs.tz(new Date()).format("MDD");
                const petIds = data?.[dateIndex] || data?.[this.client]?.[dateIndex] || [];

                Promise.all(
                    petIds.slice(0, 3).map((id) =>
                        getPet(id, { client: this.client })
                            .then((res) => ({
                                ...res.data,
                                source_id: id,
                            }))
                            .catch(() => null)
                    )
                ).then((list) => {
                    this.luckyList = list.filter(Boolean);
                });
            });
        },

        /**
         * 加载更多
         * 切换到追加模式并增加页码
         */
        appendPage() {
            this.appendMode = true;
            this.page = this.page + 1;
        },

        /**
         * 处理标签变化
         * @param {Object} data - 标签数据
         */
        handleTabChange(data) {
            const isEvent = data instanceof Event;
            if (isEvent) return;

            const newClass = data.Class || "";
            if (newClass !== this.active) {
                this.active = newClass;
                document.documentElement.scrollTop = 0;
            }

            this.page = 1;
            this.tabsData = data;
        },

        /**
         * 按宽度计算每行卡片数和每页显示数量
         * 参考horse模块的showCount逻辑
         * @param {Number} num - 行数倍数（首页1行，分类页3行）
         */
        showCount(num = 1) {
            const listWidth = this.$refs.listRef?.clientWidth;
            const width = listWidth || 1030;

            if (width <= 520) {
                this.count = 1;
                this.per_page = num === 1 ? 4 : 12;
                return;
            }

            // 卡片最小宽度180px + 间距20px
            this.count = Math.floor((width + 20) / 200);
            // 确保per_page是count的整数倍，保证每行占满
            this.per_page = Math.max(this.count * num, this.count);
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/pet/pc/list.less";
@import "~@/assets/css/modules/pet-list-theme.less";
</style>
