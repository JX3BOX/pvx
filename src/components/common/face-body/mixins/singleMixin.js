/**
 * singleMixin - 详情页公共业务逻辑混入
 * 
 * @description 提供详情页的通用数据和方法，用于复用详情相关逻辑
 * @author Face & Body 模块优化团队
 * @version 1.0.0
 * 
 * @data
 * - loading: Boolean - 加载状态
 * - detail: Object - 详情数据
 * - author: Object - 作者信息
 * - randomList: Array - 随机推荐列表
 * 
 * @methods
 * - fetchDetail(id): 获取详情数据
 * - fetchRandomList(): 获取随机推荐列表
 * - handleDownload(data): 处理下载操作
 * - handleBuy(data): 处理购买操作
 * - handleBack(): 返回上一页
 * - handlePublish(): 跳转到发布页
 * 
 * @requires
 * - 组件需要提供 this.api.detail、this.api.random、this.api.download、this.api.buy 接口地址
 * - 组件需要提供 this.type 类型标识（'face' | 'body'）
 * 
 * @example
 * import singleMixin from '@/components/common/face-body/mixins/singleMixin';
 * 
 * export default {
 *     mixins: [singleMixin],
 *     data() {
 *         return {
 *             type: 'face',
 *             api: {
 *                 detail: '/api/face/detail',
 *                 random: '/api/face/random',
 *                 download: '/api/face/download',
 *                 buy: '/api/face/buy'
 *             }
 *         }
 *     },
 *     mounted() {
 *         this.fetchDetail(this.$route.params.id);
 *         this.fetchRandomList();
 *     }
 * }
 */

export default {
    data() {
        return {
            loading: false,
            detail: null,
            author: null,
            randomList: []
        };
    },
    methods: {
        async fetchDetail(id) {
            this.loading = true;
            try {
                const res = await this.$http.get(`${this.api.detail}/${id}`);
                this.detail = res.data.data || res.data;
                this.author = this.detail.user;
            } catch (error) {
                console.error('获取详情失败:', error);
                this.$message?.error('获取详情失败');
            } finally {
                this.loading = false;
            }
        },

        async fetchRandomList() {
            try {
                const res = await this.$http.get(this.api.random);
                this.randomList = res.data.data || res.data || [];
            } catch (error) {
                console.error('获取随机推荐失败:', error);
            }
        },

        async handleDownload(data) {
            try {
                const res = await this.$http.post(this.api.download, data);
                if (res.data.code === 200) {
                    this.$message?.success('下载成功');
                    window.open(res.data.data.url, '_blank');
                } else {
                    this.$message?.error(res.data.msg || '下载失败');
                }
            } catch (error) {
                console.error('下载失败:', error);
                this.$message?.error('下载失败');
            }
        },

        async handleBuy(data) {
            try {
                const res = await this.$http.post(this.api.buy, data);
                if (res.data.code === 200) {
                    this.$message?.success('购买成功');
                    this.fetchDetail(this.$route.params.id);
                } else {
                    this.$message?.error(res.data.msg || '购买失败');
                }
            } catch (error) {
                console.error('购买失败:', error);
                this.$message?.error('购买失败');
            }
        },

        handleBack() {
            this.$router.go(-1);
        },

        handlePublish() {
            this.$router.push({
                name: `${this.type}-publish`
            });
        }
    }
};
