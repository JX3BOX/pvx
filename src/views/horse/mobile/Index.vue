<template>
    <div class="p-horse_mobile" @scroll="handleScroll">
        <SuspendCommon :btnOptions="{showHome:true}"
                       :drawerOptions="{hideType:['collect','rss','laterOn','pin','user','report']}"  @search="search" >
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="switchType('cutShow')">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                      切换
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
            <!--类型区域-->
            <transition :name="cutShowTra?'slide-up':''" >
                <div class="m-cut" v-show="cutShow">

                    <div class="u-cut-box" >
                        <div class="u-cut-item" :class="{'is-active':listQueryParams.type===''}" @click="cutChange('')">
                            <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline />
                            全部
                        </div>
                        <div class="u-cut-item" v-for="(item, index) in typeList.slice(1)" :key="index"
                             :class="{ 'is-active': listQueryParams.type === item.type }" @click="cutChange(item.type)">
                            <img src="@/assets/img/house/mj.svg" svg-inline v-show="item.type==2"/>
                            <img src="@/assets/img/house/mp.svg" svg-inline v-show="item.type==0"/>
                            <img src="@/assets/img/house/qq.svg" svg-inline v-show="item.type==1"/>
                            {{ item.mobile_label }}
                        </div>
                    </div>
                    <div class="u-cut-btn">
                        <div class="u-report-btn" @click="filtrateReport(1)">重置</div>
                        <div class="u-confirm-btn" :class="{active:paramsIsChange}" @click="cutConfirm()">确定</div>
                    </div>
                </div>
            </transition>
            <!--            请先选择类型区域-->
            <div class="m-no-body" v-show="noActive">
                <div class="u-icon">
                    <img src="@/assets/img/pvxsuspension/report.svg" svg-inline />
                    <div class="u-tips">请先选择类型</div>
                </div>
                <div class="u-btn" @click="switchType('selectBody')">选择类型</div>
            </div>

            <!--                筛选区域-->
            <div class="m-filtrate" v-if="filtrateShow">
                <div v-for="(searchItem,index) in searchType" :key="searchItem.key">
                    <div class="u-filtrate-title">{{ searchItem.name }}</div>
                    <div class="u-box" :class="searchItem.key">
                        <div class="u-item" :class="{'active':searchItem.checked.indexOf(item.label) !==-1}"  @click="filtrateParams(index,item.label)" v-for="item in searchItem.list" :key="item.id">
                            {{ item.label }}</div>
                    </div>
                </div>

                <div class="u-btn">
                    <div class="u-report-btn" @click="filtrateReport()">重置</div>
                    <div class="u-confirm-btn" :class="{active:paramsIsChange}" @click="filtrateConfirm()">确定</div>
                </div>
            </div>
        </el-drawer>
<!--        整体首页部分-->
        <div v-if="!showAll">
    <!--        普通坐骑-->
            <div class="m-title">普通坐骑</div>
            <div class="m-horse-card">
                <div class="u-item" v-for="item in typeList?.[1]?.list" :key="item?.ID" @click="openOther(item,0)">
                    <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />
                    <div class="u-name">
                        <scrollingText :showText="item.Name"/>
                    </div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
    <!--        马具-->
            <div class="m-title">马具</div>
            <div class="m-harness-card">
                <div class="u-harness-item"  v-for="(item) in typeList?.[3]?.list" :key="item?.ID"  @click="openOther(item,2)">
<!--                    <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />-->
                    <item-icon  :item_id="String(item.ItemID)" :isLink="false" :size="38" :onlyIcon="true" ></item-icon>
                    <div class="u-info">
                        <div class="u-name">
                            <scrollingText :showText="item.Name"/>
<!--                            {{ item.Name }}-->
                        </div>
                        <div class="u-id">ID：{{ item.ID }}</div>
                    </div>
                </div>
            </div>
    <!--        奇趣坐骑-->
            <div class="m-title">奇趣坐骑</div>
            <div class="m-horse-card">
                <div class="u-item" v-for="item in typeList?.[2]?.list" :key="item?.ID"  @click="openOther(item,1)">
                    <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />
                    <div class="u-name"><scrollingText :showText="item.Name"/></div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            </div>
        <div class="m-list" v-else>
<!--        坐骑类列表-->
        <div class="m-horse-card" v-if="showHorse">
            <div class="u-item" v-for="item in listData" :key="'list'+item.ID"  @click="openOther(item,listQueryParams.type)">
                <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />
                <div class="u-name">
                    <scrollingText :showText="item.Name"/>
                </div>
                <div class="u-id">ID：{{ item.ID }}</div>
            </div>
            <img src="@/assets/img/empty.png" v-show="!listData.length">
        </div>
<!--        马具列表-->
        <div class="m-harness-card" v-else>
            <div class="u-harness-item"  v-for="item in listData" :key="'list'+item.ID"  @click="openOther(item,1)">
                <item-icon  :item_id="String(item.ItemID)" :isLink="false" :size="38" :onlyIcon="true" ></item-icon>
                <div class="u-info">
                    <div class="u-name"><scrollingText :showText="item.Name"/></div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            <img src="@/assets/img/empty.png"  v-show="!listData.length">
        </div>
        </div>
    </div>
</template>
<script>
import { getHorses, getFeeds, getAttrs } from "@/service/horse";
import { list, searchType, showTypes } from "@/assets/data/horse.json";
import { omit, cloneDeep, concat } from "lodash";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import ItemIcon from "@/components/common/item_icon.vue";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import { __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
import scrollingText from "@/components/horse/mobile/scrollingText.vue";
import { wxNewPage } from "@/utils/minprogram";
import wx from "weixin-js-sdk";
export default {
    name: "HorseHome",
    components: {ItemIcon,SuspendCommon,scrollingText },
    inject: ["__imgRoot", "__imgRoot2"],
    data() {
        return {
            loading: false,
            isFinish:false,
            feeds: [],
            attrs: [],
            typeList: [],
            list,
            searchType,
            showTypes,

            showForm:false, // 是否显示筛选表单
            cutShowTra:false,
            cutShow:false,
            filtrateShow:false,
            noActive:false,
            paramsIsChange:false,
            listQueryParams:{
                per:21,
                page:1,
                type:'',

            },
            showAll:false,
            showHorse:false,//显示坐骑类
            total: 0, //总条目数
            listData:[]
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        list: {
            immediate: true,
            handler: function (_list) {
                let list= cloneDeep(_list);
                this.typeList = list
            },
        },
    },
    created() {
        this.loadInfoData();
        this.loadData();
        this.listQueryParams.client=this.client
    },

    methods: {
        handleScroll(event){
            if(!this.showAll) return;
            const { target } = event;
            if (this.loading || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.listQueryParams.page++;
                let params=cloneDeep(this.listQueryParams)
                params.feed=this.searchType[0].checked.join(',')
                params.attr=this.searchType[1].checked.join(',')
                this.showForm = false;
                this.filtrateShow=false;
                this.loadList(params, 'all');
            }

        },
        iconLink,
        replaceByDefault(e) {
            e.target.src = require("../../../assets/img/horse_item_bg_sm.jpg");
        },
        getImgSrc(item, isAuto = false) {
            // const client = this.client;
            const client = isAuto ? this.client : "std"; // 怀旧服的坐骑图片取正式服的, 没有再根据client获取
            const path = item.ImgPath;
            if (path) {
                let img = path.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
                let name = img?.[1].replace(/\\/g, "/");

                if (img?.[1] == "default") return this.__imgRoot + `homeland/${client}` + "/default/default.png";
                return this.__imgRoot + `homeland/${client}` + name + ".png";
            } else {
                return `${__cdn}/design/horse/${client}/${item.ID}.png`
            }
        },
        openOther(item,type){
            wxNewPage(`/horse/${item.ItemID}?type=${type}`)
        },
        search(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=坐骑&filter_name=pvxhorse` });
        },
        switchType(type){
            if (!type) return;
            this.cutShowTra=false;
            if (type == "cutShow") {
                this.filtrateShow = false;
                this.noActive=false;
                this.cutShow = true;

            } else if (type == "filtrateShow") {
                if(this.listQueryParams.type===''){
                    this.cutShow=false;
                    this.filtrateShow = false;
                    this.noActive=true;
                }else{
                    this.cutShow = false;
                    this.noActive=false;
                    this.filtrateShow = true;
                }

            }else if(type=='selectBody'){
                this.cutShowTra=true
                this.cutShow=true;
                this.filtrateShow = false;
                this.noActive=false;
            }
            this.showForm = true;
        },
        cutChange(type){
            this.paramsIsChange=true
            this.listQueryParams.type=type;
        },
        filtrateParams(index,value){
            this.paramsIsChange=true
          // 如果包含，则执行移除操作，不包含则push进入数组this.searchType[index].checked
            if(this.searchType[index].checked.includes(value)){
                this.searchType[index].checked = this.searchType[index].checked.filter(item => item !== value)
            }else{
                this.searchType[index].checked.push(value)
            }
        },
        cutConfirm(){
            this.listQueryParams.page=1
            this.listData=[]
            this.paramsIsChange=false
            // 将searchTypne内的选中全部置空
            this.searchType.forEach(item => {
                item.checked = []
            })
            let params=cloneDeep(this.listQueryParams)
            params.type !== ''?this.showAll=true:this.showAll=false;
           if(params.type !==''){
               this.showAll=true;
               params.type==2?this.showHorse=false:this.showHorse=true
           }else{
               this.showAll=false;
           }
            this.loadList(params, 'all');
        },
        filtrateConfirm(){
            this.listQueryParams.page=1
            this.listData=[]
            let params=cloneDeep(this.listQueryParams)
            params.feed=this.searchType[0].checked.join(',')
            params.attr=this.searchType[1].checked.join(',')
            this.showForm = false;
            this.filtrateShow=false;
            this.loadList(params, 'all');
        },
        filtrateReport(type){
            if(type){
                this.showAll=false
                this.listQueryParams.type=""
            }
            this.isFinish=false,
            this.paramsIsChange=true
          // 将searchTypne内的选中全部置空
            this.searchType.forEach(item => {
              item.checked = []
            })
           this.filtrateConfirm()
        },
        loadInfoData() {
            getFeeds({ client: this.client }).then((res) => {
                const arr = res.data.map((item) => {
                    const start = item.tip.indexOf("【");
                    const end = item.tip.indexOf("】");
                    item.feed = item.tip.slice(start + 1, end);
                    return item;
                });
                let newArr = [];
                arr.forEach((item) => {
                    const index = newArr.findIndex((nItem) => nItem.feed === item.feed);
                    if (index > -1) {
                        newArr[index].id += "," + item.id;
                    } else {
                        newArr.push(item);
                    }
                });
                this.feeds = newArr.map((item) => {
                    return {
                        label: item.feed,
                        value: item.id,
                    };
                });

                this.searchType[0].list = this.feeds;
            });
            getAttrs({ client: this.client }).then((res) => {
                const data = res.data;
                const options = data.map((item) => {
                    return {
                        label: item.name,
                        value: item.name,
                    };
                });
                this.attrs = options;
                this.searchType[1].list = this.attrs;
            });
        },

        loadData() {

            if (this.listQueryParams.type === "") {
                this.typeList.forEach((item) => {
                    if(item.value != -1){
                        let params={
                            page:1,
                            type:item.type,
                            per:item.type==2?6:9
                        }
                        this.loadList(params, item.type);
                    }
                })
            }
        },
        loadList(params, key) {
            this.loading = true;
            const index = this.typeList.findIndex((e) => e.type === key);
            getHorses(params)
                .then((res) => {
                    const { list, total, pages, page, per } = res.data;

                    if(key!='all'){
                        this.typeList[index].list = list || [];
                        this.typeList[index].page = page || 1;
                        this.typeList[index].pages = pages || 1;
                    }else{
                        this.listData = this.listData.concat(list) || [];
                        this.total = total;
                        if(this.listQueryParams.page==pages) this.isFinish=true;
                    }
                })
                .finally(() => {
                    this.loading = false;
                    this.showForm=false
                });
        },
    }
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
                .w(calc(100% / 3));
                .flex;
                .flex(o);
                flex-direction: column;
                background: rgba(255, 255, 255, 0.05);
                color: @fontColor-dark2;
                padding: 0.75rem;
                box-sizing: border-box;
                .r(0.75rem);
                svg, path {
                    fill: @fontColor-dark2;
                    stroke: @fontColor-dark2;
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
            align-items: center;
            justify-content: space-between;
            .mb(0.75rem);
            gap: 0.5rem;
            flex-wrap: wrap;
            &.attr{

                height: 30vh;
                overflow-y: auto;

            }
            .u-item {
                .w(calc(calc(100% - 1rem) / 3));
                flex-shrink: 0;
                color: #fff;
                .fz(0.875rem, 1.25rem);
                .bold(400);
                background: rgba(255, 255, 255, 0.05);
                color: @fontColor-dark2;
                .r(0.75rem);

                .flex;
                .flex(o);
                padding: 0.5rem;
                box-sizing: border-box;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                //border: 1px solid #000;
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
}

.p-horse_mobile{
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
    .m-title{
        color: @fontColor;
        .fz(1rem,1.5rem);
        .bold(700);
        .mb(0.5rem);
    }
    .m-horse-card{
        .flex;
        gap:0.75rem;
        flex-wrap: wrap;
        .mb(1.5rem);
        .u-item{
            padding: 0.5rem;
            box-sizing: border-box;
            .w(calc(calc(100% - 1.5rem) / 3));
            .flex;
            flex-direction: column;
            //.flex(o);
            background: #fff;
            .r(0.25rem);
            .u-img{
                .w(100%);
                border-radius: 0.25rem;
                background: #AAA;
                .mb(0.5rem);
                border: 1px solid #ff2dff;
            }
            .u-name{
                color: @fontColor;
                .fz(0.875rem,1.25rem);
                .bold(700);
                font-style: normal;
            }
            .u-id{
                color: @fontColor40;
                .fz(0.625rem,0.938rem);
                font-style: normal;
                .bold(400);
            }
        }
    }
    .m-harness-card{
        .flex;
        gap:0.75rem;
        flex-wrap: wrap;
        .mb(1.5rem);
        .u-harness-item{
            padding: 0.5rem;
            box-sizing: border-box;
            .w(calc(calc(100% - 0.75rem) / 2));
            .flex;
            gap:0.5rem;
            .flex(o);
            background: #fff;
            .r(0.25rem);
            .u-info{
                .w(calc(calc(100% - 38px) - 0.5rem));
                .flex;
                flex-direction:column;
                justify-content: center;
            }
            .u-name{
                color: @fontColor;
                .fz(0.875rem,1.25rem);
                .bold(700);
                font-style: normal;
                .w(100%);
                overflow: hidden;
                white-space: nowrap;
            }
            .u-id{
                .mt(0.25rem);
                color: @fontColor40;
                .fz(0.625rem,0.938rem);
                font-style: normal;
                .bold(400);
            }
        }
    }
}

//@media screen and (width: 414px)
@media (prefers-color-scheme: dark)
{
    .p-horse_mobile{
        background-color: #000;
        .m-title{
            color:@fontColor-dark2;
        }
        .m-horse-card{
            .u-item{
                background: #282828;
                .u-name{
                    color:@fontColor-dark2;
                }
                .u-id{
                    color:@fontColor-dark3;
                }
            }
        }
        .m-harness-card{
            .u-harness-item{
                background: #282828;
                .u-name{
                    color:@fontColor-dark2;
                }
                .u-id{
                    color:@fontColor-dark3;
                }

            }
        }
    }
}

</style>
