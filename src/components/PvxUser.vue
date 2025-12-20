<template>
    <!-- 包含攻略、评论、历史版本、点赞等 -->
    <div class="w-pvx-user">
        <!--攻略-->
        <div class="m-wiki-post-panel" :class="isRobot ? 'is-robot' : ''" v-if="wiki_post && wiki_post.post">
            <div v-if="isRobot" class="m-pvx-wiki-title">
                <span class="u-title">{{ name }}攻略</span>
                <span>（以魔盒在线版本为准）</span>
            </div>
            <WikiPanel :wiki-post="wiki_post">
                <template v-if="!isRobot">
                    <template slot="head-title">
                        <img class="u-icon" svg-inline src="@/assets/img/item.svg" />
                        <span class="u-txt">{{ name }}攻略</span>
                    </template>
                    <template slot="head-actions">
                        <a class="el-button el-button--primary" :href="publish_url(`${type}/${id}`)">
                            <i class="el-icon-edit"></i>
                            <span>完善{{ name }}攻略</span>
                        </a>
                    </template>
                </template>
                <template slot="body">
                    <div class="m-wiki-compatible" v-if="compatible">
                        <i class="el-icon-warning-outline"></i> 暂无缘起攻略，以下为重制攻略，仅作参考，<a
                            class="s-link"
                            :href="publish_url(`${type}/${id}`)"
                            >参与修订</a
                        >。
                    </div>
                    <Article id="pvxWiki" :content="wiki_post.post.content" />
                    <div class="m-wiki-signature">
                        <i class="el-icon-edit"></i>
                        本次修订由 <b>{{ user_name }}</b> 提交于{{ updated_at }}
                    </div>
                </template>
            </WikiPanel>
            <template v-if="!isRobot">
                <!-- 奇遇触发记录 -->
                <slot name="serendipity"></slot>

                <!-- 历史版本 -->
                <WikiRevisions :type="type" :source-id="id" />
            </template>
        </div>
        <div
            class="m-wiki-post-empty"
            :class="isRobot ? 'is-robot-empty' : ''"
            v-if="(!wiki_post || !wiki_post.post) && id"
        >
            <template v-if="!isRobot">
                <i class="el-icon-s-opportunity"></i>
                <span>暂无攻略，我要</span>
                <a class="s-link" :href="publish_url(`${type}/${id}`)">完善攻略</a>
            </template>
            <span v-else>暂无相关攻略，欢迎热心侠士前往补充！</span>
        </div>
        <template v-if="!isRobot">
            <Thx
                class="m-thx"
                :postId="id"
                postType="wiki"
                :postTitle="wiki_post.source.Name"
                :userId="author_id"
                :adminBoxcoinEnable="false"
                :userBoxcoinEnable="false"
                :authors="authors"
                mode="wiki"
                :key="type + '-thx-' + id"
                :client="client" />
            <!-- 百科评论 -->
            <WikiComments :type="type" :source-id="String(id)"
        /></template>
    </div>
</template>

<script>
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { wiki } from "@jx3box/jx3box-common/js/wiki_v2.js";

import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-common-ui/src/wiki/WikiPanel";
import WikiRevisions from "@jx3box/jx3box-common-ui/src/wiki/WikiRevisions";
import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";

import { publishLink, ts2str, getLink } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "PvxUser",
    components: {
        WikiPanel,
        Article,
        WikiRevisions,
        WikiComments,
    },
    props: {
        id: {
            required: true,
        },
        name: {
            type: String,
            default: "",
        },
        type: {
            type: String,
            required: true,
        },
        itemId: {
            type: String,
            default: "",
        },
        isRobot: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            wiki_post: {
                source: {},
                post: null,
            },
            compatible: false,
            is_empty: true,

            imageCount: 0,
            loadedImageCount: 0,
            images: [],
            imagesLoaded: false,
        };
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                if (this.post_id) {
                    this.loadRevision();
                } else {
                    this.loadData();
                }
            },
        },
        post_id: {
            handler() {
                this.loadRevision();
            },
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        //wiki相关
        post_id: function () {
            return this.itemId || this.$route.params.post_id;
        },
        isRevision: function () {
            return this.itemId ? !!this.itemId : !!this.$route.params.post_id;
        },
        author_id: function () {
            return ~~this.wiki_post?.post?.user_id;
        },
        user_name: function () {
            return this.wiki_post?.post?.user_nickname;
        },
        updated_at: function () {
            return ts2str(this.wiki_post?.post?.updated);
        },
        fav_title: function () {
            return this.wiki_post?.source?.Name;
        },
        authors: function () {
            if (!this.isRevision) {
                return (
                    this.wiki_post?.users
                        ?.filter((user) => user.id)
                        ?.map((user) => {
                            return {
                                user_id: user.id,
                                user_avatar: user.avatar,
                                display_name: user.nickname,
                            };
                        }) || []
                );
            }
            return [];
        },
    },
    mounted() {},
    beforeUnmount() {
        window.removeEventListener("load", this.initImageLoader);
    },
    methods: {
        initImageLoader() {
            // 在DOM更新后获取所有图片
            this.$nextTick(() => {
                const container = document.getElementById("pvxWiki");
                if (!container) {
                    this.setGlobalReady();
                    return;
                }

                const images = container.querySelectorAll("img");
                this.images = images;
                this.imageCount = images.length;

                if (this.imageCount === 0) {
                    this.setGlobalReady();
                    return;
                }

                // 手动预加载所有图片
                this.preloadAllImages(images);
            });
        },

        // 手动预加载所有图片
        preloadAllImages(images) {
            let loadedInThisBatch = 0;
            let totalProcessed = 0;
            Array.from(images).forEach((img, index) => {
                // 记录原始src
                const originalSrc = img.src;

                // 如果图片未加载
                if (!img.complete) {
                    // 创建一个Image对象来预加载
                    const tempImg = new Image();

                    tempImg.onload = () => {
                        loadedInThisBatch++;

                        // 在临时图片加载完成后，设置原始图片的src
                        img.src = originalSrc;

                        // 检查是否所有图片都已处理
                        this.checkImageLoadCompletion(images, loadedInThisBatch);
                    };

                    tempImg.onerror = () => {
                        console.error(`图片加载失败: ${originalSrc}`);
                        totalProcessed++;

                        // 即使加载失败，也要设置原始图片的src
                        img.src = originalSrc;

                        // 标记原始图片为已加载（错误情况）
                        this.handleImageLoad();
                    };

                    // 开始预加载
                    tempImg.src = originalSrc;
                } else {
                    // 图片已经加载完成
                    this.handleImageLoad();
                    totalProcessed++;
                }
            });
        },

        // 检查图片加载状态
        checkImageLoadCompletion(images, loadedCount) {
            if (images.length === this.loadedImageCount) {
                this.setGlobalReady();
                return;
            }

            // 设置超时检查，防止意外情况
            setTimeout(() => {
                const allLoaded = Array.from(images).every((img) => img.complete);

                if (allLoaded) {
                    this.setGlobalReady();
                } else if (this.loadedImageCount === images.length) {
                    this.setGlobalReady();
                }
            }, 3000);
        },

        // 判断是否全部完成
        handleImageLoad() {
            this.loadedImageCount++;
            if (this.loadedImageCount === this.imageCount) {
                this.setGlobalReady();
            }
        },

        // 设置全局就绪状态
        setGlobalReady() {
            if (this.imagesLoaded) return; // 避免重复设置

            this.imagesLoaded = true;
            window.__READY__ = true;
            console.log("全局状态设置成功: __READY__ = ", window.__READY__);
        },
        getLink,
        //百科相关
        loadData: async function () {
            // 获取最新攻略
            if (this.id) {
                await wiki.mix({ type: this.type, id: this.id, client: this.client }).then((res) => {
                    const { post, source, compatible, isEmpty, users } = res;
                    this.wiki_post = {
                        post: post,
                        source: source,
                        users,
                    };
                    this.is_empty = isEmpty;
                    this.compatible = compatible;
                });
                // 请注意，为防止QQBOT无法抓取完全，请不要删除
                if (this.isRobot) {
                    // 数据加载后启动奇遇流程中的图片检测
                    this.initImageLoader();
                }
            }
            this.triggerStat();
        },
        loadRevision: function () {
            // 获取指定攻略
            wiki.getById(this.post_id).then((res) => {
                this.wiki_post = res?.data?.data;
            });
            this.triggerStat();
        },
        publish_url: publishLink,
        triggerStat: function () {
            if (this.client == "origin") {
                postStat(`origin_${type}`, this.id);
            } else {
                postStat(this.type, this.id);
            }
        },
    },
};
</script>

<style lang="less">
.w-pvx-user {
    .m-wiki-post-panel.is-robot .m-panel-head .m-panel-title {
        .none;
    }
    .m-pvx-wiki-title {
        margin-top: 10px;
        span {
            font-weight: normal;
            font-style: normal;
            color: rgba(255, 255, 255, 0.5);
            font-size: 12px;
        }
        .u-title {
            color: #fff;
            font-size: 16px;
            font-weight: bold;
        }
    }
    & > div {
        margin-top: 40px !important;
    }
    .c-wiki-panel {
        margin-top: 40px !important;
    }
    .m-wiki-signature {
        text-align: right;
        color: #999;
        font-size: 12px;
        line-height: 2;
        border-top: 1px dashed #ddd;
        padding: 5px 0;
    }

    .u-msg-yellow {
        color: #8a6d3b;
        background-color: #fcf8e3;
        border: 1px solid #faebcc;
        padding: 8px 14px 8px 14px;
        text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
        border-radius: 4px;
    }

    .m-wiki-post-empty {
        .u-msg-yellow;
        .x;

        .s-link {
            .underline(@color-link);
        }

        letter-spacing: 2px;
        .fz(14px);
    }

    .m-wiki-compatible {
        .u-msg-yellow;
        margin: 10px auto;
        padding: 5px 10px;

        a {
            .underline(@color-link);
        }
    }
}
</style>
