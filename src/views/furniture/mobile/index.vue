<template>
    <div class="p-furniture_mobile" ref="furnitureRef" @scroll="handleScroll">
        <SuspendCommon :btnOptions="{showHome:true}"
                       :drawerOptions="{hideType:['collect','rss','laterOn','pin','user','report','search']}" >
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="showForm=true">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ switchTitle}}
                    </div>
                </div>

            </template>
        </SuspendCommon>
        <el-drawer :visible.sync="showForm" direction="btt" :with-header="false" custom-class="u-drawer"
                   :modal-append-to-body="false" append-to-body class="p-drawer-suspend">
            <!--                筛选区域-->
            <div class="m-filtrate">
                <div class="u-filtrate-content">
                <div class="u-filtrate-title">类型</div>
                <div class="u-box">
                    <div class="u-item top" :class="{active:queryType==1}" @click="queryType=1">庐园广记</div>
                    <div class="u-item top" :class="{active:queryType==2}" @click="queryType=2">家具</div>
                </div>
<!--                庐园广记分类-->
                <div v-if="queryType===1">
                    <div class="u-filtrate-title">分类</div>
                    <div class="u-box" >
                        <div class="u-item" :class="{'active':item.nDlcID==version}"  v-for="(item,index) in versions" :key="index" @click="versionChange(item.nDlcID)">
                            {{ item.name?.split('(')?.[0] }}</div>
                    </div>
                </div>
<!--                家具分类-->
                <div v-else>
                    <div v-for="(item,index) in searchProps" :key="index">
                        <div class="u-filtrate-title">{{ item.name }}</div>
                        <div class="u-box" >
                            <div class="u-item" :class="{'active':getActiveStatus(item,item2)}"  v-for="(item2,index2) in item.options" :key="index2" @click="setSearchParams(item.key=='nCatag1Index'?item.key:item2.paramsKey,item2)">
                                {{ item.key=='nCatag1Index'?item2.name:item2.value }}</div>
                        </div>
<!--                        如果是分类显示次级分类-->
                        <template v-if="item.key=='nCatag1Index'">
                            <div class="u-filtrate-title">次级分类</div>
                            <div class="u-box" >
                                <div class="u-item" :class="{active:queryParams.nCatag2Index==item2.nCatag2Index}" v-for="(item2,index2) in item.options[Number(queryParams.nCatag1Index)- 1]?.children||[]" :key="index2" @click="setSearchParams('nCatag2Index',item2)">
                                    {{ item2.szName }}</div>
                            </div>
                        </template>
                    </div>

                </div>
                </div>
                <div class="u-btn">
                    <div class="u-report-btn" @click="reloadQuery">重置</div>
                    <div class="u-confirm-btn" :class="{active:confirmBtn}" @click="submitBtn">确定</div>
                </div>
            </div>
        </el-drawer>
        <!--        整体首页部分-->
        <div v-if="queryType_bak==1">
            <div v-for="item in setList" :key="item.dwSetID">
                <div class="m-title">{{ item.szName }}</div>
                <div class="m-horse-card">
                    <div class="u-item" v-for="item2 in item.furnitures" :key="item2?.dwID" @click="openOther(item2)">
                        <img :src="formatImg(item2.Path)" class="u-img" />
                        <div class="u-name">
                            {{item2.szName}}
                        </div>
                        <div class="u-id">{{ getType(item2) }}</div>
                    </div>
                </div>
            </div>

        </div>
        <div class="m-list" v-else>
            <div class="m-horse-card">
                <div class="u-item" v-for="item in list" :key="'list'+item.ID"  @click="openOther(item2)">
                    <img :src="formatImg(item.Path)"   class="u-img" />
                    <div class="u-name">
                        {{item.szName}}
                    </div>
                    <div class="u-id">{{ getType(item) }}</div>
                </div>
                <img src="@/assets/img/empty.png" v-show="!list.length">
            </div>
        </div>
    </div>
</template>
<script>

import { getFurnitureCategory, getFurnitureMatch } from "@/service/homeland.js";
import { getFurniture, getFurnitureSet } from "@/service/furniture.js";
import { sourceList, levelList, categoryList, categoryCss } from "@/assets/data/furniture.json";
import { deleteNull } from "@/utils/index";
import dayjs from "@/plugins/day";
import { omit, cloneDeep, concat } from "lodash";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import { wxNewPage } from "@/utils/minprogram";

export default {
    name: "HorseHome",
    components: {SuspendCommon },
    inject: ["__imgRoot"],
    data() {
        return {
            loading: false,
            isFinish:false,
            showAll: false, // 是否显示全部
            switchTitle:"庐园广记(横刀断浪)",
            showForm:false, // 是否显示搜索表单
            confirmBtn:false,
            categoryObj: {},
            category: [],
            childCategory: [],
            furniture:[],
            list:[],

            //家具查询
            queryParams:{
                page: 1,
                per: 21,
                pages: 0,
                total: 0,
                nCatag1Index:1, //分类
                szSource:"", //来源途径，传值是文字
                LevelLimit:"", //家园等级
                bInteract:null, //🉑交互
                isSet:null, //庐园广记
                isMatch:null, //园宅会赛
                Attribute1:null,//观赏
                Attribute2:null,//实用
                Attribute3:null,//坚固
                Attribute4:null,//风水
                Attribute5:null,//趣味

            },
            setList:[],
            searchProps: [
                {
                    key: "nCatag1Index",
                    name: "分类",
                    options: [],
                },
                // {
                //     key: "Attribute",
                //     name: "家具属性",
                //     options: categoryList.map((item) => {
                //         return {
                //             key: item.key,
                //             value: item.name,
                //             paramsKey:'Attribute'+item.key
                //         };
                //     }),
                // },
                {
                    key: "szSource",
                    name: "来源途径",
                    options: sourceList.map((item) => {
                        return {
                            key: item.name === "全部" ? "" : item.name,
                            value: item.name,
                            paramsKey:'szSource'
                        };
                    }),
                },
                {
                    key: "LevelLimit",
                    name: "家园等级",
                    options: levelList.map((item) => {
                        return {
                            key: item.level,
                            value: item.name,
                            paramsKey:'LevelLimit'
                        };
                    }),
                },
                {
                    key: "other",
                    name: "其它",
                    options: [
                        {
                            key: "1",
                            value: "可交互",
                            paramsKey:'bInteract'
                        },
                        {
                            key: "1",
                            value: "庐园广记",
                            paramsKey:'isSet'
                        },
                        {
                            key: "1",
                            value: "园宅会赛",
                            paramsKey:'isMatch'
                        },
                    ],
                },
            ],
            versions: [
                {
                    name: "横刀断浪(120级)",
                    nDlcID: 7,
                },
                {
                    name: "奉天证道(110级)",
                    nDlcID: 6,
                },
                {
                    name: "世外蓬莱(100级)",
                    nDlcID: 5,
                },
            ],
            version: 7,
            queryType:1, //1 version  2 家具
            queryType_bak:1
        };
    },
    filters: {
        formatMatchFurniture(val) {
            return val.replace("+", "");
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        queryType:{
            handler:function(val){

            }
        },
        queryParams:{
            handler:function(val){
               this.confirmBtn=true
            }
        }
        // list: {
        //     immediate: true,
        //     handler: function (_list) {
        //         let list= cloneDeep(_list);
        //         this.typeList = list
        //     },
        // },
    },
    created() {
        this.getFurnitureSet();
        this.getCategory();
        this.loadFurniture();
    },

    methods: {
        // 加载更多处理
        handleScroll(event){
            if(this.queryType_bak==1) return;
            const { target } = event;
            if (this.loading || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.queryParams.page++;
                let params=cloneDeep(this.queryParams)
                this.showForm = false;
                this.getData()
            }

        },
        formatImg(link) {
            if (!link) return;
            let img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
            let name = img?.[1].replace(/\\/g, "/");

            if (img?.[1] == "default") return this.__imgRoot + `homeland/${this.client}` + "/default/default.png";
            return this.__imgRoot + `homeland/${this.client}` + name + ".png";
        },
        openOther(item){
            wxNewPage(`/furniture/${item.dwID}`)
        },
        getActiveStatus(item,item_c){
            if(item.key=='nCatag1Index'){

                return item_c.id==this.queryParams[item.key]
            }

            return  item_c.key==this.queryParams[item_c.paramsKey]
        },
        setSearchParams(key,item2){
            if(key=='nCatag1Index'){
                this.queryParams[key]=item2.id;
                return;
            }
            this.queryParams[key]=item2[key];
        },
        versionChange(value){
            this.version=value;
            // this.getFurnitureSet();
        },
        reloadQuery(){
            this.queryType=cloneDeep(this.queryType_bak)
            this.showForm=false

            if(this.queryType==1){

                this.version=7
                this.switchTitle="庐园广记(横刀断浪)"
                this.getFurnitureSet()
            }else{
                this.list = [];
                this.queryParams={
                    page: 1,
                    per: 21,
                    pages: 0,
                    total: 0,
                    nCatag1Index:1, //分类
                    szSource:"", //来源途径，传值是文字
                    LevelLimit:"", //家园等级
                    bInteract:null, //🉑交互
                    isSet:null, //庐园广记
                    isMatch:null, //园宅会赛
                }
                let name= this.categoryObj[this.queryParams.nCatag1Index]?.name
                this.switchTitle=`家具(${name})`
                this.getData()
            }
        },
        submitBtn(){
            this.showForm=false;
            this.list = [];
            this.queryType_bak=cloneDeep(this.queryType)
            if(this.queryType==1){
                //根据version查询name
                let name= this.versions.find(item=>item.nDlcID==this.version)?.name
                this.switchTitle=`庐园广记(${name?.split('(')?.[0]})`
                this.getFurnitureSet()
            }else{
                //根据nCatag1Index查询分类名字
                let name= this.categoryObj[this.queryParams.nCatag1Index]?.name
                this.switchTitle=`家具(${name})`
                this.getData()
            }

        },
        getFurnitureSet() {
            this.loading = true;
            this.list = [];
            this.queryParams={
                page: 1,
                per: 21,
                pages: 0,
                total: 0,
                nCatag1Index:1, //分类
                szSource:"", //来源途径，传值是文字
                LevelLimit:"", //家园等级
                bInteract:null, //🉑交互
                isSet:null, //庐园广记
                isMatch:null, //园宅会赛
            }
            const cache = sessionStorage.getItem(`FurnitureSet_${this.version}`);
            if (cache) {
                this.loading = false;

                this.setList = JSON.parse(cache);
                this.$nextTick(()=>{
                    this.$refs.furnitureRef.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                })
            } else {

                getFurnitureSet({ nDlcID: this.version, details: 1 })
                    .then((res) => {
                        const list = res?.data || [];
                        this.setList = list;
                        sessionStorage.setItem(`FurnitureSet_${this.version}`, JSON.stringify(list));
                    })
                    .finally(() => {
                        this.loading = false;
                        this.$nextTick(()=>{
                            this.$refs.furnitureRef.scrollTo({
                                top: 0,
                                behavior: 'smooth'
                            });
                        })
                    });
            }
        },
        getType(data) {
            const Category1 = data.nCatag1Index;
            const Category2 = data.nCatag2Index;
            const name1 = this.categoryObj[Category1]?.name || "";
            let name2 = "";
            if (name1) {
                const list = this.categoryObj[Category1]?.children || [];
                name2 = list.find((item) => ~~item.nCatag2Index === Category2)?.szName || "";
            }
            return name1 + "-" + name2;
        },
        getCategory() {
            getFurnitureCategory().then((res) => {
                this.categoryObj = res?.data || {};
                const list = Object.values(res?.data || {});
                this.category = list.map((item) => {
                    return {
                        type: item.id,
                        ...item,
                    };
                });
                this.searchProps[0].options = this.category;
                //
                // if (this.initValue.nCatag1Index) {
                //     const category = this.category.find((item) => item.id === this.initValue.nCatag1Index);
                //     const children = category?.children || [];
                //     this.childCategory = children;
                // }
            });
        },
        getData() {
            const params = deleteNull(this.queryParams);
            this.loading = true;
            getFurniture(params)
                .then((res) => {

                    this.list = this.list.concat(res.data.list);
                    this.queryParams.total = res.data.total;
                    this.queryParams.pages = res.data.pages;

                })
                .finally(() => {
                    this.loading = false;
                    this.$nextTick(()=>{
                        this.$refs.furnitureRef.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    })
                });
        },
        setFurniture(res) {
            let data = res.data.data.filter((item) => item);

            try {
                this.furniture = data;
            } catch (e) {
                this.furniture = [];
            }
        },
        // 园宅会赛
        loadFurniture() {
            try {
                let furniture = sessionStorage.getItem("furniture");

                furniture = furniture && JSON.parse(furniture);

                if (furniture) {
                    this.setFurniture(furniture);
                } else {
                    const params = {
                        subtypes: "category,property,next_match",
                        start: dayjs.tz().startOf("isoWeek").format("YYYY-MM-DD"),
                        end: dayjs.tz().endOf("isoWeek").format("YYYY-MM-DD"),
                    };
                    getFurnitureMatch(params).then((res) => {
                        this.setFurniture(res);

                        res.data?.data?.length && sessionStorage.setItem("furniture", JSON.stringify(res));
                    });
                }
            } catch (e) {
                console.error(e);
                this.furniture = [];
            }
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

    //筛选切换
   .m-filtrate {
        padding: 0.75rem;
        box-sizing: border-box;
       .u-filtrate-content{
           height: 40vh;
           overflow-y: auto;
       }
        .u-filtrate-title {
            .mb(0.75rem);
            color: rgba(255, 255, 255, 0.60);
        }

        .u-box {
            .flex;
            align-items: center;
            //justify-content: space-between;
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
                &.top{
                    .w(calc(calc(100% - 1rem) / 2));
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

.p-furniture_mobile{
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
            .w(calc(calc(100vw - 4.5rem) / 3));
            .flex;
            flex-direction: column;
            //.flex(o);
            background: #fff;
            .r(0.25rem);
            .u-img{
                .w(100%);
                .h(calc(calc(calc(100vw - 4.5rem) / 3) - 1rem));
                border-radius: 0.25rem;

                .mb(0.5rem);
                border: 1px solid #ff2dff;
                background-image: url("../../../assets/img/horse_item_bg_sm.jpg");
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
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
