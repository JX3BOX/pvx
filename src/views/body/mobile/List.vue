<template>
    <div class="m-body-list_mobile">
        <SuspendCommon :btnOptions="{showHome:true}"
                       :drawerOptions="{hideType:['collect','rss','laterOn','pin','user','report']}"  @search="search" >
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="switchType('cutShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline v-if="showActive==-1"/>
                        <img class="u-icon" src="@/assets/img/pvxsuspension/man.svg" svg-inline v-if="showActive==1"/>
                        <img class="u-icon" src="@/assets/img/pvxsuspension/woman.svg" svg-inline ne v-if="showActive==2"/>
                        <img class="u-icon" src="@/assets/img/pvxsuspension/boy.svg" svg-inline v-if="showActive==5"/>
                        <img class="u-icon" src="@/assets/img/pvxsuspension/girl.svg" svg-inline v-if="showActive==6"/>

                        {{ habitusName }}
                    </div>
                    <div class="u-btn-item" @click="switchType('filtrateShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/filter_disabled_touchbar.svg" svg-inline />
                        筛选
                    </div>
                </div>

            </template>
        </SuspendCommon>
        <el-drawer :visible.sync="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
                   :modal-append-to-body="false" append-to-body class="p-drawer-suspend">
            <!--                体型区域-->
            <transition :name="cutshowTra?'slide-up':''">
                <div class="m-cut" v-if="cutShow">
                    <div class="u-cut-all" :class="{'is-active':showActive==-1}" @click="showActive=-1">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline /> 全部体型
                    </div>
                    <div class="u-cut-box">
                        <div class="u-cut-item" v-for="(item, index) in tabsData" :key="index"
                             :class="{ 'is-active': showActive == item.value }" @click="showActive=item.value">
                            <img class="u-icon" src="@/assets/img/pvxsuspension/man.svg" svg-inline v-if="item.value==1"/>
                            <img class="u-icon" src="@/assets/img/pvxsuspension/woman.svg" svg-inline ne v-if="item.value==2"/>
                            <img class="u-icon" src="@/assets/img/pvxsuspension/boy.svg" svg-inline v-if="item.value==5"/>
                            <img class="u-icon" src="@/assets/img/pvxsuspension/girl.svg" svg-inline v-if="item.value==6"/>

                            <span>{{ item.label }} </span>
                        </div>
                    </div>
                    <div class="u-cut-btn">
                        <div class="u-report-btn" @click="report()">重置</div>
                        <div class="u-confirm-btn" :class="{active:showHighlightConfirm}" @click="cut()">确定</div>
                    </div>
                </div>
            </transition>
            <!--            请先选择体型区域-->
            <div class="m-no-body" v-if="noBody">
                <div class="u-icon">
                    <img src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                    <div class="u-tips">请先选择体型</div>
                </div>
                <div class="u-btn" @click="switchType('selectBody')">选择体型</div>
            </div>

            <!--                筛选区域-->
            <div class="m-filtrate" v-if="filtrateShow">
                <div class="u-filtrate-title">标签</div>
                <div class="u-box">
                    <div class="u-item all" :class="{'active':!queryFiltrateParams.star && queryFiltrateParams.price_type==''&&!queryFiltrateParams.is_unlimited}"  @click="filtrateParams(['star','price_type','is_unlimited'],'')">全部</div>
                    <div class="u-item" :class="{'active':queryFiltrateParams.star=='1'}"  @click="filtrateParams('star',1,queryFiltrateParams.star=='1')">精选</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.price_type=='0'}"  @click="filtrateParams('price_type','0',queryFiltrateParams.price_type=='0')">免费</div>
<!--                    <div class="u-item" :class="{'active':queryFiltrateParams.is_unlimited=='1'}"  @click="filtrateParams('is_unlimited','1',queryFiltrateParams.is_unlimited=='1')">可新建</div>-->
                </div>
                <div class="u-filtrate-title">其他</div>
                <div class="u-box">
                    <div class="u-item all" :class="{'active':!queryFiltrateParams.filter_empty_images}"  @click="filtrateParams(['filter_empty_images','code_mode'],'')">全部</div>
                    <div class="u-item"  :class="{'active':queryFiltrateParams.filter_empty_images}"  @click="filtrateParams('filter_empty_images','1')">只看有图</div>
<!--                    <div class="u-item"  :class="{'active':queryFiltrateParams.code_mode}"  @click="filtrateParams('code_mode','1')">只看捏脸码</div>-->
                </div>
                <div class="u-btn">
                    <div class="u-report-btn" @click="filtrateReport()">重置</div>
                    <div class="u-confirm-btn" :class="{active:showFiltrateConfirm}" @click="filtrateConfirm()">确定</div>
                </div>
            </div>
            <!--            </transition>-->
        </el-drawer>
        <div class="u-content-all" v-if="active == -1">
            <div v-for="(item, index) in allList" :key="index">
                <div class="u-card-title">{{ item.label }}</div>
                <div class="u-list">
                    <routine :list="item.list" type="body"></routine>
                </div>
            </div>

            <div class="u-card-title">体型特辑</div>
            <div class="u-list body">
                <habitus :list="bodyList" @toTab="toTab" type="body"></habitus>
            </div>
        </div>
        <div class="u-content" v-else>
            <div class="u-list " id="oneList">
                <routine gap="0.667rem" size="5.778rem" :isOne="true" :list="list" :total="total" :isFinish="isFinish" v-if="listShow"
                    :loadingList="loadingList" @getMore="getMore" type="body"></routine>
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import routine from "@/components/face/mobile/routine.vue";
import habitus from "@/components/face/mobile/habitus.vue";
import { cloneDeep, concat } from "lodash";
import { getBodyList } from "@/service/body";
import wx from "weixin-js-sdk";
export default {
    components: { routine, habitus,SuspendCommon },
    data() {
        return {
            loading: false,
            active: -1,
            showActive: -1,//切换弹窗内active，仅在弹窗打开时有效
            showHighlightConfirm:false,
            tabsData: [
                { label: "成男", value: 1, client: ["std", "origin"], },
                { label: "成女", value: 2, client: ["std", "origin"] },
                { label: "正太", value: 5, client: ["std"] },
                { label: "萝莉", value: 6, client: ["std", "origin"] },
            ],
            allList: [
                {
                    label: "成男体型",
                    list: [],
                    params: { body_type: 1, pageIndex: 1, pageSize: 12, filter_empty_images: "1" },
                },
                {
                    label: "成女体型",
                    list: [],
                    params: { body_type: 2, pageIndex: 1, pageSize: 12, filter_empty_images: "1" },
                },
                {
                    label: "正太体型",
                    list: [],
                    params: { body_type: 5, pageIndex: 1, pageSize: 12, filter_empty_images: "1" },
                },
                {
                    label: "萝莉体型",
                    list: [],
                    params: { body_type: 6, pageIndex: 1, pageSize: 12, filter_empty_images: "1" },
                },

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
            cutshowTra:false,
            noBody:false,//尚未选择体型的提示区域
            filtrateShow: false, //筛选切换区域
            showFiltrateConfirm:false,
            //筛选区域参数，查询时将参数与queryParams合并
            queryFiltrateParamsBak:{
                // body_type:-1,
                filter_empty_images: "1" ,//是否过滤掉没有图片的捏脸, 0 否，1 是，不填或-1 为全部, 兼容 true=1 false=0
                star: "", //是否推荐,-1或者不传为全部，0为非推荐，1为推荐
                price_type:"", //价格类型，0免费1盒子币2金箔
            },
            queryFiltrateParams:{
                // body_type:-1,
                filter_empty_images: "1" ,//是否过滤掉没有图片的捏脸, 0 否，1 是，不填或-1 为全部, 兼容 true=1 false=0
                star: "", //是否推荐,-1或者不传为全部，0为非推荐，1为推荐
                price_type:"", //价格类型，0免费1盒子币2金箔
            }
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        habitusName() {
            if(this.active==-1) return '体型';
            return this.tabsData.find((e) => e.value == this.active)?.label
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
        showActive(val){
            this.showHighlightConfirm=(val!==this.active)
        },
        queryFiltrateParams:{
            handler(newValue, oldValue) {
                if(JSON.stringify(newValue)==JSON.stringify(this.queryFiltrateParamsBak)){
                    this.showFiltrateConfirm=false
                }else{
                    this.showFiltrateConfirm=true;
                }
            },
            deep: true
        }
    },
    mounted() {
        this.loadData();
    },
    methods: {
        search(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=体型&filter_name=pvxbody` });
        },
        switchType(type) {
            if (!type) return;
            this.cutshowTra=false;
            if (type == "cutShow") {
                this.filtrateShow = false;
                this.noBody=false;
                this.cutShow = true;

            } else if (type == "filtrateShow") {
                if(this.active==-1){
                    this.cutShow=false;
                    this.filtrateShow = false;
                    this.noBody=true;
                }else{
                    this.cutShow = false;
                    this.noBody=false;
                    this.filtrateShow = true;
                    this.queryFiltrateParams=cloneDeep(this.queryFiltrateParamsBak);
                }

            }else if(type=='selectBody'){
                this.cutshowTra=true
                this.cutShow=true;
                this.filtrateShow = false;
                this.noBody=false;
            }
            this.showForm = true;
        },
        // 切换体型时操作
        cut() {
            if(!this.showHighlightConfirm){
                this.showForm = false;
                return;
            }
            this.cutShow = false;
            this.active = this.showActive;
            this.isFinish = false;
            this.showForm = false;
            this.queryParams.body_type = "";
            if (this.active != -1) {
                this.queryParams.body_type = this.active;
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
            // this.switchType('filtrateShow')
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

            if(!this.showFiltrateConfirm){
                this.showForm = false;
                return;
            }
            this.queryFiltrateParamsBak=cloneDeep(this.queryFiltrateParams);
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            this.showForm = false;
            this.isFinish=false
            this.loadData();
        },
        //筛选重置,重置其他参数，body_type保持
        filtrateReport(){
            this.queryFiltrateParams={
                // ...this.queryFiltrateParams,
                filter_empty_images: "1" ,//是否过滤掉没有图片的捏脸, 0 否，1 是，不填或-1 为全部, 兼容 true=1 false=0
                star: "", //是否推荐,-1或者不传为全部，0为非推荐，1为推荐
                price_type:"", //价格类型，0免费1盒子币2金箔
            }
        },
        toTab(val) {
            this.active = val.body_type;
            this.showActive = val.body_type;
            this.isFinish = false;
            this.queryFiltrateParams.body_type = this.active;
            if (this.active != -1) {
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
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
                            pageIndex: 1,
                            pageSize: 1,
                            filter_empty_images: "1",
                        },
                        index,
                        true
                    );
                });
            } else {
                this.loadList({ ...this.queryParams, ...this.queryFiltrateParams }, this.active);
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
                        if (!list || list.length < params.pageSize) this.isFinish = true;
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
        background: rgba(255, 255, 255, 0.05);
        color: @fontColor-dark2;
        .fz(1rem, 1.5rem);
        .bold(700);
        padding: 0.75rem 1rem;
        box-sizing: border-box;
        .r(0.75rem);
        .flex;
        .flex(o);
        .mb(1rem);
        .u-icon{
            .w(1.25rem);
            .mr(0.25rem);
            svg, path {
                fill: @fontColor-dark2;
                stroke: @fontColor-dark2;
            }
        }
        &.is-active {
            background: #FEDAA3;
            color: #24292E;
            svg, path {
                fill: #24292E;
                stroke: #24292E;
            }
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
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
            padding: 0.75rem;
            box-sizing: border-box;
            .r(0.75rem);
            .u-icon{
                svg, path {
                    fill: @fontColor-dark2;
                    stroke: @fontColor-dark2;
                }
            }

            &.is-active {
                color: #24292E;
                background: #FEDAA3;
                svg, path {
                    fill: #24292E;
                    stroke: #24292E;
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
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
        }

        .u-confirm-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark3;
            .x;
            &.active{
                background: #FEDAA3;
                color: #24292E;
            }
        }
    }
}
.m-no-body{
    .flex;
    .flex(o);
    flex-direction: column;
    .u-tips{
        color: @fontColor-dark3;
        .fz(0.875rem,1.25rem);
        .bold(700);
        .flex;
        .flex(o);
    }
    .u-btn{
        .flex;
        .flex(o);
        .mt(1.25rem);
        padding: 0.75rem 1rem;
        gap: 0.5rem;
        align-self: stretch;
        .r(0.75rem);
        background: rgba(255, 255, 255, 0.10);
        color: @fontColor-dark3;
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
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
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
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark2;
        }

        .u-confirm-btn {
            flex: 1;
            padding: 0.75rem 1rem;
            box-sizing: border-box;
            .r(0.75rem);
            background: rgba(255, 255, 255, 0.05);
            color: @fontColor-dark3;
            .x;
            &.active{
                background: #FEDAA3;
                color: #24292E;
            }
        }
    }
}

.m-body-list_mobile {

    padding: .45rem 0 4.45rem 0;
    box-sizing: border-box;
    .h(100vh);
    overflow: auto;
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
            //.w(7.5rem);
            flex:1;
            &.line {
                border-right: 0.5px solid rgba(254, 218, 163, 0.2);
            }
            .u-icon{
                .size(1.25rem, 1.25rem);
                svg, path {
                    fill: #FEDAA3;
                    stroke: #FEDAA3;
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
    .u-content{
        .h(100%);
        .u-list{
            .h(100%);
        }
    }
    .u-content-item {
        .mb(0.556rem);
    }
    // @media screen and (width: 390px)
    @media (prefers-color-scheme: dark) {
        background-color: #000;

        .u-card-title {
            color: @fontColor-dark;
        }
    }

}
</style>
