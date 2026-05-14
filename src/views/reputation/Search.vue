<template>
    <div class="m-pvx-reputation-search">
        <div class="u-search">
            <el-select v-model="dlc" clearable placeholder="请选择" class="u-select">
                <el-option v-for="item in versions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
                <template #prefix>
                    <div class="u-text">版本：</div>
                </template>
            </el-select>
            <el-input placeholder="请输入搜索内容" v-model="keyword" class="input-with-select">
                <template #append><el-button icon="el-icon-search"></el-button></template>
            </el-input>
        </div>
        <div class="m-pvx-reputation-list">
            <template v-if="dlc || keyword">
                <div class="m-pvx-reputation-show-list" v-for="item in showList" :key="item.value">
                    <div class="u-title">{{ item.label }}</div>
                    <div class="u-list">
                        <reputation-item :item="item" v-for="item in item.list" :key="item.dwForceID"></reputation-item>
                    </div>
                </div>
            </template>
            <template v-else>
                <reputation-item :item="item" v-for="item in newsList" :key="item.dwForceID"></reputation-item>
            </template>
        </div>
    </div>
</template>

<script>
import ReputationItem from "@/components/reputation/ReputationItem.vue";
import { loadReputationList } from "@/service/reputation-data";
import { cloneDeep } from "lodash";

export default {
    components: {
        ReputationItem,
    },
    data() {
        return {
            loading: false,
            newsList: [],
            versions: [],
            versionList: [],
            keyword: "",
            dlc: "",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        showList() {
            let list = cloneDeep(this.versionList);
            if (this.dlc) {
                list = list.filter((item) => item.value === Number(this.dlc));
            }
            if (this.keyword) {
                const keyword = this.keyword.trim();
                list = list
                    .map((item) => {
                        item.list = item.list.filter((e) => e.szName.includes(keyword));
                        return item;
                    })
                    .filter((item) => item.list.length);
            }
            return list;
        },
    },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            this.loading = true;
            loadReputationList(this.client, 100)
                .then(({ versions, newsList, versionList }) => {
                    this.versions = versions;
                    this.newsList = newsList;
                    this.versionList = versionList;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/search.less";
</style>
