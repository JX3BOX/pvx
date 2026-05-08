/**
 * pcListMixin - PC端列表页公共逻辑
 *
 * @description 用于脸型/体型模块PC端列表页的公共逻辑抽取
 * @author Face & Body 模块优化团队
 * @version 1.3.0
 *
 * @changelog
 * - v1.3.0: 彻底解决重复请求问题
 *   - 使用 isChangingActive 标志位，阻止 tabsData 在 active 变化时触发额外请求
 *   - 使用 pendingParams 缓存最新的请求参数，确保只发送一次请求
 *   - 优化 handleTabChange 逻辑，区分 active 变化和筛选条件变化
 * - v1.2.0: 重构 watch 监听机制
 *   - 移除 active watcher 中的 loadData 调用
 *   - params watcher 统一处理所有数据加载
 */
import { isPhone } from "@/utils/index";
import { omit, isEqual } from "lodash";

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
            per: 14,
            total: 0,
            count: 0,
            appendMode: false,
            isInitialized: false,
            // 标志位：是否正在切换 active（用于阻止 tabsData 变化触发的额外请求）
            isChangingActive: false,
            // 缓存上一次的请求参数，用于比较
            lastRequestParams: null,
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

            // 先更新active，然后重新计算count
            const oldActive = this.active;
            this.active = val;

            // 重新计算count（因为全部选项和非全部选项使用不同的计算逻辑）
            this.showCount();

            // 更新状态
            this.page = 1;

            // 滚动到顶部
            document.documentElement.scrollTop = 0;

            // 直接调用 loadData，不依赖 params watcher
            if (this.isInitialized) {
                this.loadData();
            }

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

        showCount() {
            if (isPhone()) {
                this.per = 8;
                return;
            }

            // 获取容器宽度（减去左右边距）
            const listWidth = this.$refs.listRef?.clientWidth - 120;

            // 根据是否是全部选项，使用不同的计算参数
            if (this.active === -1) {
                // 全部选项：使用最原始的计算逻辑
                // CardBannerList组件，gap: 10px
                const cardMinWidth = Number(this.itemData.width); // 190px
                const gridGap = 10; // 卡片之间的间距

                this.count = Math.floor(listWidth / (cardMinWidth + gridGap));
                this.per = this.count;
            } else {
                // 非全部选项：使用 .m-pvx-type-list--all 容器
                // gap: 12px，卡片有 max-width: 220px 限制
                // CSS Grid使用minmax(190px, 1fr)，但卡片实际最大宽度为220px
                // 使用220px计算列数，确保与CSS Grid实际渲染一致
                const cardMaxWidth = 220; // 卡片最大宽度
                const gridGap = 12; // 卡片之间的间距

                this.count = Math.floor((listWidth + gridGap) / (cardMaxWidth + gridGap));
                this.per = this.count * 4; // 4行
            }
        },

        handleResize() {
            this.showCount();
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

    mounted() {
        this.showCount();
        this.$nextTick(() => {
            this.isInitialized = true;
            this.loadData();
        });
        window.addEventListener("resize", this.handleResize);
    },

    beforeUnmount() {
        window.removeEventListener("resize", this.handleResize);
    },
};
