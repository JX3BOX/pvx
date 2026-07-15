/**
 * pcListMixin - PC端列表页公共逻辑
 *
 * @description 用于脸型/体型模块PC端列表页的公共逻辑抽取
 * @author Face & Body 模块优化团队
 * @version 1.6.0
 *
 * @changelog
 * - v1.6.0: 具体分类复用总览列数并请求两行数据
 *   - 卡片宽度和间距与“全部”总览保持一致
 *   - 具体分类 pageSize 按当前列数的两倍计算
 *   - 容器列数变化时同步刷新总览和具体分类
 * - v1.5.0: 分类总览按容器宽度动态计算请求数量
 *   - “全部”状态根据可用宽度、卡片宽度和实际 gap 计算 pageSize
 *   - 具体分类仍固定每页请求 12 条
 *   - 容器列数变化时防抖刷新，列数不变时不重复请求
 * - v1.4.0: 列表请求数量固定为 12
 *   - 分类总览固定请求 12 条并保持单行横向浏览
 *   - 全部列表固定每页 12 条并使用响应式折行
 *   - 移除因容器宽度变化而改变 pageSize 的逻辑
 * - v1.3.0: 彻底解决重复请求问题
 *   - 使用 isChangingActive 标志位，阻止 tabsData 在 active 变化时触发额外请求
 *   - 使用 pendingParams 缓存最新的请求参数，确保只发送一次请求
 *   - 优化 handleTabChange 逻辑，区分 active 变化和筛选条件变化
 * - v1.2.0: 重构 watch 监听机制
 *   - 移除 active watcher 中的 loadData 调用
 *   - params watcher 统一处理所有数据加载
 */
import { omit, isEqual, debounce } from "lodash";

const PAGE_SIZE = 12;
const DEFAULT_CARD_GAP = 12;
const MIN_OVERVIEW_COUNT = 6;

export default {
    data() {
        return {
            loading: false,
            // 初始查询条件，包含默认值
            tabsData: {
                is_new_face: -1,
            },
            active: -1,
            page: 1,
            per: PAGE_SIZE,
            total: 0,
            count: PAGE_SIZE,
            overviewItemWidth: 0,
            appendMode: false,
            isInitialized: false,
            // 标志位：是否正在切换 active（用于阻止 tabsData 变化触发的额外请求）
            isChangingActive: false,
            // 缓存上一次的请求参数，用于比较
            lastRequestParams: null,
            overviewResizeObserver: null,
        };
    },

    computed: {
        client() {
            return this.$store.state.client;
        },

        activeTab() {
            return this.list.find((e) => e.value === this.active);
        },

        hasNextPage() {
            const tab = this.activeTab;
            if (!tab) return false;
            return tab.pages > 1 && this.page < tab.pages;
        },

        subList() {
            if (!this.active) return null;
            const tab = this.activeTab;
            return tab ? tab.list : [];
        },

        typeName() {
            const tab = this.activeTab;
            return tab ? tab.label : "";
        },

        noList() {
            if (this.active === -1) {
                return this.list.every((obj) => obj.list.length === 0);
            }
            const sub = this.subList;
            return !sub || sub.length === 0;
        },
    },

    methods: {
        /**
         * 设置当前激活的类型
         *
         * 设计思路：
         * 1. 设置 isChangingActive 标志位，阻止后续 tabsData 变化触发请求
         * 2. 更新 per、page、active
         * 3. 直接调用 loadData，避免依赖 params watcher
         * 4. 在下一个 tick 重置标志位
         */
        setActive(val) {
            if (val === this.active) return;

            // 设置标志位，阻止 tabsData 变化触发的额外请求
            this.isChangingActive = true;

            this.active = val;

            // 更新状态
            this.page = 1;

            // 滚动到顶部
            document.documentElement.scrollTop = 0;

            const loadCurrentTab = () => {
                this.showCount();

                // 直接调用 loadData，不依赖 params watcher
                if (this.isInitialized) {
                    this.loadData();
                }
            };

            // 列表 DOM 切换完成后才能取得准确的内容宽度
            this.$nextTick(loadCurrentTab);

            // 在下一个 tick 重置标志位
            this.$nextTick(() => {
                this.isChangingActive = false;
            });
        },

        changePage(i) {
            this.page = i;
            this.loadData();
        },

        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },

        getListLayout() {
            const root = this.$refs.listRef;
            const overview = root?.querySelector(".m-pvx-overview-grid");
            const section = overview?.querySelector(".m-pvx-type__box") || root?.querySelector(".m-pvx-type__box");
            const items = section?.querySelector(
                this.active === -1 ? ".m-cardlist-items" : ".m-pvx-type__list--all"
            );
            const cardWidth = Number(this.itemData?.width);

            if (!section || !cardWidth) {
                return {
                    count: this.count || 1,
                    itemWidth: this.overviewItemWidth || cardWidth || 1,
                };
            }

            const sectionStyle = window.getComputedStyle(section);
            const itemsStyle = items ? window.getComputedStyle(items) : null;
            const horizontalSpace =
                parseFloat(sectionStyle.paddingLeft) +
                parseFloat(sectionStyle.paddingRight) +
                parseFloat(sectionStyle.borderLeftWidth) +
                parseFloat(sectionStyle.borderRightWidth);
            const containerWidth = overview
                ? overview.getBoundingClientRect().width
                : section.getBoundingClientRect().width;
            const availableWidth = containerWidth - horizontalSpace;
            const gap = parseFloat(itemsStyle?.columnGap || itemsStyle?.gap) || DEFAULT_CARD_GAP;
            const fittedCount = Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)));
            const count = Math.max(MIN_OVERVIEW_COUNT, fittedCount);

            return {
                count,
                itemWidth: cardWidth,
            };
        },

        showCount({ reload = false } = {}) {
            const { count: nextCount, itemWidth } = this.getListLayout();
            const hasChanged = nextCount !== this.count;

            this.count = nextCount;
            this.overviewItemWidth = itemWidth;
            this.per = this.active === -1 ? nextCount : nextCount * 2;

            if (reload && hasChanged && this.isInitialized) {
                this.page = 1;
                this.list.forEach((item) => {
                    item.page = 1;
                });
                this.loadData();
            }
        },

        observeOverviewWidth() {
            const root = this.$refs.listRef;
            if (!root) return;

            if (typeof ResizeObserver !== "undefined") {
                this.overviewResizeObserver = new ResizeObserver(this.handleOverviewResize);
                this.overviewResizeObserver.observe(root);
            } else {
                window.addEventListener("resize", this.handleOverviewResize);
            }
        },

        handleLoad(type) {
            const item = this.list.find((e) => e.value === type);
            if (!item) return;

            const params = omit(this.params, ["type"]);
            params.pageSize = this.per;
            params.pageIndex = item.page + 1;
            params.body_type = type;
            this.loadList(params, type);
        },

        /**
         * 加载数据
         *
         * 设计思路：
         * 1. 构建请求参数
         * 2. 与 lastRequestParams 比较，避免重复请求
         * 3. 缓存当前请求参数
         */
        loadData() {
            let params = omit(this.params, ["type"]);

            // 构建完整的请求参数对象
            const requestParams = {
                ...params,
                active: this.active,
                page: this.page,
                per: this.per,
            };

            // 与上次请求参数比较，避免重复请求
            if (isEqual(requestParams, this.lastRequestParams)) {
                return;
            }

            // 缓存当前请求参数
            this.lastRequestParams = { ...requestParams };

            this.loading = true;

            if (this.active === -1) {
                const list = this.list.filter((e) => e.value !== -1);
                list.forEach((e) => {
                    params.pageIndex = e.page;
                    params.body_type = e.value;
                    this.loadList({ ...params }, e.value);
                });
            } else {
                params.pageIndex = this.page;
                this.loadList({ ...params, body_type: this.active }, this.active);
            }
        },

        /**
         * 处理 Tab 切换事件（来自 tabs 组件）
         *
         * 设计思路：
         * 1. 如果正在切换 active（isChangingActive 为 true），只更新 tabsData，不触发 loadData
         * 2. 如果是 body_type 变化，调用 setActive
         * 3. 如果是筛选条件变化，更新 tabsData 并触发 loadData
         */
        handleTabChange(data) {
            // 如果正在切换 active，只更新 tabsData，不触发额外请求
            // 因为 setActive 已经处理了数据加载
            if (this.isChangingActive) {
                this.tabsData = { ...data };
                return;
            }

            const isBodyTypeChange = data.body_type !== undefined && data.body_type !== this.active;

            this.page = 1;
            this.tabsData = { ...data };

            if (isBodyTypeChange) {
                // 使用 setActive 统一处理 body_type 变化
                this.setActive(data.body_type);
            } else {
                // 筛选条件变化，直接触发 loadData
                if (this.isInitialized) {
                    this.loadData();
                }
            }
        },
    },

    created() {
        this.handleOverviewResize = debounce(() => {
            this.$nextTick(() => this.showCount({ reload: true }));
        }, 150);
    },

    mounted() {
        this.$nextTick(() => {
            this.showCount();
            this.isInitialized = true;
            this.loadData();
            this.observeOverviewWidth();
        });
    },

    beforeUnmount() {
        this.overviewResizeObserver?.disconnect();
        window.removeEventListener("resize", this.handleOverviewResize);
        this.handleOverviewResize?.cancel();
    },
};
