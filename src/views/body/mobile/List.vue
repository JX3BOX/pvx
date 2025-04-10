<template>
    <div class="m-body-list_mobile">
        <PvxSuspension isType='list' :miniprogram="{ app: '体型', filter_name: 'pvxbody' }" />
        <div class="m-body-list_mobile__tabs">
            <div class="u-tab_item" v-for="(item, index) in tabsData" :key="index"
                :class="{ 'is-active': active == item.value }" @click="setActive(item.value)">
                {{ item.label }}
                <div class="u-tab_item__line"></div>
            </div>
        </div>
        <div class="u-content-all" v-if="active == -1">
            <div v-for="(item, index) in allList" :key="index">
                <div class="u-card-title">{{ item.label }}</div>
                <div class="u-list">
                    <routine :list="item.list"></routine>
                </div>
            </div>

            <div class="u-card-title">体型特辑</div>
            <div class="u-list">
                <habitus :list="bodyList" @toTab="toTab"></habitus>
            </div>
            <!-- <div class="u-card-title">发现</div>
            <div class="u-list">
                <bodyFind></bodyFind>
            </div> -->
        </div>
        <div class="u-content" v-else>
            <!-- <div class="u-card-title">{{ activeName }}</div> -->
            <div class="u-list" id="oneList">
                <routine gap="12px" :size="104" :isOne="true" :list="list" :total="total" v-if="listShow"
                    :loadingList="loadingList" @getMore="getMore"></routine>
            </div>
        </div>
    </div>
</template>

<script>
import PvxSuspension from '@/components/PvxSuspension.vue';
import routine from "@/components/body/mobile/routine.vue";
import habitus from "@/components/body/mobile/habitus.vue";
import { concat } from "lodash";
import { getBodyList } from "@/service/body";
export default {
    components: { routine, habitus, PvxSuspension },
    data() {
        return {
            loading: false,
            active: -1,
            activeName: "",
            tabsData: [
                { label: "全部", value: -1, client: ["std", "origin"] },
                { label: "成男", value: 1, client: ["std", "origin"], },
                { label: "成女", value: 2, client: ["std", "origin"] },
                { label: "正太", value: 5, client: ["std"] },
                { label: "萝莉", value: 6, client: ["std", "origin"] },
            ],
            allList: [
                {
                    label: "最新推荐",
                    list: [],
                    params: { star: -1, pageIndex: 1, pageSize: 12, filter_empty_images: true },
                },
                {
                    label: "写实派与写意派",
                    list: [],
                    params: { pageIndex: 1, pageSize: 12, filter_empty_images: true, star: 0, is_unlimited: 0 },
                },
                {
                    label: "新建角色时推荐",
                    list: [],
                    params: { is_unlimited: 1, pageIndex: 1, pageSize: 12, filter_empty_images: true, star: 0 },
                },
                // { label: "轮播", list: [], params: { pageIndex: 1, pageSize: 4 } },
            ],
            list: [],
            listShow: false,
            queryParams: {
                pageIndex: 1,
                pageSize: 15,
            },
            total: 0,
            bodyList: [], // 体型特辑
            loadingList: false,
            isFinish: false
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        active(val) {
            if (val != -1) {
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
        },
    },
    mounted() {
        this.loadData();
    },
    methods: {
        toTab(val) {
            this.setActive(val.body_type);
        },
        setActive(val) {
            let item = this.tabsData.find((e) => e.value == val);
            this.activeName = item.label;
            this.active = val;
            this.isFinish = false
        },
        getMore() {
            this.queryParams.pageIndex++;
            this.loadData();
        },
        // 加载数据
        loadData() {
            this.loading = true;
            if (this.active === -1) {
                this.allList.forEach((e, index) => {
                    this.loadList({ client: this.client, ...e.params }, index);
                });
                //加载体型特辑，每个体型取第一条推荐
                let arr = [1, 2, 5, 6];
                arr.forEach((e, index) => {
                    this.loadList(
                        {
                            client: this.client,
                            body_type: e,
                            // star: 1,
                            pageIndex: 1,
                            pageSize: 1,
                            filter_empty_images: true,
                        },
                        index,
                        true
                    );
                });
            } else {
                this.loadList({ ...this.queryParams, body_type: this.active }, this.active);
            }
        },

        loadList(params, index, body = false) {
            this.loadingList = true
            if (this.isFinish) return;
            getBodyList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.active != -1 ? concat(this.list, list || []) : list;
                    if (body) {
                        this.bodyList.push(_list[0]);
                        return;
                    }
                    if (this.active !== -1) {
                        if (!list || list.length < params.pageSize) this.isFinish = true
                        this.list = _list || [];
                        this.queryParams.pageIndex = page.index || 1;
                        this.total = Number(page.total) || 0;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loadingList = false
                    this.loading = false;
                    this.listShow = true;
                });
        },
    },
};
</script>

<style lang="less">
.m-body-list_mobile {
    @fontcolor: #1c1c1c;
    @fontcolor2: rgba(28, 28, 28, 0.8);
    @fontcolor3: rgba(28, 28, 28, 0.4);
    @fontColor-dark: #fff;
    @fontColor-dark2: rgba(255, 255, 255, 0.8);
    @fontColor-dark3: rgba(255, 255, 255, 0.4);
    padding: 0 20px 12px 20px;
    box-sizing: border-box;

    .m-body-list_mobile__tabs {
        position: sticky;
        top: 0;
        .z(2);
        .flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        background-color: #fff;
        padding: 12px 0 20px 0;

        .u-tab_item {
            color: @fontcolor3;
            .fz(18px, 28px);
            .bold(700);

            &.is-active {
                color: @fontcolor;

                // border-bottom: 2px solid @fontcolor;
                // border-bottom-left-radius: 2px; /* 底部左侧圆角 */
                // border-bottom-right-radius: 2px; /* 底部右侧圆角 */
                .u-tab_item__line {
                    background-color: @fontcolor;
                    .h(2px);
                    .r(4px);
                }
            }
        }
    }

    .u-card-title {
        .mb(12px);
        color: @fontcolor;
        .fz(18px, 28px);
        .bold(700);
    }

    // @media screen and (width: 390px)
    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .m-body-list_mobile__tabs {
            background-color: #000;

            .u-tab_item {
                color: @fontColor-dark2;

                &.is-active {
                    color: @fontColor-dark;

                    // border-bottom: 2px solid @fontColor-dark;
                    .u-tab_item__line {
                        background-color: @fontColor-dark;
                    }
                }
            }
        }

        .u-card-title {
            color: @fontColor-dark;
        }
    }

}
</style>
