<template>
    <div class="m-flower">
        <div class="m-flower-container">
            <h1 class="m-flower-title">花价查询</h1>
            <div class="m-flower-desc">
                <el-divider><i class="el-icon-info"></i> 花价信息每日凌晨更新</el-divider>
            </div>
            <div class="m-flower-search">
                <el-row :gutter="20">
                    <el-col :span="5">
                        <el-select v-model="server" placeholder="请选择服务器" filterable>
                            <el-option v-for="serve in servers" :key="serve" :label="serve" :value="serve"></el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="5">
                        <el-select v-model="flower" placeholder="请选择花种" filterable>
                            <el-option v-for="item in flower_types" :key="item.name" :label="item.name" :value="item.id"></el-option>
                        </el-select>
                    </el-col>
                    <el-col :span="5">
                        <el-button class="u-button" type="primary" @click="search" :loading="loading">查询</el-button>
                    </el-col>
                </el-row>
            </div>
            <div class="m-flower-submit">
                <div class="u-tip">
                    <el-alert class="m-flower-tip" title="提示：点击小区可查看详细花价信息" type="info" show-icon :closable="false"> </el-alert>
                </div>
            </div>

            <div class="m-flower-box">
                <div class="m-flower-result" v-if="result && result.length">
                    <el-tabs v-model="activeTab">
                        <el-tab-pane label="花价列表" name="list">
                            <div class="m-flower-all">
                                <div class="u-flower" v-for="(item, i) in result" :key="i">
                                    <div class="u-title">
                                        <span class="u-name">{{ item.district }} - {{ item.name }}</span>
                                        <span class="u-price">最高价：<b>{{ item.maxPrice }}</b> 金</span>
                                    </div>
                                    <div class="u-desc">
                                        <span class="u-line" v-for="(flower, j) in item.flowers" :key="j">
                                            {{ flower.name }}：<b>{{ flower.price }}</b> 金
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane label="花价总览" name="overview">
                            <div class="m-flower-overview">
                                <el-table :data="overviewData" stripe style="width: 100%">
                                    <el-table-column prop="name" label="小区名称" width="180"></el-table-column>
                                    <el-table-column prop="maxPrice" label="最高价" width="100"></el-table-column>
                                    <el-table-column label="花价详情">
                                        <template #default="scope">
                                            <span v-for="(flower, i) in scope.row.flowers" :key="i" class="u-line-wrapper" @click="showDetail(scope.row, flower)">
                                                {{ flower.name }}: <b>{{ flower.price }}</b> 金
                                                <span v-if="i < scope.row.flowers.length - 1">| </span>
                                            </span>
                                        </template>
                                    </el-table-column>
                                </el-table>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </div>
                <el-empty v-else-if="searched" description="暂无花价数据"></el-empty>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * @description 花价查询页面
 * @description 查询全区服小区的花价信息，支持服务器和花种筛选
 * @author ymg
 * @version 1.0.0
 * 
 * @example
 * <Flower />
 * 
 * @notes
 * - 支持服务器筛选（支持搜索）
 * - 支持花种筛选（支持搜索）
 * - 花价信息每日凌晨更新
 * - 支持列表视图和表格视图切换
 * - 繁体服使用不同的服务器列表
 */
import { getFlowerServers, getFlowerPrice } from "@/service/homeland.js";
import servers_std from "@jx3box/jx3box-data/data/server/server_std.json";
import servers_origin from "@jx3box/jx3box-data/data/server/server_origin.json";

// 花种数据
const flower_types = [
    { name: "绣球花", id: "绣球花" },
    { name: "郁金香", id: "郁金香" },
    { name: "牵牛花", id: "牵牛花" },
    { name: "百合", id: "百合" },
    { name: "荧光菌", id: "荧光菌" },
    { name: "玫瑰", id: "玫瑰" },
    { name: "羽扇豆花", id: "羽扇豆花" },
    { name: "葫芦", id: "葫芦" },
    { name: "麦子", id: "麦子" },
    { name: "青菜", id: "青菜" },
    { name: "芜菁", id: "芜菁" },
];

export default {
    name: "Flower",
    props: [],
    data() {
        return {
            loading: false,
            searched: false,
            
            server: "",
            servers: [],
            flower: "",
            flower_types: flower_types,
            
            result: [],
            activeTab: "list",
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        overviewData() {
            return this.result;
        },
    },
    methods: {
        loadServers() {
            // 根据客户端类型加载服务器列表
            this.servers = this.client === "origin" ? servers_origin : servers_std;
        },
        search() {
            if (!this.server) {
                this.$message.warning("请选择服务器");
                return;
            }
            if (!this.flower) {
                this.$message.warning("请选择花种");
                return;
            }
            
            this.loading = true;
            this.searched = true;
            
            getFlowerPrice({
                server: this.server,
                flower: this.flower,
            })
                .then((res) => {
                    this.result = res.data || [];
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        showDetail(row, flower) {
            this.$message.info(`${row.district} - ${row.name}: ${flower.name} 价格 ${flower.price} 金`);
        },
    },
    created() {
        this.loadServers();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/homeland/flower.less";
</style>
