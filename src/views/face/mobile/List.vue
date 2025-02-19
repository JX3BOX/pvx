<template>
    <div class="m-face-list_mobile">
        <div class="m-face-list_mobile__tabs">
            <div
                class="u-tab_item"
                v-for="(item, index) in tabsData"
                :key="index"
                :class="{ 'is-active': active == item.value }"
                @click="setActive(item.value)"
            >
                {{ item.label }}
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
                <habitus :list="bodyList"></habitus>
            </div>
            <!-- <div class="u-card-title">发现</div>
            <div class="u-list">
                <faceFind></faceFind>
            </div> -->
        </div>
        <div class="u-content" v-else>
            <div class="u-card-title">{{ activeName }}</div>
            <div class="u-list" id="oneList">
                <routine gap="12px" :size="104" :isOne="true" :list="list" v-if="listShow" @getMore="getMore"></routine>
            </div>
        </div>
    </div>
</template>

<script>
import routine from "@/components/face/mobile/routine.vue";
import habitus from "@/components/face/mobile/habitus.vue";
import faceFind from "@/components/face/mobile/faceFind_v2.vue";
import { cloneDeep, omit, concat, debounce } from "lodash";
import { getFaceList, getSliders } from "@/service/face";
export default {
    components: { routine, habitus },
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
                    params: { star: 1, pageIndex: 1, pageSize: 12, filter_empty_images: true },
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
        setActive(val) {
            let item = this.tabsData.find((e) => e.value == val);
            this.activeName = item.label;
            this.active = val;
        },
        // 捏脸海报
        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                console.log(res);
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
            getFaceList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.active != -1 ? concat(this.list, list) : list;
                    if (body) {
                        this.bodyList.push(_list[0]);
                        return;
                    }
                    if (this.active !== -1) {
                        this.list = _list || [];
                        this.queryParams.pageIndex = page.index || 1;
                        this.total = page.total;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                    console.log(this.bodyList);
                })
                .finally(() => {
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
    padding: 12px 20px;
    .m-face-list_mobile__tabs {
        .flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        .u-tab_item {
            color: @fontcolor3;
            .fz(18px,28px);
            .bold(700);

            &.is-active {
                color: @fontcolor;
                border-bottom: 2px solid @fontcolor;
            }
        }
    }
    .u-card-title {
        margin: 20px 0 12px 0;
        color: @fontcolor;
        .fz(18px,28px);
        .bold(700);
    }
    @media screen and (width: 390px) {
        background-color: #000;
        .m-face-list_mobile__tabs {
            .u-tab_item {
                color: @fontColor-dark2;
                &.is-active {
                    color: @fontColor-dark;
                    border-bottom: 2px solid @fontColor-dark;
                }
            }
        }
        .u-card-title {
            color: @fontColor-dark;
        }
    }
    @media (prefers-color-scheme: dark) {
    }
}
</style>
