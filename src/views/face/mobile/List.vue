<template>
    <div class="m-face-list_mobile">
        <!--        <PvxSuspension isType='list' :miniprogram="{ app: '捏脸', filter_name: 'pvxface' }" />-->
        <SuspendCommon :btnOptions="{showHome:true}"
                       :drawerOptions="{hideType:['collect','rss','laterOn','user','report']}"  @search="search">
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="switchType('cutShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/ArrowsLeftRight.svg" svg-inline /> 切换
                    </div>
                    <div class="u-btn-item" @click="switchType('filtrateShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>

            </template>
        </SuspendCommon>
        <el-drawer :visible.sync="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
                   :modal-append-to-body="false" append-to-body class="p-drawer">
            <!--                体型区域-->
            <div class="m-cut" v-if="cutShow">
                <div class="u-cut-all" :class="{'is-active':showActive==-1}" @click="showActive=-1">全部体型</div>
                <div class="u-cut-box">
                    <div class="u-cut-item" v-for="(item, index) in tabsData" :key="index"
                         :class="{ 'is-active': showActive == item.value }" @click="showActive=item.value">
                        <img class="u-icon" :src="item.icon" svg-inline />
                        <span>{{ item.label }} </span>
                    </div>
                </div>
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="report()">重置</div>
                    <div class="u-confirm-btn" @click="cut()">确定</div>
                </div>
            </div>
            <!--                筛选区域-->
            <div class="m-filtrate" v-if="filtrateShow">
                <div class="u-filtrate-title">体型</div>
                <div class="u-box">
<!--                    <div class="u-item">全部</div>-->
                    <div class="u-item" :class="{ 'active': queryFiltrateParams.body_type == item.value }" v-for="(item, index) in tabsData" :key="index"  @click="filtrateParams('body_type',item.value)">{{ item.label }}</div>
                </div>
                <div class="u-filtrate-title">类型</div>
                <div class="u-box">
                    <div class="u-item all" :class="{'active':!queryFiltrateParams.is_new_face}"  @click="filtrateParams('is_new_face','')">全部</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.is_new_face=='1'}"  @click="filtrateParams('is_new_face','1')">写实</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.is_new_face=='0'}"  @click="filtrateParams('is_new_face','0')">写意</div>
                </div>
                <div class="u-filtrate-title">标签</div>
                <div class="u-box">
                    <div class="u-item all" :class="{'active':!queryFiltrateParams.star && queryFiltrateParams.price_type==''&&!queryFiltrateParams.is_unlimited}"  @click="filtrateParams(['star','price_type','is_unlimited'],'')">全部</div>
                    <div class="u-item" :class="{'active':queryFiltrateParams.star=='1'}"  @click="filtrateParams('star',1,queryFiltrateParams.star=='1')">精选</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.price_type=='0'}"  @click="filtrateParams('price_type','0',queryFiltrateParams.price_type=='0')">免费</div>
                    <div class="u-item" :class="{'active':queryFiltrateParams.is_unlimited=='1'}"  @click="filtrateParams('is_unlimited','1',queryFiltrateParams.is_unlimited=='1')">可新建</div>
                </div>
                <div class="u-filtrate-title">其他</div>
                <div class="u-box">
                    <div class="u-item all" :class="{'active':!queryFiltrateParams.filter_empty_images}"  @click="filtrateParams('filter_empty_images','')">全部</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.filter_empty_images}"  @click="filtrateParams('filter_empty_images','1')">只看捏脸码</div>
                </div>
                <div class="u-btn">
                    <div class="u-report-btn" @click="filtrateReport()">重置</div>
                    <div class="u-confirm-btn" @click="filtrateConfirm()">确定</div>
                </div>
            </div>
        </el-drawer>
        <!--        弹出层区域-->
        <div class="u-content-all" v-if="active == -1">
            <div v-for="(item, index) in allList" :key="index" class="u-content-item">
                <div class="u-card-title">{{ item.label }}</div>
                <div class="u-list">
                    <routine :list="item.list"></routine>
                </div>
            </div>

            <div class="u-card-title">体型特辑</div>
            <div class="u-list body">
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
                <routine gap="0.667rem" size="5.778rem" :isOne="true" :list="list" :total="total"
                         :loadingList="loadingList"
                         v-if="listShow" @getMore="getMore()"></routine>
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
// import PvxSuspension from '@/components/PvxSuspension.vue';
import routine from "@/components/face/mobile/routine.vue";
import habitus from "@/components/face/mobile/habitus.vue";
import faceFind from "@/components/face/mobile/faceFind_v2.vue";
import { cloneDeep, omit, concat, debounce } from "lodash";
import { getFaceList, getSliders } from "@/service/face";

export default {
    name: "listMobile",
    components: { SuspendCommon, routine, habitus },
    data() {
        return {
            loading: false,
            active: -1,
            showActive: -1,//切换弹窗内active，仅在弹窗打开时有效
            tabsData: [
                // { label: "全部", value: -1, client: ["std", "origin"] },
                { label: "成男", value: 1, client: ["std", "origin"],icon:require('@/assets/img/pvxsuspension/man.svg') },
                { label: "成女", value: 2, client: ["std", "origin"],icon:require('@/assets/img/pvxsuspension/woman.svg') },
                { label: "正太", value: 5, client: ["std"],icon:require('@/assets/img/pvxsuspension/boy.svg') },
                { label: "萝莉", value: 6, client: ["std", "origin"],icon:require('@/assets/img/pvxsuspension/girl.svg') },
            ],
            allList: [
                {
                    label: "最新推荐",
                    list: [],
                    params: {
                        star: 1,
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        code_mode: 1,
                        is_personal_newest: 1,
                    },
                },
                {
                    label: "写实派与写意派",
                    list: [],
                    params: {
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        star: 0,
                        is_unlimited: 0,
                        is_personal_newest: 1,
                    },
                },
                {
                    label: "新建角色时推荐",
                    list: [],
                    params: {
                        is_unlimited: 1,
                        pageIndex: 1,
                        pageSize: 12,
                        filter_empty_images: true,
                        star: 0,
                        is_personal_newest: 1,
                    },
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
            isFinish: false,

            showForm: false,
            cutShow: false, //体型切换区域
            filtrateShow: false, //筛选切换区域
            //筛选区域参数，查询时将参数与queryParams合并
            queryFiltrateParams:{
                body_type:-1,
                filter_empty_images: "" ,//是否过滤掉没有图片的捏脸, 0 否，1 是，不填或-1 为全部, 兼容 true=1 false=0
                star: "", //是否推荐,-1或者不传为全部，0为非推荐，1为推荐
                price_type:"", //价格类型，0免费1盒子币2金箔
                is_unlimited:"", //是否可新建
                // is_personal_newest: 1, //小程序获取列表时是否去重作者避免刷屏，可选，默认值0 不去重; 1: 去重
                is_new_face:"", // 0 写意 1 写实
            }
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        // active(val) {
        //     if (val != -1) {
        //         this.queryParams.pageIndex = 1;
        //         this.list = [];
        //         this.listShow = false;
        //         this.loadData();
        //     }
        // },
    },
    mounted() {
        // this.getSliders();
        this.loadData();
    },
    methods: {
        search(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=捏脸&filter_name=pvxface` });
        },
        switchType(type) {
            if (!type) return;
            if (type == "cutShow"|| this.active==-1) {
                this.cutShow = true;
                this.filtrateShow = false;
            } else if (type == "filtrateShow") {
                this.cutShow = false;
                this.filtrateShow = true;
            }
            this.showForm = true;
        },
        // 切换体型时操作
        cut() {
            this.cutShow = false;
            this.active = this.showActive;
            this.isFinish = false;
            this.showForm = false;
            this.queryFiltrateParams.body_type = this.active;
            if (this.active != -1) {
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
        },
        report() {
            this.showActive = -1;
            this.cut();
        },
        //筛选
        filtrateParams(key,value,isActive) {
            // 判断key是否是数组
            if(typeof key == "string"){
                isActive?this.queryFiltrateParams[key] = "":this.queryFiltrateParams[key] = value;
            }else{
                key.forEach((e)=>{
                    this.queryFiltrateParams[e] = value
                })
            }
        },
        //筛选确认
        filtrateConfirm(){
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            this.showForm = false;
            this.loadData();
        },
        //筛选重置,重置其他参数，body_type保持
        filtrateReport(){
            this.queryFiltrateParams={
                ...this.queryFiltrateParams,
                filter_empty_images: "" ,//是否过滤掉没有图片的捏脸, 0 否，1 是，不填或-1 为全部, 兼容 true=1 false=0
                star: "", //是否推荐,-1或者不传为全部，0为非推荐，1为推荐
                price_type:"", //价格类型，0免费1盒子币2金箔
                is_unlimited:"", //是否可新建
                is_new_face:"", // 0 写意 1 写实
            }
        },
        toTab(val) {
            this.active = val.body_type;
            this.isFinish = false;
            if (this.active != -1) {
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
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
                        true,
                    );
                });
            } else {
                this.loadList({ ...this.queryParams, ...this.queryFiltrateParams }, this.active);
            }
        },

        loadList(params, index, body = false) {
            this.loadingList = true;
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
                        if (!list || list.length < params.pageSize) this.isFinish = true;
                        this.list = _list || [];
                        this.queryParams.pageIndex = page.index || 1;
                        this.total = page.total;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loadingList = false;
                    this.loading = false;
                    this.listShow = true;
                });
        },
    },
};
</script>

<style lang="less">
@fontcolor: #1c1c1c;
@fontcolor2: rgba(28, 28, 28, 0.8);
@fontcolor3: rgba(28, 28, 28, 0.4);
@fontColor-dark: #fff;
@fontColor-dark2: rgba(255, 255, 255, 0.8);
@fontColor-dark3: rgba(255, 255, 255, 0.4);
body{
    padding: 0 !important;
}
.m-cut {
    .w(calc(100% - 1.5rem));

    margin: 0 auto;

    .u-cut-all {
        background: rgba(255, 255, 255, 0.10);
        color: @fontColor-dark3;
        .fz(1rem, 1.5rem);
        .bold(700);
        padding: 0.75rem 1rem;
        box-sizing: border-box;
        .r(0.75rem);
        .flex;
        .flex(o);
        .mb(1rem);

        &.is-active {
            background: #FEDAA3;
            color: #24292E;
        }
    }

    .u-cut-box {
        .flex;
        align-content: center;
        justify-content: space-between;
        .mb(1rem);
        gap: 0.75rem;

        .u-cut-item {
            .w(calc(100% / 4));
            .flex;
            .flex(o);
            flex-direction: column;
            background: rgba(255, 255, 255, 0.10);
            padding: 0.75rem;
            box-sizing: border-box;
            .r(0.75rem);
            color: #B0B2B3;

            &.is-active {
                color: #fedaa3;

                svg, path {
                    fill: #fedaa3;
                    stroke: #fedaa3;
                }
            }
        }
    }

    .u-cut-btn {
        .flex;
        .fz(1rem, 1.5rem);
        .bold(700);
        gap: 1.25rem;

        .u-report-btn {
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            flex-shrink: 0;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.10);
            color: @fontColor-dark3;
        }

        .u-confirm-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            .r(0.75rem);
            background: #FEDAA3;
            color: #24292E;
            .x;
        }
    }
}

//筛选切换
.m-filtrate {
    padding: 0.75rem;
    box-sizing: border-box;

    .u-filtrate-title {
        .mb(0.75rem);
        color: rgba(255, 255, 255, 0.60);
    }

    .u-box {
        .flex;
        align-content: center;
        justify-content: space-between;
        .mb(0.75rem);
        gap: 0.5rem;

        .u-item {
            color: #fff;
            .fz(0.875rem, 1.25rem);
            .bold(400);
            background: rgba(255, 255, 255, 0.10);
            .r(0.75rem);
            flex: 1;
            .flex;
            .flex(o);
            padding: 0.5rem;
            box-sizing: border-box;

            &.active {
                color: #24292E;
                background: #FEDAA3;
            }
        }
    }

    .u-btn {
        .flex;
        .fz(1rem, 1.5rem);
        .bold(700);
        gap: 1.25rem;

        .u-report-btn {
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            flex-shrink: 0;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.10);
            color: @fontColor-dark3;
        }

        .u-confirm-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            .r(0.75rem);
            background: #FEDAA3;
            color: #24292E;
            .x;
        }
    }
}

.m-face-list_mobile {
    padding: 1.25rem 0 5.25rem 0;
    box-sizing: border-box;

    .m-base {
        .w(100%);
    }

    .m-suspend-btn {
        .flex;
        align-items: center;

        .u-btn-item {
            .flex;
            .flex(o);
            gap: 0.5rem;
            .w(7.5rem);

            &.line {
                border-right: 0.5px solid rgba(254, 218, 163, 0.2);
            }
        }
    }


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
        padding: 0 1.25rem;
        box-sizing: border-box;
        .mb(0.667rem);
        color: @fontcolor;
        .fz(1rem, 1.556rem);
        .bold(700);
    }
    .u-content-all{
        .u-list{
            &.body{
                padding: 0 1.25rem;
                box-sizing: border-box;
            }
        }
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
