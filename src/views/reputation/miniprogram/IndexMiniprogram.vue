<template>
    <div class="p-pvx-reputation" v-loading="loading">
        <SuspendCommon :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report'] }" @search="search"
            v-if="$route.query?.disabled != 'true'">
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="showForm = true">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ versionLabel }}
                    </div>
                    <div class="u-btn-item" @click="search">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/search.svg" svg-inline />
                        搜索
                    </div>
                </div>
            </template>
        </SuspendCommon>
        <el-drawer v-model="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
            :modal-append-to-body="false" append-to-body class="c-drawer">
            <div class="m-pvx-reputation-tabs--miniprogram">
                <div class="u-tab" v-for="item in versions" :class="{ active: dlc === item.value }" :key="item.value"
                    @click="switchVersion(item.value)">
                    {{ item.label.replace(/\([^)]*\)/g, "") }}
                </div>
            </div>
        </el-drawer>

        <div v-if="isAll" class="m-pvx-reputation__group">
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
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import ReputationItem from "@/components/reputation/miniprogram/ReputationItemMiniprogram.vue";
import { loadReputationList } from "@/service/reputation-data";
import { cloneDeep } from "lodash";

export default {
    name: "IndexMiniprogram",
    components: { ReputationItem, SuspendCommon },
    data() {
        return {
            loading: false,
            newsList: [],
            versions: [],
            versionList: [],
            isAll: true,
            keyword: "",
            dlc: "",
            showForm: false,
            versionLabel: "版本",
            intervalId: null,
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
        versionLabelChange() {
            clearInterval(this.intervalId);
            let label = "";
            if (this.dlc) {
                const item = this.versionList.find((item) => item.value === Number(this.dlc));
                label = item.label.replace(/\([^)]*\)/g, "");
            }
            this.versionLabel = label;
            this.intervalId = setInterval(() => {
                this.versionLabel = this.versionLabel === label ? "版本" : label;
            }, 5000);
        },
        search() {
            this.$router.push({ name: "search" });
        },
        switchVersion(dlc) {
            if (!dlc) {
                this.isAll = true;
                this.dlc = "";
            } else {
                this.dlc = dlc;
            }
            this.showForm = false;
            this.versionLabelChange();
        },
        loadData() {
            this.loading = true;
            loadReputationList(this.client, 50)
                .then(({ versions, newsList, versionList }) => {
                    this.versions = versions;
                    this.newsList = newsList;
                    this.versionList = versionList;
                    this.dlc = this.versionList?.[0]?.value;
                    this.versionLabelChange();
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
@import "~@/assets/css/reputation/miniprogram/home.less";
@import "~@/assets/css/miniprogram.less";
@import "~@/assets/css/common/drawer.less";
</style>
