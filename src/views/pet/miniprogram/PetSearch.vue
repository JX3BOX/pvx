<template>
    <div class="m-pvx-pet-search">
<!--        搜索条件面板-->
        <div class="u-search">
            <el-collapse v-model="activeNames" accordion>
                <el-collapse-item name="1" title="搜索条件">
<!--                  此处为搜索条件集合界面-->
                    <el-select v-model="params.Class" :class="{ 'is-active': params.Class }" class="u-select" clearable filterable>

                        <el-option v-for="item in Type" :key="item.class" :label="item.name" :value="item.class">
                        </el-option>
                        <template #prefix> 类别 </template>
                    </el-select>
                    <el-select v-model="params.mapId" :class="{ 'is-active': params.mapId }" class="u-select" clearable filterable>
                        <el-option label="全部" value=""></el-option>
                        <el-option v-for="item in mapList" :key="item.value" :label="item.label" :value="item.value">
                        </el-option>
                        <template #prefix> 地图 </template>
                    </el-select>
                    <el-select v-model="params.petSource" :class="{ 'is-active': params.petSource }" class="u-select" clearable filterable>
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
        <div v-if="!showAllList" class="m-pvx-pet-list">

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
                                            src="../../../assets/img/common/star.svg"
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
        <div v-else class="m-pvx-pet-list" >
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
                                        src="../../../assets/img/common/star.svg"
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
import { getPets, getPetSearchOptions, getMapList } from "@/service/pet";
import { extractTextContent, iconLink } from "@jx3box/jx3box-common/js/utils";
import { cloneDeep } from "lodash";
export default {
    components: {
    },
    data() {
        return {
            activeNames: "",
            Type: [],
            Source: [],
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
            list_type: [],
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
        this.getPetSearchOptions();
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
            this.finished = false;
            this.total = 0;
            this.getPetListInit(true);
        },
        getPetSearchOptions() {
            getPetSearchOptions()
                .then((res) => {
                    const data = Array.isArray(res.data) ? res.data : [];
                    const typeOptions = data
                        .filter((item) => item.Type === 1 && item.TypeName)
                        .map((item) => ({
                            class: item.ID,
                            type: item.ID,
                            name: item.TypeName,
                        }));
                    const sourceOptions = data
                        .filter((item) => item.Type === 2 && item.TypeName)
                        .map((item) => ({
                            source: item.ID,
                            name: item.TypeName,
                        }));

                    this.Type = [{ class: "", type: 0, name: "所有种类" }, ...typeOptions];
                    this.Source = [{ source: "", name: "所有途径" }, ...sourceOptions];
                    this.list_type = typeOptions.map((item) => ({
                        ...item,
                        list: [],
                    }));
                })
                .catch((err) => {
                    console.error("获取宠物筛选项失败", err);
                })
                .finally(() => {
                    this.getPetListInit();
                });
        },
        getPetListInit(isClear = false) {
            if(isClear){
                this.activeNames = "";
                this.list = [];
                this.page = 1;
                this.finished = false;
                this.total = 0;
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

                        const typeIndex = this.list_type.findIndex((item) => item.class === params.Class);
                        if (typeIndex !== -1) {
                            this.list_type[typeIndex].list = newList || [];
                        }
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
@import "~@/assets/css/pet/miniprogram/search.less";
</style>
