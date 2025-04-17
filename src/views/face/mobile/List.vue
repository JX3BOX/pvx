<template>
    <div class="m-face-list_mobile">
        <PvxSuspension isType='list' :miniprogram="{ app: '捏脸', filter_name: 'pvxface' }" />
        <div class="m-face-list_mobile__tabs">
            <div class="u-tab_item" v-for="(item, index) in tabsData" :key="index"
                :class="{ 'is-active': active == item.value }" @click="setActive(item.value)">
                {{ item.label }}
            </div>
        </div>
        <div class="u-content-all" v-if="active == -1">
            <div v-for="(item, index) in allList" :key="index" class="u-content-item">
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
                <faceFind></faceFind>
            </div> -->
        </div>
        <div class="u-content" v-else>
            <!-- <div class="u-card-title">{{ activeName }}</div> -->
            <div class="u-list" id="oneList" v-loading="loadingList">
                <routine gap="0.667rem" size="5.778rem" :isOne="true" :list="list" :total="total" :loadingList="loadingList"
                    v-if="listShow" @getMore="getMore()"></routine>
            </div>
        </div>
    </div>
</template>

<script>
import PvxSuspension from '@/components/PvxSuspension.vue';
import routine from "@/components/face/mobile/routine.vue";
import habitus from "@/components/face/mobile/habitus.vue";
import faceFind from "@/components/face/mobile/faceFind_v2.vue";
import { cloneDeep, omit, concat, debounce } from "lodash";
import { getFaceList, getSliders } from "@/service/face";
export default {
    name: "listMobile",
    components: { PvxSuspension, routine, habitus },
    data() {
        return {
            loading: false,
            active: -1,
            activeName: "",
            tabsData: [
                { label: "全部", value: -1, client: ["std", "origin"] },
                { label: "成男", value: 1, client: ["std", "origin"] },
                { label: "成女", value: 2, client: ["std", "origin"] },
                { label: "正太", value: 5, client: ["std"] },
                { label: "萝莉", value: 6, client: ["std", "origin"] },
            ],
            allList: [
                {
                    label: "最新推荐",
                    list: [],
                    params: { star: 1, pageIndex: 1, pageSize: 12, filter_empty_images: true, code_mode: 1, is_personal_newest: 1 },
                },
                {
                    label: "写实派与写意派",
                    list: [],
                    params: { pageIndex: 1, pageSize: 12, filter_empty_images: true, star: 0, is_unlimited: 0, is_personal_newest: 1 },
                },
                {
                    label: "新建角色时推荐",
                    list: [],
                    params: { is_unlimited: 1, pageIndex: 1, pageSize: 12, filter_empty_images: true, star: 0, is_personal_newest: 1 },
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
        // this.getSliders();
        this.loadData();
    },
    methods: {
        suspensionClick(item) {
            console.log(item)
        },
        toTab(val) {
            this.setActive(val.body_type);
        },
        setActive(val) {
            let item = this.tabsData.find((e) => e.value == val);
            this.activeName = item.label;
            this.active = val;
            this.isFinish = false
        },
        // 捏脸海报
        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                this.slidersList = res.data.data.list || [];
            });
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
                            star: 1,
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
            getFaceList(params)
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
                        this.total = page.total;
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
.m-face-list_mobile {
    @fontcolor: #1c1c1c;
    @fontcolor2: rgba(28, 28, 28, 0.8);
    @fontcolor3: rgba(28, 28, 28, 0.4);
    @fontColor-dark: #fff;
    @fontColor-dark2: rgba(255, 255, 255, 0.8);
    @fontColor-dark3: rgba(255, 255, 255, 0.4);
    padding: 0 1.111rem 2.222rem 1.111rem;
    box-sizing: border-box;

    .m-face-list_mobile__tabs {
        position: sticky;
        top: 0;
        .z(2);
        .flex;
        justify-content: space-between;
        align-items: center;
        height: 1.778rem;
        background-color: #fff;
        padding: 0.667rem 0 1.111rem 0;

        .u-tab_item {
            color: @fontcolor3;
            .fz(1rem, 1.556rem);
            .bold(700);

            &.is-active {
                color: @fontcolor;
                //border-bottom: 0.111rem solid @fontcolor;
                .u-tab_item__line {
                    background-color: @fontcolor;
                    .h(0.111rem);
                    .r(0.222rem);
                }
            }
        }
    }

    .u-card-title {
        .mb(0.667rem);
        color: @fontcolor;
        .fz(1rem, 1.556rem);
        .bold(700);
    }

    .u-content-item {
        .mb(0.556rem);
    }

    // @media screen and (width: 390px)
    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .m-face-list_mobile__tabs {
            background-color: #000;

            .u-tab_item {
                color: @fontColor-dark2;

                &.is-active {
                    color: @fontColor-dark;
                    border-bottom: 0.111rem solid @fontColor-dark;
                }
            }
        }

        .u-card-title {
            color: @fontColor-dark;
        }
    }
}
</style>
