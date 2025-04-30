<template>
    <div class="m-pvx-pet-search">
<!--        搜索条件面板-->
        <div class="u-search">
            <el-collapse v-model="activeNames" accordion>
                <el-collapse-item name="1" title="搜索条件">
<!--                  此处为搜索条件集合界面-->
                    <el-select v-model="params.Class" :class="{ active: params.Class }" class="u-select" clearable filterable>

                        <el-option v-for="item in Type" :key="item.value" :label="item.name" :value="item.class">
                        </el-option>
                        <template #prefix> 类别 </template>
                    </el-select>
                    <el-select v-model="params.mapId" :class="{ active: params.mapId }" class="u-select" clearable filterable>
                        <el-option label="全部地图" value=""></el-option>
                        <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                        <template #prefix> 地图 </template>
                    </el-select>
                    <el-select v-model="params.petSource" :class="{ active: params.petSource }" class="u-select" clearable filterable>
                        <el-option
                            v-for="(item, index) in Source"
                            :key="'laiyuan' + index"
                            :label="item.name"
                            :value="item.source"
                        >
                        </el-option>
                        <template #prefix> 来源 </template>
                    </el-select>
                    <el-input v-model="params.Name" class="input-with-select" placeholder="请输入搜索内容"></el-input>

                    <div class="u-btn">
                        <el-button round size="small" @click="reload">重置</el-button>
                        <el-button round size="small" type="primary" @click="getPetListInit(true)">搜索</el-button>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
<!--        搜索结果内容区域-->
        <div v-if="!showAllList" class="m-pet-list">

            <div v-for="item in list_type" :key="item.type">
                <div class="u-card-title">{{ item.name }}</div>
                <div class="u-list">
                    <div v-for="pet in item.list" :key="pet.id" class="u-item">
                        <a  :href="getPetLink(pet)" >
                            <div class="u-icon-name">
                                <div class="u-icon">
                                    <el-image :src="iconLink(pet.IconID, client)" fit="fit"></el-image>
                                </div>
                                <div class="u-name">
                                    {{ pet.Name }}
                                    <div class="u-rate">
                                        <img
                                            v-for="o in pet.Star"
                                            :key="o"
                                            class="u-star"
                                            src="../../../assets/img/star.svg"
                                            svg-inline
                                        />
                                    </div>
                                </div>
                            </div>
                            <div v-if="pet.Desc" class="u-desc" v-html="renderTextHtml(pet.Desc)"></div>
                        </a>
                    </div>
                </div>
            </div>
        </div>
        <!--        单独分类-->
        <div v-else class="m-pet-list" >
            <div class="u-list u-list-all"  @scroll="handleScroll">
                <div v-for="pet in list" :key="pet.id" class="u-item">
                    <a  :href="getPetLink(pet)" >
                        <div class="u-icon-name">
                            <div class="u-icon">
                                <el-image :src="iconLink(pet.IconID, client)" fit="fit"></el-image>
                            </div>
                            <div class="u-name">
                                {{ pet.Name }}
                                <div class="u-rate">
                                    <img
                                        v-for="o in pet.Star"
                                        :key="o"
                                        class="u-star"
                                        src="../../../assets/img/star.svg"
                                        svg-inline
                                    />
                                </div>
                            </div>
                        </div>
                        <div v-if="pet.Desc" class="u-desc" v-html="renderTextHtml(pet.Desc)"></div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Type from "@/assets/data/pet_type.json";
import Source from "@/assets/data/pet_source.json";
import { getPets, getPetLucky, getSliders, getMapList } from "@/service/pet";
import { extractTextContent, iconLink } from "@jx3box/jx3box-common/js/utils";
import { cloneDeep } from "lodash";
export default {
    components: {
    },
    data() {
        return {
            activeNames: "",
            Type,
            Source,
            tabsData:{},
            list: [],
            finished: false,
            page: 1,

            pages: 1,
            total: 0,
            showAllList:false,
            params:{
                petSource: "",
                mapId: "",
                Name: "",
                Class:'',
            },
            list_type: [
                {
                    class: 1,
                    type: 1,
                    name: "水族",
                    list: [],
                },
                {
                    class: 2,
                    type: 2,
                    name: "禽鸟",
                    list: [],
                },
                {
                    class: 3,
                    type: 3,
                    name: "走兽",
                    list: [],
                },
                {
                    class: 4,
                    type: 4,
                    name: "机关",
                    list: [],
                },],
            mapList:[]
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {

    },
    created() {
        this.getMapList();
        this.getPetListInit()
    },
    mounted() {

    },
    methods: {
        iconLink,
        getPetLink(item) {
            return `/pet/${item.Index}`
        },
        renderTextHtml: function (Text) {
            let result = Text;
            const matches = Text.match(/<Text>(.*?)<\/text>/gims);
            if (!matches) return Text;
            for (let match of matches) {
                let text = extractTextContent(match);
                const html = text[0].text.replace(/\\n/g, "").replace(/\\/g, "");
                result = result.replace(match, html);
            }
            return result;
        },
        reload() {
            this.page = 1;
            this.params={
               petSource: "",
               mapId: "",
               Name: "",
               Class:'',
           }
            this.getPetListInit(true);
        },
        getPetListInit(isClear = false) {
            if(isClear){
                this.activeNames = "";
                this.list = [];
                this.page = 1;
                document.documentElement.scrollTop = 0;
            }
            if (this.params.Class=="") {
                this.showAllList = false;
                this.list_type.forEach((e) => {
                    let params =cloneDeep(this.params);
                    params.per=12
                    params.page=this.page
                    params.Class = e.class;
                    params.Source=params.petSource;
                    this.getPetList(params);
                });
            } else {
                this.showAllList = true
                let params =cloneDeep(this.params);
                params.per=20
                params.page=this.page
                params.Source=params.petSource;
                this.getPetList(params);
            }
        },
        handleScroll(event) {
            const { target } = event;

            if (this.finished ||this.loading) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.page=this.page+1;
                this.getPetListInit();
            }
        },
        // 获取宠物列表
        getPetList: function (params) {
            this.loading = true;
            getPets(params)
                .then((res) => {
                    let newList = res.data.list.filter((item) => {
                        return item.NameFrame || item.Level;
                    });
                    if (this.showAllList ) {
                        this.list = this.list.concat(newList);
                        if(this.list.length==this.total)this.finished=true;
                    } else {

                        //分别赋值
                        const typesMap = {
                            1: () => (this.list_type[0].list = newList || []),
                            2: () => (this.list_type[1].list = newList || []),
                            3: () => (this.list_type[2].list = newList || []),
                            4: () => (this.list_type[3].list = newList || []),
                        };
                        typesMap[params.Class]();
                    }
                    if (this.showAllList ) {
                        this.total = res.data.total;
                        this.pages = res.data.pages;
                    }

                    this.$forceUpdate();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getMapList() {
            getMapList().then((res) => {
                let data = res.data;
                this.mapList = Object.keys(data).map((key, i) => ({ label: data[key], value: key }));
            });
        },
    },
};
</script>

<style lang="less">
@color-light: #1c1c1c;
@bg-light: #f9f9f9;
@color-dark: #ffffff;
.v-miniprogram {
    .m-main {
        padding: 0;
    }
}

.m-pvx-pet-search {
    background-color: #f9f9f9;
    padding:0.75rem 1.1rem;
    box-sizing: border-box;
    height:100vh;
    .u-search{
        position: fixed;
        .lt(0);
        .z(3);
        .w(100vw);
        padding: 0 1.25rem;
        box-sizing: border-box;
        background-color: #fff;
        .el-collapse-item__content{
            background-color: #fff;
        }
        .u-select{
            .mt(0.5rem);
            .flex;
            align-items: center;
            .el-input__inner{
                .pl(36px);
            }
            .el-input__prefix{
                .flex;
                align-items: center;
            }
        }
        .input-with-select{
            .mt(0.5rem);
        }
        .u-btn{
            .flex;
            .flex(o);
            .mt(1rem);
        }
    }
    .m-pet-list {
        .mt(50px);
        .u-card-title {
            .mb(0.5rem);
            color: @color-light;
            .fz(1rem, 1.556rem);
            .bold(700);
        }
        .u-list{
            .flex;
            gap:0.75rem;
            .size(100%,4.625rem);
            overflow:auto;
            box-sizing: border-box;
            .mb(1.25rem);
            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }
            .u-item{
                padding: 0.5rem;
                box-sizing: border-box;
                border-radius: 0.5rem;
                background: #ffffff;
                .size(9.5rem,100%);
                flex-shrink: 0;
                .u-icon-name{
                    .flex;
                    align-items: center;
                    //justify-content: space-between;
                    gap: 0.5rem;
                    .fz(0.875rem, 1.25rem);
                    .bold(700);
                    color: @color-light;
                    .u-icon{
                        .size(2rem);
                    }
                    .u-rate{
                        height: 10px;
                        .flex;
                        align-items: center;
                    }
                    .u-star{
                        width: 10px;
                        height: 10px;
                    }

                }
                .u-desc{
                    color: @color-light;
                    .mt(0.5rem);
                    .fz(0.75rem, 1rem);
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                }


            }
        }
        .u-list-all{
            .mb(0);
            height: calc(calc(100vh - 2.6rem) - 50px);
            overflow: auto;
            flex-wrap: wrap;
            .u-item{
                .w(calc(50% - 0.375rem));
                .h(4.625rem);
            }
        }
    }
}
//@media screen and (width: 390px)
@media (prefers-color-scheme: dark){
    .m-pvx-pet-search {
        background: #000000;
        .u-search{
            background: #282828;
            .el-collapse-item__header,.el-collapse-item__wrap,.el-collapse-item__content{
                background-color: #282828;
                color: #fff;
                border: none;
            }
            .el-collapse{
                border: none;
                .mb(0)
            }
        }
        .m-pet-list{
            .u-card-title{
                color: @color-dark;
            }
            .u-list{
                .u-item{

                }
            }
        }
    }
}
</style>
