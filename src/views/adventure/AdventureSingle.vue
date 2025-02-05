<template>
    <div class="p-adventure-single" v-if="id" v-loading="loading">
        <div class="m-adventure-navigation">
            <div class="u-goback" @click="goBack">返回列表</div>
            <!-- <el-input
                placeholder="请输入奇遇或宠物名字搜索"
                v-model="search"
                class="u-input"
                @keyup.enter.native="goSearch"
            >
                <el-button slot="append" icon="el-icon-search" @click="goSearch"></el-button>
            </el-input> -->
        </div>
        <div class="m-adventure-header">
            <span class="m-adventure-title">{{ title }}</span>
            <div class="m-trigger-links">
                <a class="u-link u-achievement" :href="getLink('cj', achieve_id)" target="_blank">
                    <i class="el-icon-trophy"></i>
                    成就信息
                </a>
            </div>
        </div>
        <div class="m-adventure-content">
            <task :id="id" :info="data" />
        </div>
        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="achieve_id" name="奇遇" type="achievement" v-if="achieve_id">
            <template slot="serendipity">
                <div class="m-adventure-serendipity">
                    <Serendipity :title="title" />
                </div>
            </template>
        </pvx-user>
    </div>
</template>

<script>
import { getLink } from "@jx3box/jx3box-common/js/utils";
import { getAdventure, getSerendipityAchievementId } from "@/service/adventure";
import PvxUser from "@/components/PvxUser.vue";
import task from "@/components/adventure/task.vue";
import Serendipity from "@/components/common/serendipity.vue";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
export default {
    name: "adventureSingle",
    props: [],
    components: {
        task,
        Serendipity,
        PvxUser,
    },
    data: function () {
        return {
            type: "adventure",
            achieve_id: "",
            data: "",
            task: [],
            isPet: true,
            loading: false,
            search: "",
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        title: function () {
            return this.data?.szName;
        },
    },
    watch: {
        id: {
            immediate: true,
            handler: function (val) {
                if (val) {
                    this.getData();
                }
            },
        },
    },
    methods: {
        getLink,
        goBack() {
            this.$router.push({ name: "list" });
        },
        getData() {
            this.loading = true;
            getAdventure(this.id)
                .then((res) => {
                    this.isPet = false;
                    this.data = res.data;
                })
                .finally(() => {
                    this.loading = false;
                    postStat(this.type, this.id);
                });
            getSerendipityAchievementId(this.id).then((res) => {
                this.achieve_id = res.data.achievement_id;
            });
        },
        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },
    },
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/adventure/single.less";
</style>
