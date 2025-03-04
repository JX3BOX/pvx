<template>
    <div class="m-wiki">
        <div class="m-wiki-post-panel" v-if="wiki_post && wiki_post.post">
            <WikiPanel :wiki-post="wiki_post">
                <template slot="head-title">
                    <img class="u-icon" svg-inline src="../../assets/img/achievement.svg" />
                    <span class="u-txt">{{ title }}</span>
                </template>
                <template slot="head-actions">
                    <a class="el-button el-button--primary" :href="publish_url">
                        <i class="el-icon-edit"></i>
                        <span>完善{{ title }}</span>
                    </a>
                </template>
                <template slot="body">
                    <div class="m-wiki-compatible" v-if="compatible">
                        <i class="el-icon-warning-outline"></i> 暂无缘起攻略，以下为重制攻略，仅作参考，<a
                            class="s-link"
                            :href="publish_url"
                            >参与修订</a
                        >。
                    </div>
                    <Article :content="wiki_post.post.content" />
                    <div class="m-wiki-signature">
                        <i class="el-icon-edit"></i>
                        本次修订由 <b>{{ user_name }}</b> 提交于{{ updated_at }}
                    </div>
                    <Thx
                        class="m-thx"
                        :postId="id"
                        :postType="type"
                        :postTitle="source_title"
                        :adminBoxcoinEnable="false"
                        :userBoxcoinEnable="false"
                        :client="client"
                    />
                </template>
            </WikiPanel>

            <!-- 历史版本 -->
            <WikiRevisions :type="source_type" :source-id="source_id" :isGame="true" />
        </div>
        <div class="m-wiki-post-empty" v-if="is_empty">
            <i class="el-icon-s-opportunity"></i>
            <span>暂无攻略，我要</span>
            <a class="s-link" :href="publish_url">完善攻略</a>
        </div>
    </div>
</template>

<script>
import Article from "@jx3box/jx3box-editor/src/Article.vue";
import WikiPanel from "@jx3box/jx3box-common-ui/src/wiki/WikiPanel";
import WikiRevisions from "@jx3box/jx3box-common-ui/src/wiki/WikiRevisions";
import { publishLink, ts2str } from "@jx3box/jx3box-common/js/utils";
import { wiki } from "@jx3box/jx3box-common/js/wiki_v2";
export default {
    name: "Wiki",
    components: {
        WikiPanel,
        WikiRevisions,
        Article,
    },
    props: ["title", "source_type", "source_id", "type", "id", "source_title"],
    data() {
        return {
            wiki_post: null,

            compatible: false,
            // is_empty: true,
        };
    },
    computed: {
        post_content: function () {
            return this.wiki_post?.post;
        },
        is_empty: function () {
            return !this.wiki_post?.post;
        },
        isRevision: function () {
            return !!this.$route.params.post_id;
        },
        client: function () {
            return this.$store.state.client;
        },
        params: function () {
            return {
                type: this.source_type,
                source_id: this.id,
                client: this.client,
            };
        },
        user_name: function () {
            return this.wiki_post?.post?.user_nickname;
        },
        updated_at: function () {
            return ts2str(this.wiki_post?.post?.updated);
        },
        publish_url: function () {
            return publishLink(`${this.source_type}/${this.source_id}`);
        },
    },
    methods: {
        loadData: function () {
            wiki.mix({ type: this.source_type, id: this.source_id, client: this.client }).then((res) => {
                const { post, source, compatible, users } = res;
                this.wiki_post = {
                    post: post,
                    source: source,
                    users: users,
                };
                this.compatible = compatible;
            });
        },
    },
    watch: {
        source_id: {
            immediate: true,
            handler(val) {
                if (val) this.loadData();
            },
        },
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/common/wiki.less";
</style>
