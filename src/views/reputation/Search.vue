<template>
    <div class="m-pvx-reputation-search">
        <div style="margin-top: 15px;">
            <el-select v-model="dlc" clearable placeholder="请选择" class="u-select">
                <el-option v-for="item in versions" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
                <template #prefix>
                    <div class="u-text">版本：</div>
                </template>
            </el-select>
            <el-input placeholder="请输入搜索内容" v-model="keyword" class="input-with-select">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </div>
        <div class="reputation-list">
            <template v-if="dlc||keyword" >
                <div class="reputation-show-list" v-for="item in showList" :key="item.value">
                    <div class="u-title" >{{ item.label }}</div>
                    <div class="u-list">
                        <reputation-item :item="item" v-for="item in item.list" :key="item.dwForceID"></reputation-item>
                    </div>
                </div>
            </template>
            <template v-else >
                <reputation-item :item="item" v-for="item in newsList" :key="item.dwForceID"></reputation-item>
            </template>

        </div>
    </div>
</template>

<script>
import { getList, getMenus } from "@/service/reputation";
import ReputationItem from "@/components/reputation/ReputationItem.vue";
import { getBreadcrumb } from "@jx3box/jx3box-common/js/api_misc";
import maps_std from "@jx3box/jx3box-data/data/fb/fb_map.json";
import maps_origin from "@jx3box/jx3box-data/data/fb/fb_map_origin.json";
import { cloneDeep } from "lodash";
export default {
    components: {
        ReputationItem
    },
    data() {
        return {
            loading: false,
            news: [],
            newsList: [],
            level: -1,
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
        params() {
            return {
                page: 1,
                per: 100,
                client: this.client,
            };
        },
        showList() {
            let list = cloneDeep(this.versionList);
            console.log(list)
            console.log(this.dlc)
            if (this.dlc) {
                list = list.filter((item) => item.value === Number(this.dlc));
                console.log("筛选",list)
            }
            if (this.keyword) {
                const keyword = this.keyword.trim();
                list = list
                    .map((item) => {
                        item.list = item.list.filter((e) => e.szName.includes(keyword));
                        return item;
                    })
                    .filter((item) => {
                        return item.list.length;
                    });
            }
            return list;
        },
    },
    watch: {

    },
    created() { },
    mounted() {
        this.loadData();
    },
    methods: {
        loadData() {
            this.loading = true;
            getBreadcrumb("reputation-newest", { client: this.client })
                .then((data) => {
                    this.news = data.split(",").map((item) => Number(item));
                })
                .then(() => {
                    getMenus({ client: this.client }).then((res) => {
                        const maps = this.client === "std" ? maps_std : maps_origin;
                        const list = res.data.dlc || [];
                        const arr = Object.keys(maps)
                            .map((key) => {
                                return `${key}(${maps[key].level}级)`;
                            })
                            .reverse();
                        const versions = list.map((item, i) => {
                            return {
                                value: item.nDlcID,
                                total: item.total,
                                label: arr[i],
                            };
                        });
                        this.versions = versions.reverse();
                        // 加载所有声望
                        const promiseAll = this.versions.map((item) => getList({ dlc: item.value, ...this.params }));
                        Promise.all(promiseAll).then((res) => {
                            const allList = res.map((item) => item.data.list);
                            this.newsList = allList.flat().filter((item) => this.news.includes(item.dwForceID));
                            const filterList = this.versions.map((item) => {
                                return {
                                    ...item,
                                    list: allList.flat().filter((reputation) => reputation.nDlcID === item.value),
                                };
                            });
                            this.versionList = filterList;
                        });
                    });
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
};
</script>

<style lang="less">
.v-miniprogram {
    .m-main {
        box-sizing: border-box;
        height: 100vh;
        overflow: hidden;
    }
}

.m-pvx-reputation-search {
    height: 100%;
    background: #f9f9f9;
    .u-select {
        .mb(10px);
        .w(100%);

        .el-input__inner {
            .pl(50px);
        }

        .el-input__prefix {
            .flex;
            align-items: center;
            gap: 6px;

            .u-text {
                .fz(16px);

            }
        }

    }

    .reputation-list {
        height: calc(100% - 100px);
        overflow-y: auto;
        .mt(10px);
        .flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        background: #f9f9f9;
        &::-webkit-scrollbar {
            width: 0;
            height: 0;
        }
        .reputation-title{
            .fz(16px);
        }
        .reputation-show-list{
           .w(100%);
            .u-title{
                .fz(16px);
            }
            .u-list{
                .mt(10px);
                .flex;
                flex-direction: column;
                gap: 10px;
                background: #f9f9f9;
            }
        }
        .reputation-item {
            .w(100%);
        }
    }
}
//@media screen and (width: 390px)
@media (prefers-color-scheme: dark)
{
    .v-miniprogram {
        .m-main {
            background: #000000;
        }
    }
    .m-pvx-reputation-search{
        .reputation-list{
           background: #000000;
            .reputation-show-list{
                .u-list{
                   background: #000000;
                }
            }
        }
    }
}
</style>
