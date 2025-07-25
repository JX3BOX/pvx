<template>
    <!-- 包含攻略、评论、历史版本、点赞等 -->
    <div class="w-pvx-user__miniprogram">
        <div v-if="isMiniProgram && name == '奇遇'" class="u-adventure-tips">← 左右滑动可以查看奇遇流程故事 →</div>
        <!--攻略-->
        <div id="mini-wiki-post-panel" class="m-wiki-post-panel" v-if="wiki_post && wiki_post.post">
            <WikiPanel :wiki-post="wiki_post">
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
                <template slot="body">
                    <div class="m-wiki-compatible" v-if="compatible">
                        <i class="el-icon-warning-outline"></i> 暂无缘起攻略，以下为重制攻略，仅作参考，<a
                            class="s-link"
                            :href="publish_url(`${type}/${id}`)"
                            >参与修订</a
                        >。
                    </div>
                    <Article :content="wiki_post.post.content" />
                    <div class="m-wiki-signature" v-if="wiki_post.post.content" @click="versionVisible = true">
                        查看历史修订
                    </div>
                </template>
            </WikiPanel>

            <!-- 奇遇触发记录 -->
            <slot name="serendipity"></slot>

            <!-- 历史版本 -->
            <!-- <WikiRevisions :type="type" :source-id="id" /> -->

            <el-dialog :lock-scroll="false" :visible.sync="versionVisible" custom-class="m-version-drawer">
                <div class="m-version-container">
                    <div class="u-version" v-for="(item, i) in versions" :key="i">
                        <div class="u-title-wrap">
                            <div class="u-title">{{ item.version }}</div>
                            <div class="u-user">{{ item.user_nickname }}</div>
                        </div>
                        <div class="u-time">{{ item.time }}</div>
                        <div class="u-content">{{ item.remark }}</div>
                    </div>
                </div>
            </el-dialog>

            <!-- <el-drawer
                class="m-version-drawer"
                :visible.sync="versionVisible"
                direction="btt"
                append-to-body
                custom-class="bottom-drawer"
                modal-class="full-modal"
            >
                <div class="m-version-container">
                    <div class="u-version" v-for="(item, i) in versions" :key="i">
                        <div class="u-title-wrap">
                            <div class="u-title">{{ item.version }}</div>
                            <div class="u-user">{{ item.user_nickname }}</div>
                        </div>
                        <div class="u-time">{{ item.time }}</div>
                        <div class="u-content">{{ item.remark }}</div>
                    </div>
                </div>
            </el-drawer> -->
        </div>
        <div class="m-wiki-post-empty" v-if="(!wiki_post || !wiki_post.post) && id">
            <i class="el-icon-s-opportunity"></i>
            <span>暂无攻略，我要</span>
            <a class="s-link" :href="publish_url(`${type}/${id}`)">完善攻略</a>
        </div>
        <!-- <Thx
            class="m-thx"
            :postId="id"
            :postType="type"
            :postTitle="wiki_post.source.Name"
            :userId="author_id"
            :adminBoxcoinEnable="false"
            :userBoxcoinEnable="false"
            :authors="authors"
            mode="wiki"
            :key="type + '-thx-' + id"
            :client="client"
        /> -->
        <!-- 百科评论 -->
        <WikiComments id="mini-wiki-comments" v-if="!isFromSeasun" :type="type" :source-id="String(id)" />
    </div>
</template>

<script>
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
import { wiki } from "@jx3box/jx3box-common/js/wiki_v2.js";

import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-common-ui/src/wiki/WikiPanel";
// import WikiRevisions from "@jx3box/jx3box-common-ui/src/wiki/WikiRevisions";
import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";

import { publishLink, ts2str, getLink } from "@jx3box/jx3box-common/js/utils";
import { isMiniProgram } from "@jx3box/jx3box-common/js/utils";

export default {
    name: "PvxUser",
    components: {
        WikiPanel,
        Article,
        // WikiRevisions,
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
    },
    data() {
        return {
            wiki_post: {
                source: {},
                post: null,
            },
            compatible: false,
            is_empty: true,
            versionVisible: false,
            versions: [],
            isMiniProgram: isMiniProgram(),
        };
    },
    watch: {
        id: {
            immediate: true,
            handler() {
                console.log(this.$route.fullPath);
                if (this.post_id) {
                    this.loadRevision();
                } else {
                    this.loadData();
                }
                if (this.id) {
                    wiki.versions({ type: this.type, id: this.id }, { client: this.client }).then(
                        (res) => {
                            res = res.data;
                            const len = res.data?.length;
                            this.versions = (res.data || []).slice(0, 5).map((item, i) => {
                                return {
                                    ...item,
                                    remark: item.remark,
                                    time: ts2str(item.updated),
                                    version: `V${len - i}`,
                                };
                            });
                        },
                        () => {
                            this.versions = [];
                        }
                    );
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
        // 西山居的页面不展示评论
        isFromSeasun() {
            return this.isMiniProgram && this.$route.fullPath?.indexOf("_from=seasun") > -1;
        },
    },
    methods: {
        getLink,
        //百科相关
        loadData: function () {
            // 获取最新攻略
            if (this.id) {
                wiki.mix({ type: this.type, id: this.id, client: this.client }).then((res) => {
                    const { post, source, compatible, isEmpty, users } = res;
                    this.wiki_post = {
                        post: post,
                        source: source,
                        users,
                    };
                    this.is_empty = isEmpty;
                    this.compatible = compatible;
                });
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
@brand2: #24292e;
@brand2-dark: #fedaa3;
@brand3: #fedaa3;
@brand4: #ffffff;
@brand4-dark: #282828;
@black-40: rgba(28, 28, 28, 0.4);
@black-40-dark: rgba(255, 255, 255, 0.4);
@black-80: rgba(28, 28, 28, 0.8);
@black-80-dark: rgba(255, 255, 255, 0.8);

// 注意：背景色只改变量在小程序上不生效
@color-light: #1c1c1c;
@bg-light: #f9f9f9;

@color-dark: #ffffff;
@bg-dark: #060606;
@secondary-cyan: #32ade6;
// html
.v-miniprogram {
    .m-version-drawer {
        position: fixed !important;
        bottom: 0;
        margin: 0;
        left: 0;
        width: 100% !important;
        border-radius: 20px 20px 0px 0px;
        background: @brand4;
        .el-dialog__header {
            .none;
        }

        .el-dialog__body {
            padding: 20px;
            max-height: 70vh;
            overflow-y: scroll;
        }
        .m-version-container {
            .u-title-wrap {
                .flex;
                justify-content: space-between;
                align-items: center;
            }
        }
        .u-version {
            position: relative;
            padding-bottom: 2px;
            margin-bottom: 12px;
            &::after {
                width: 160px;
                height: 1px;
                background: rgba(28, 28, 28, 0.1);
                .db;
                content: "";
                position: absolute;
                bottom: 0;
                left: calc((100% - 160px) / 2);
            }
        }
        .u-title {
            color: @brand2;

            font-family: "Microsoft YaHei UI";
            font-size: 16px;
            font-style: normal;
            font-weight: 700;
            line-height: 24px; /* 150% */
        }
        .u-user,
        .u-content {
            color: rgba(28, 28, 28, 0.8);

            font-family: "Microsoft YaHei UI";
            font-size: 14px;
            font-style: normal;
            font-weight: 400;
            line-height: 20px; /* 142.857% */
        }
        .u-time {
            margin-top: 2px;
            color: rgba(28, 28, 28, 0.4);

            /* 12 Regular */
            font-family: "Microsoft YaHei UI";
            font-size: 12px;
            font-style: normal;
            font-weight: 400;
            line-height: 18px; /* 150% */
        }
        .u-content {
            margin: 12px 0;
        }
        @media (prefers-color-scheme: dark) {
            .u-title {
                color: @brand3;
            }
            .u-user,
            .u-content {
                color: rgba(255, 255, 255, 0.8);
            }
            .u-time {
                color: rgba(255, 255, 255, 0.8);
            }
            .u-version {
                &::after {
                    background: rgba(255, 255, 255, 0.1);
                }
            }
        }
    }

    /* 修复抽屉自身定位 */
    .bottom-drawer {
        position: fixed;
        bottom: 0 !important;
    }

    .m-adventure-navigation {
        display: none;
    }

    .w-pvx-user__miniprogram {
        .mt(12px);

        .u-adventure-tips {
            text-align: center;
            .mt(-20px);
            color: @black-40;
            text-align: center;
            .fz(12px,18px);
        }

        .m-wiki-post-panel {
            background-color: @brand4;
            border: 1px solid rgba(40, 40, 40, 0.05);
            .r(10px);
            .mt(20px);
            .c-wiki-panel {
                background-color: transparent;
                border: none;
                .m-panel-head {
                    padding: 16px 16px 0;
                    background-color: transparent;
                    border: none;
                    .r(10px);

                    .m-panel-title {
                        padding: 0;
                        color: @brand2;
                        .u-txt,
                        span {
                            font-family: "Microsoft YaHei UI" !important;
                            font-size: 16px !important;
                            font-weight: 700 !important;
                        }
                        svg,
                        .el-icon-chat-line-round {
                            .none !important;
                        }
                    }
                }
                .m-panel-body {
                    padding: 0 16px 16px;
                    .m-wiki-metas {
                        .u-creator {
                            &:not(:last-child) {
                                margin-right: -8px;
                            }
                        }
                        .u-meta {
                            margin-top: 4px;
                            margin-bottom: 4px;
                            &:nth-of-type(2) {
                                display: none;
                            }
                        }
                    }
                    .u-label {
                        .none;
                    }
                    .u-value {
                        color: rgba(@brand2, 0.4);
                    }

                    .c-article-tinymce,
                    .u-content {
                        color: @black-80;
                    }
                    .m-wiki-signature {
                        margin-top: 16px;
                        padding-top: 20px;
                        text-align: center;
                        border: none;
                        color: @black-40;
                    }
                    .w-thx-copyright {
                        background-color: @color-dark !important;
                        border: none;
                    }
                    .u-comment {
                        border: none !important;
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
            }
        }
    }

    .c-wiki-comments {
        margin: 20px -20px 0;
        border: none;
        background-color: @brand4;
        border-radius: 0;

        .m-panel-head {
            display: none;
        }

        .u-nickname {
            color: @secondary-cyan !important;
        }
        .u-content {
            color: @black-80;
        }
        .u-time {
            color: @black-40;
        }

        .el-pagination {
            overflow-x: scroll;
        }
    }
}
@media (prefers-color-scheme: dark) {
    .m-version-drawer {
        background: @brand4-dark !important;
    }
    .w-pvx-user__miniprogram {
        .u-adventure-tips {
            color: @black-40-dark !important;
        }
        .m-wiki-post-panel {
            background-color: @brand4-dark !important;
            .m-panel-title {
                color: @brand2-dark !important;
            }
            .m-panel-body {
                .m-wiki-metas {
                    .u-value {
                        color: rgba(@color-dark, 0.4) !important;
                    }
                }
                .c-article-tinymce {
                    color: @black-80-dark !important;
                }
            }
            .m-wiki-signature {
                color: @black-40-dark !important;
            }
        }
        .c-wiki-comments {
            background-color: @brand4-dark;
            .u-content {
                color: @black-80-dark !important;
            }
            .u-time {
                color: @black-40-dark !important;
            }
        }
    }
}
</style>
