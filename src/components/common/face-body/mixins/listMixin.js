/**
 * listMixin - 列表页公共业务逻辑混入
 * 
 * @description 提供列表页的通用数据和方法，用于复用列表相关逻辑
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @data
 * - loading: Boolean - 加载状态
 * - list: Array - 列表数据
 * - recommendList: Array - 推荐列表数据
 * - currentPage: Number - 当前页码
 * - pageSize: Number - 每页数量
 * - total: Number - 总数量
 * 
 * @methods
 * - fetchList(params): 获取列表数据
 * - fetchRecommendList(): 获取推荐列表数据
 * - handlePageChange(page): 处理分页变化
 * - handleItemClick(item): 处理列表项点击
 * - handleViewAll(): 处理查看全部
 * 
 * @requires
 * - 组件需要提供 this.api.list 和 this.api.recommend 接口地址
 * - 组件需要提供 this.type 类型标识（'face' | 'body'）
 * 
 * @example
 * import listMixin from '@/components/common/face-body/mixins/listMixin';
 * 
 * export default {
 *     mixins: [listMixin],
 *     data() {
 *         return {
 *             type: 'face',
 *             api: {
 *                 list: '/api/face/list',
 *                 recommend: '/api/face/recommend'
 *             }
 *         }
 *     }
 * }
 */

export default {
    data() {
        return {
            loading: false,
            list: [],
            recommendList: [],
            currentPage: 1,
            pageSize: 20,
            total: 0
        };
    },
    methods: {
        async fetchList(params = {}) {
            this.loading = true;
            try {
                const res = await this.$http.get(this.api.list, {
                    params: {
                        page: this.currentPage,
                        size: this.pageSize,
                        ...params
                    }
                });
                this.list = res.data.data?.list || res.data.list || [];
                this.total = res.data.data?.total || res.data.total || 0;
            } catch (error) {
                console.error('获取列表失败:', error);
                this.$message?.error('获取列表失败');
            } finally {
                this.loading = false;
            }
        },

        async fetchRecommendList() {
            try {
                const res = await this.$http.get(this.api.recommend);
                this.recommendList = res.data.data || res.data || [];
            } catch (error) {
                console.error('获取推荐列表失败:', error);
            }
        },

        handlePageChange(page) {
            this.currentPage = page;
            this.fetchList();
        },

        handleItemClick(item) {
            this.$router.push({
                name: `${this.type}-single`,
                params: { id: item.id }
            });
        },

        handleViewAll() {
            this.$router.push({
                name: `${this.type}-list`
            });
        }
    }
};
