<!---
 * @Author: ymg
 * @Date: 2025-08-20 08:58:08
 * @Description: 小程序书籍
 -->

<template>
    <div class="p-mobile-book" ref="bookRef" @scroll="handleScroll">
        <SuspendCommon :btnOptions="{showHome:true}"
                       :drawerOptions="{hideType:['collect','rss','laterOn','pin','user','report','search']}" >
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="switchClick">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ switchTitle}}
                    </div>
                    <div class="u-btn-item line" @click="searchClick">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/search.svg" svg-inline />
                       搜索
                    </div>
                </div>

            </template>
        </SuspendCommon>
        <el-drawer :visible.sync="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
                   :modal-append-to-body="false" append-to-body class="p-drawer-suspend">
            <div class="m-cut" >
                <div class="u-cut-all" :class="{'is-active':showActive==-1}" @click="showActive=-1">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline /> 全部书籍
                </div>
                <div class="u-cut-box">
                    <div class="u-cut-item" v-for="(item, index) in tabs" :key="index"
                         :class="{ 'is-active': showActive == item.id }" @click="showActive=item.id">
                        <img class="u-icon" src="@/assets/img/book/zj.svg" svg-inline v-if="item.id==11"/>
                        <img class="u-icon" src="@/assets/img/book/dj.svg" svg-inline v-if="item.id==10"/>
                        <img class="u-icon" src="@/assets/img/book/fx.svg" svg-inline v-if="item.id==9"/>

                        <span>{{ item.label }} </span>
                    </div>
                </div>
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="report()">重置</div>
                    <div class="u-confirm-btn" :class="{active:showHighlightConfirm}" @click="cut()">确定</div>
                </div>
            </div>
        </el-drawer>
        <div class="m-list" v-if="active===-1">
            <div class="u-item" v-for="(item,index) in allList" :key="index">
                <div class="m-title">
                    {{item.label}}
                </div>
                <div class="u-list" >
                    <div class="u-book-item" v-for="(item2,index2) in item.list" :key="'book'+index2" @click="openOther(item2)">
                        <div class="u-cover">
                            <div class="u-book-name">
                                <div class="u-text">
                                   <div class="u-name-vertical"  :class="{scroll:item2.Name.length>5}">
                                       {{item2.Name}}
                                   </div>
                                </div>
                            </div>
                            <div class="u-book-line">
                                <img src="../../../assets/img/book/line.png"/>
                            </div>
                        </div>
                        <div class="u-name"> {{item2.Name}}</div>
                        <div class="u-desc">{{item2.Desc}}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="m-list" v-else>
            <div class="u-item" >
                <div class="u-list">
                    <div class="u-book-item" v-for="(item2,index) in list" :key="index" @click="openOther(item2)">
                        <div class="u-cover">
                            <div class="u-book-name">
                                <div class="u-text">
                                    <div class="u-name-vertical"  :class="{scroll:item2.Name.length>5}">
                                        {{item2.Name}}
                                    </div>
                                </div>
                            </div>
                            <div class="u-book-line">
                                <img src="../../../assets/img/book/line.png"/>
                            </div>
                        </div>
                        <div class="u-name"> {{item2.Name}}</div>
                        <div class="u-desc">{{item2.Desc}}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import { omit, cloneDeep, concat } from "lodash";
import { getList } from "@/service/book";
import wx from "weixin-js-sdk";
import { wxNewPage } from "@/utils/minprogram";

export default {
    name: "Index",
    components: { SuspendCommon},
    data() {
        return {
            loading: false,
            tabs:[
                {id:11,label:'杂集'},
                {id:10,label:'道学'},
                {id:9,label:'佛学'},
            ],
            allList: [
                {
                    label: "杂集",
                    total: 0,
                    list: [],
                    params:{
                        page:1,per:6,profession:11
                    }
                },
                {
                    label: "道学",
                    total: 0,
                    list: [],
                    params:{
                        page:1,per:6,profession:10
                    }
                },
                {

                    label: "佛学",
                    total: 0,
                    list: [],
                    params:{
                        page:1,per:6,profession:9
                    }
                },
            ],


            active: -1,
            showActive: -1,//切换弹窗内active，仅在弹窗打开时有效
            showHighlightConfirm:false,
            switchTitle:'分类',
            showForm:false,
            cutShow:false,
            isFinish:false,
            list:[],
            queryParams: {
                page:1,per:15
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        showActive(val){
            this.showHighlightConfirm=(val!==this.active)
        },
    },
    methods: {
        openOther(item){
            console.log(item)
            wxNewPage(`/book/${item.idKey}`)
        },
        // 加载更多处理
        handleScroll(event){
            if(this.active==-1) return;
            const { target } = event;
            if (this.loading || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.queryParams.page++;

                this.showForm = false;
                this.loadData()
            }

        },
        switchClick(){
            this.showForm=true
        },
        searchClick(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=书籍大全&filter_name=pvxbook` });
        },
        // 切换书籍时操作
        cut() {
            if(!this.showHighlightConfirm){
                this.showForm = false;
                return;
            }
            this.cutShow = false;
            this.active = this.showActive;
            this.isFinish = false;
            this.showForm = false;
            this.queryParams.profession = "";
            if (this.active != -1) {
                this.queryParams.profession = this.active;
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
            let info=this.tabs.filter(e=>e.id==this.active)[0]
            info.label?this.switchTitle=info.label:'分类'
            // this.switchType('filtrateShow')
        },
        report() {
            this.showActive = -1;
            this.cut();
        },
        loadData() {
            this.loading = true;
            if (this.active === -1) {
                this.allList.forEach((e, index) => {
                    this.loadList({ client: this.client, ...e.params }, index);
                });
            } else {
                this.loadList(this.queryParams);
            }
        },
        // 加载type对应的数据
        loadList(params,index) {
            if (this.isFinish) return;
            getList(params)
                .then((res) => {
                    const { list, page } = res.data;
                    const _list = this.active != -1 ? concat(this.list, list || []) : list;

                    if (this.active !== -1) {
                        if (!list || list.length < params.per) this.isFinish = true;
                        this.list = _list || [];
                        this.queryParams.page = page.index || 1;

                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
    },
    mounted: function () {
       this.loadData()
    },
};
</script>

<style lang="less">
@fontColor:rgba(28, 28, 28, 0.80);
@fontColor40: rgba(28, 28, 28, 0.40);
@fontColor-dark2: rgba(255, 255, 255, 0.8);
@fontColor-dark3: rgba(255, 255, 255, 0.4);

.v-miniprogram{
    .m-main{
        padding: 0;
    }
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
                .w(calc(100% / 3));
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
}

.p-mobile-book{
    background: #FAFAFA;
    height: 100vh;
    padding: .45rem 1.25rem 4.45rem 1.25rem;
    box-sizing: border-box;
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
    .m-title {
        color: @fontColor;
        .fz(1rem,1.5rem);
        .bold(700);
        .mb(0.5rem);
    }
    .m-list{
        .u-item{
            .mb(0.75rem)
        }
        .u-list{
            .flex;
            flex-wrap: wrap;
            gap:0.75rem;

            .u-book-item{
                .w(calc(calc(100% - 1.5rem) / 3));
                flex-shrink: 0;
                .u-name{
                    color: @fontColor;
                    .fz(0.875rem,1.25rem);
                    .bold(700);
                    font-style: normal;
                    .mt(0.5rem);
                }
                .u-desc{
                    color: @fontColor40;
                    .fz(0.625rem,0.938rem);
                    font-style: normal;
                    .bold(400);
                }
                .u-cover{
                    border-radius: 4px;
                    background: #324148;
                    overflow: hidden;
                    .pr;
                    .w(100%);
                    aspect-ratio: 312/335;

                }
                .u-book-name{
                    background: url("../../../assets/img/book/title.png") center center no-repeat;
                    background-size: contain;
                    margin: 0.5rem;
                    height: calc(100% - 1rem);
                    padding: 0.5rem;
                    box-sizing: border-box;
                    overflow: hidden;
                    .dbi;
                    .u-text{
                        .h(100%);
                        overflow: hidden;
                       .u-name-vertical{
                           .fz(0.875rem);
                           .bold(600);

                           color:#000;
                           writing-mode: vertical-lr;
                           text-orientation: upright;
                           white-space: nowrap;
                           position: relative;
                           word-break: break-all;
                           .flex;
                           align-items: center;
                           justify-content: center;
                           &.scroll{

                               /* 动画设置 */
                               animation: verticalScroll 10s ease-in-out infinite;
                           }
                       }

                    }
                    @keyframes verticalScroll {
                        0% {
                            transform: translateY(0);
                        }
                        50% {
                            transform: translateY(-100%);
                        }
                        100% {
                            transform: translateY(0);
                        }
                    }
                }
                .u-book-line{
                    .h(100%);
                    .pa;
                    .rt(0);
                    img{
                        .h(100%);
                        object-fit: contain;
                    }
                }
            }
        }
    }
}
@media (prefers-color-scheme: dark){
    .p-mobile-book{
        background-color: #000;
        .m-title{
            color:@fontColor-dark2;
        }
        .u-item{
            .u-list{
                .u-book-item{
                    .u-name{
                        color:@fontColor-dark3;
                    }
                    .u-desc{
                        color:@fontColor-dark2 ;
                    }
                }

            }
        }
    }
}
</style>
