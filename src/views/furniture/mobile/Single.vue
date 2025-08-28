<template>
    <div class="p-furniture-single_mobile">
        <SuspendCommon
            :btnOptions="{showHome:true}"
            :drawerOptions="{
            hideType:['report','rss','search','user','collect'],
            title: data.szName,
            postType:'furniture',
            id:id
            }"
            v-if="$route.query?.disabled!='true'"
            class="u-horse-common"
        >
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="doFav">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/collect_active.svg" svg-inline v-if="favorite" />
                        <img class="u-icon" src="@/assets/img/pvxsuspension/collect.svg" svg-inline v-else />

                       收藏
                    </div>
                </div>

            </template>
        </SuspendCommon>
        <div class="m-info-main">
            <div class="u-top-box">

                <div class="u-name"> {{ data.szName }}</div>
                <div class="u-img">
                    <img :src="formatImg(data.Path)" class="u-image" />
                </div>
            </div>
            <!--        其他-->
            <div class="m-box m-other">
                <div class="u-item">
                    <div class="u-title">来源途径</div>
                    <div class="u-text">{{ data.szSource  }}</div>
                </div>
                <div class="u-item" v-if="data.LevelLimit">
                    <div class="u-title">摆放等级</div>
                    <div class="u-text">{{ data.LevelLimit  }}</div>
                </div>
                <div class="u-item" v-if="data.MaxAmountPerLand">
                    <div class="u-title">摆放上限</div>
                    <div class="u-text">{{ data.MaxAmountPerLand }}</div>
                </div>
                <div class="u-item"  v-if="data.szScaleRange">
                    <div class="u-title">缩放大小</div>
                    <div class="u-text">
                        <b v-for="(item, index) in scaleRange(data.szScaleRange)" :key="index">{{ item }}</b>
                    </div>
                </div>
                <div class="u-item" v-if="color_list.length">
                    <div class="u-title">染色选项</div>
                    <div class="u-color">
                        <div class="u-value" v-for="item in color_list"
                             :key="item"
                             :style="{ backgroundColor: `rgb(${item})` }">
                        </div>
                    </div>
                </div>

            </div>
        </div>
        <!--        其他列表-->
        <div class="m-same-horses"   v-if="has_extend && setData">
            <div class="m-title">套组 · {{ setData.szName }}</div>
            <div class="m-horse-card">
                <div class="u-item" v-for="item in other_list" :key="item?.ID" @click="openOther(item)">
                    <img :src="formatImg(item.Path)"  class="u-img" />
                    <div class="u-name">{{ item.szName }}</div>
                    <div class="u-id">{{ getType(item) }}</div>
                </div>
            </div>
            <div class="u-more" v-show="setData.furnitures.length>3&& !showMore" @click="showMore=true">加载更多</div>
        </div>
        <!-- 攻略 -->
        <div class="m-furniture-wiki" v-if="other_id">
            <Wiki
                source_type="item"
                :source_id="item_id"
                :type="type"
                :id="id"
                title="家具攻略"
                :source_title="data.szName"
            ></Wiki>
        </div>
        <WikiComments type="item" :source-id="String(id)" />
    </div>
</template>
<script>

import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";

import { getFurnitureDetail, getSetList, getFurnitureColor } from "@/service/furniture.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
// import ListCross from "@/components/ListCross.vue";
import { getFurnitureCategory } from "@/service/homeland.js";
import  { wxNewPage } from "@/utils/minprogram";
import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";
import Wiki from "@/components/wiki/Wiki.vue";
import { getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";
import { addFav, delFav, hasFav } from "@jx3box/jx3box-common-ui/service/fav";

export default {
    name: "FurnitureSingle",
    components: { WikiComments, Wiki,SuspendCommon },
    inject: ["__imgRoot"],
    data() {
        return {
            loading: false,
            sameLoading: false,
            showMore:false,

            favorite:null,
            type: "furniture",
            data: "", // 家具数据
            setData: "",
            colorData: "", // 染色数据
            category: {},
            login: User.isLogin(),
        };
    },
    computed: {
        id: function () {
            return ~~this.$route.params.id;
        },
        other_id: function () {
            return this.data?.__manufactureID;
        },
        item_id: function () {
            return this.data?.__manufactureID ? "10_" + this.data?.__manufactureID : "";
        },
        achieve_id: function () {
            return this.setData?.dwAchievementID;
        },
        represent_id: function () {
            return this.data?.nRepresentID;
        },
        set_id: function () {
            return this.data?.SetID;
        },

        has_extend: function () {
            return this.data.szTip || this.setData || (this.data.szSource == "生活技能" && this.data.__manufactureID);
        },

        color_list: function () {
            let list = [];

            for (const key in this.colorData) {
                if (key.startsWith("szDetailIndex")) {
                    this.colorData[key] && list.push(this.colorData[key].replace(/;/g, ","));
                }
            }
            return list;
        },
        other_list:function(){
            if(this.showMore) return this.setData.furnitures;
            if(this.setData.furnitures.length>3)return this.setData.furnitures.slice(0,3);
            return this.setData.furnitures;
        }
    },
    watch: {
        id: {
            immediate: true,
            handler(val) {
                // val && this.getHorse(val);
            },
        },
    },
    created() {
        this.getCategory();
        this.getData();

        if (this.login && this.id) this.hasFav();
    },
    methods: {
        openOther(item){
            wxNewPage(`/furniture/${item.dwID}`)
        },
        doFav: function () {
            if (this.login) {
                this.favorite ? this.delFav() : this.addFav();
            } else {
                this.$message.error( "请先登录！");
            }
        },
        hasFav: function () {
            hasFav(this.type, this.id).then((res) => {
                this.favorite = res.id || false;

            });
        },
        addFav: function () {
            addFav(this.type, this.id, this.setData.szName).then((res) => {

                this.favorite = res.id;
            });
        },
        delFav: function () {
            delFav(this.favorite).then(() => {
                this.favorite = false;
            });
        },
        getCategory() {
            getFurnitureCategory().then((res) => {
                this.category = res?.data || {};
            });
        },
        // 数据加载
        // ==============
        getData() {
            this.loading = true;
            getFurnitureDetail(this.id)
                .then((res) => {
                    this.data = res.data;

                    // 发送统计
                    postStat(this.type, this.id);
                })
                .then(() => {
                    this.represent_id && this.getColorData();
                    this.set_id && this.getSetData();
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getColorData() {
            getFurnitureColor(this.represent_id).then((res) => {
                this.colorData = res.data;
            });
        },
        getSetData() {
            getSetList(this.set_id).then((res) => {
                this.setData = res.data;
            });
        },
        otherListInit() {
            if(this.showMore) return this.setData.furnitures;
            if(this.setData.furnitures.length>3)return this.setData.furnitures.slice(0,3);
            return this.setData.furnitures;
        },
        // 工具函数
        // ===================
        getLink,
        // 描述过滤
        description_filter(value) {
            let matchs = /text="(.*?)(\\\\\\n)?"/.exec(value);
            if (matchs && matchs.length > 1) value = matchs[1].trim();
            if (value) value = value.replace(/\\n/g, "<br>");
            return value;
        },
        // 图片链接转换
        formatImg(link) {
            if (!link) return;
            let img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
            let name = img?.[1].replace(/\\/g, "/");

            if (img?.[1] == "default") return this.__imgRoot + "homeland/std/default/default.png";
            return this.__imgRoot + "homeland/std" + name + ".png";
        },
        getType(data) {
            const Category1 = data.nCatag1Index;
            const Category2 = data.nCatag2Index;
            const name1 = this.category[Category1]?.name || "";
            let name2 = "";
            if (name1) {
                const list = this.category[Category1]?.children || [];
                name2 = list.find((item) => ~~item.nCatag2Index === Category2)?.szName || "";
            }
            return name1 + "-" + name2;
        },
        scaleRange(str) {
            return str?.split(";");
        },

    },
};
</script>
<style lang="less">
@fontColor:#24292E;
@fontColor-dark:#FEDAA3;
@fontColor-40:rgba(28, 28, 28, 0.40);
@fontColor-40-dark:rgba(255, 255, 255, 0.40);
@fontColor-80:rgba(28, 28, 28, 0.80);
@fontColor-80-dark:rgba(255, 255, 255, 0.80);
.v-miniprogram{
    .m-main{
        padding: 0;
    }
    body{
        padding: 0 !important;
    }
    .el-backtop{
        display: none;
    }
    .u-attr-popover{
        border: none;
        background: #303133;
        color:#fff;
        .fz(0.85rem);
        .u-attr-name{

            color:#00d24b;
        }
    }

}

.p-furniture-single_mobile {
    background: #fafafa;
    padding: 0.75rem 1.25rem 4.45rem 1.25rem ;
    box-sizing: border-box;
    overflow: auto;
    height: 100vh;
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


            }
        }
    }

    .u-horse-common{
        .m-more{
            border-left: none;
        }
    }
    .m-info-main{
        background: #fff;
        .r(0.75rem);
        padding: 1rem;
        box-sizing: border-box;
        .u-top-box{
            .flex;
            justify-content: space-between;
            align-items: center;
            gap:0.5rem;
            .mb(1rem);
            .u-name{
                color:@fontColor;
                .fz(1rem,1.5rem);
                .bold(700);
            }

            .u-img{
                .size(2.875rem);
                .r(0.25rem);
                background-image: url("../../../assets/img/horse_item_bg_sm.jpg");
                background-position: center;
                background-repeat: no-repeat;
                background-size: cover;
            }
        }
        .m-box{
            .mb(1rem);
            .u-title{
                color:@fontColor-40;
                .fz(0.75rem,1.125rem);
                .bold(400);
                .mb(0.25rem);
            }
            .u-text{
                color:@fontColor-80;
                .fz(0.875rem,1.25rem);
                .bold(400);
            }
        }
        .m-other{
            .flex;
            flex-wrap: wrap;
            gap:1rem;
            .u-item{
                .w(calc(calc(100% - 1rem) / 2));
                flex-shrink: 0;
                .u-color{
                    .flex;
                    gap:0.5rem;
                    .u-value{
                        .size(0.75rem);
                        border: 1px solid #e1dfdf;
                        border-radius: 50%;
                    }
                }
            }
        }

    }
    //列表
    .m-same-horses{
        margin: 1.25rem 0;
        .m-title{
            color: @fontColor;
            .fz(1rem,1.5rem);
            .bold(700);
            .mb(0.5rem);
        }
        .m-horse-card{
            .flex;
            gap:0.75rem;
            .mb(1rem);
            flex-wrap: wrap;
            .u-item{
                padding: 0.5rem;
                box-sizing: border-box;
                .w(calc(calc(100vw - 4.5rem) / 3));
                flex-shrink: 0;
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
                    color: @fontColor-40;
                    .fz(0.625rem,0.938rem);
                    font-style: normal;
                    .bold(400);
                }
            }
        }
        .u-more{
            color: @fontColor-40;
            .fz(0.75rem,1.125rem);
            .bold(400);
            .x;

        }
    }
}
//@media screen and (width: 414px)
@media (prefers-color-scheme: dark)
{
    .p-furniture-single_mobile{
        background-color: #000;
        .m-info-main{
            background: #282828;
            .u-top-box{
                .u-name,.u-id{
                    color:@fontColor-dark
                }
            }
            .m-box{
                .u-title{
                    color:@fontColor-40-dark;
                }
                .u-text{
                    color:@fontColor-80-dark;
                }
            }
        }
        .m-same-horses{
            .m-title{
                color:@fontColor-80-dark;
            }
            .m-horse-card{
                .u-item{
                    background: #282828;
                    .u-name{
                        color:@fontColor-dark;
                    }
                    .u-id{
                        color:@fontColor-40-dark;
                    }
                }
            }
            .u-more{
                color: @fontColor-40-dark;
            }
        }
    }
}
</style>
