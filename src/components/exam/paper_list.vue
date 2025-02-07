<template>
    <div class="m-paper-list">
        <div class="u-list">
            <div class="u-item" v-for="item in list" :key="'paper' + item.id">
                <router-link :to="{ name: 'paper', params: { id: item.id } }" class="u-link">
                    <span :class="`u-client i-client-${item.client}`">{{ clients[item.client] }}</span>
                    <div class="u-title">
                        <span>{{ item.title }}</span>
                        <span class="u-line" :class="item.style"></span>
                    </div>
                    <div class="u-tags">
                        <el-tag
                            class="u-tag el-tag--plain"
                            v-for="tag in item.tags"
                            :key="tag"
                            size="small"
                            effect="plain"
                            type="info"
                        >
                            {{ tag }}
                        </el-tag>
                    </div>
                    <div class="u-desc" :class="item.style">
                        <img class="u-icon" svg-inline src="../../assets/img/logo.svg" />
                        <div class="u-text">{{ item.desc }}</div>
                    </div>
                    <div class="u-info">
                        <div class="u-user">出卷人： {{ item.createUser }}</div>
                        <div class="u-star">
                            难度：
                            <el-rate v-model="item.hardStar" disabled text-color="#ff9900"></el-rate>
                        </div>
                    </div>
                </router-link>
            </div>
        </div>
    </div>
</template>
<script>
import { __clients } from "@jx3box/jx3box-common/data/jx3box.json";
export default {
    name: "PaperList",
    props: ["data"],
    components: {},
    data: function () {
        return { clients: __clients };
    },
    computed: {
        client: function () {
            return location.href.includes("origin") ? "origin" : "std";
        },
        list: function () {
            return this.data?.map((item, i) => {
                try {
                    item.tags = JSON.parse(item.tags).slice(0, 3);
                } catch (e) {
                    console.log("解析试卷列表tag异常", e);
                    item.tags = [];
                }
                return item;
            });
        },
    },
    watch: {},
    methods: {},
    filters: {},
    created: function () {},
    mounted: function () {},
};
</script>

<style lang="less">
@import "~@/assets/css/exam/paper_list.less";
</style>
