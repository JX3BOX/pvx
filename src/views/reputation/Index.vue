<template>
    <div class="p-pvx-reputation" v-loading="loading">
        <CommonToolbar class="m-pvx-reputation-tabs" color="#d16400" search @update="updateToolbar">
            <template v-slot:prefix>
                <div class="m-toolbar-item">
                    <div class="u-item" :class="{ active: isAll }" @click="toAll">全部</div>
                    <el-select class="u-select" v-model="dlc" clearable :class="{ active: dlc }">
                        <el-option v-for="item in versions" :key="item.value" :value="item.value"
                            :label="item.label"></el-option>
                        <template #prefix> 版本 </template>
                    </el-select>
                </div>
            </template>
        </CommonToolbar>

        <div v-if="isAll && !keyword" class="m-pvx-reputation__group">
            <div class="u-pvx-reputation-title">资料片新增</div>
            <div class="m-pvx-reputation-list">
                <reputation-item :item="item" v-for="item in newsList" :key="item.dwForceID"></reputation-item>
            </div>
        </div>
        <template v-if="showList.length">
            <div class="m-pvx-reputation__group" v-for="item in showList" :key="item.value">
                <div class="u-pvx-reputation-title" :class="!isAll ? 'u-pvx-reputation-title--not-all' : ''">{{ item.label }}</div>
                <div class="m-pvx-reputation-list">
                    <reputation-item :item="item" v-for="item in item.list" :key="item.dwForceID"></reputation-item>
                </div>
            </div>
        </template>
    </div>
</template>

<script>
import CommonToolbar from "@/components/common/toolbar.vue";
import ReputationItem from "@/components/reputation/ReputationItem.vue";
import { loadReputationList } from "@/service/reputation-data";
import { cloneDeep } from "lodash";

export default {
    name: "Index",
    components: { ReputationItem, CommonToolbar },
    data() {
        return {
            loading: false,
            newsList: [],
            versions: [],
            versionList: [],
            isAll: true,
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
    watch: {
        dlc(val) {
            this.isAll = val ? false : true;
        },
    },
    methods: {
        updateToolbar(data) {
            const { search } = data;
            this.keyword = search;
        },
        toAll() {
            this.isAll = true;
            this.dlc = "";
        },
        loadData() {
            this.loading = true;
            loadReputationList(this.client, 50)
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
    mounted() {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/reputation/home.less";
</style>
