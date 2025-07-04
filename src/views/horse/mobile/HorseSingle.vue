<template>
    <div class="p-horse-single_mobile">
        <SuspendCommon
            :btnOptions="{showHome:true}"
            :drawerOptions="{
            hideType:['report','rss','search','user'],
            title: item.Name,
            postType:'horse',
            id:id
            }"
            @search="search"
            v-if="$route.query?.disabled!='true'"
            class="u-horse-common"
        >
        </SuspendCommon>
        <div class="m-info-main">
            <div class="u-top-box">
                <div class="u-img">
                    <img v-if="type !== 2" :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-image" />

                    <item-icon
                        v-else
                        class="u-image"
                        :item_id="String(item.ItemID)"
                        :isLink="false"
                        :size="150"
                        :onlyIcon="true"
                    ></item-icon>
                </div>
                <div class="u-info">
                    <div class="u-name">{{ item.Name }}</div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>

            </div>
    <!--        分类-->
            <div class="m-box m-types">
                <div class="u-title">分类</div>
                <div class="u-text">{{ displayType }}</div>
            </div>
    <!--        其他-->
            <div class="m-box m-other">
                <div class="u-item">
                    <div class="u-title">品质</div>
                    <div class="u-text">{{ item.Level }}</div>
                </div>
                <div class="u-item" v-if="type !== '2'">
                    <div class="u-title">跑速</div>
                    <div class="u-text">{{ speedName }}</div>
                </div>
                <div class="u-item" v-if="type !== '2'">
                    <div class="u-title">捕获地图</div>
                    <div class="u-text">{{ originDatas }}</div>
                </div>
                <div class="u-item"  v-if="type !== '2'">
                    <div class="u-title">饲料</div>
                    <div class="u-text">{{ feedName }}</div>
                </div>
            </div>
    <!--        属性模块-->
            <div class="m-box m-attrs" v-if="basicAttrs.length">
                <div class="u-title">属性</div>
                <div class="u-attrs">
                    <div class="u-attr-item" v-for="attr in basicAttrs" :key="attr.id">
                        <el-popover
                            placement="top"
                            width="300"
                            trigger="click"
                            popper-class="u-attr-popover">
                            <div class="u-attr-pop">
                                <div class="u-attr-name" v-if="attr.name">
                                    {{
                                        (attr.name || "") +
                                        (Number(attr.level) ? attr.level + "级" : "")
                                    }}
                                </div>
                                <div class="u-attr-desc">{{ attr.desc }}</div>
                            </div>
                            <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" slot="reference"/>
                        </el-popover>
                    </div>
                </div>
            </div>
            <div class="m-box m-attrs" v-if="magicAttrs.length">
                <div class="u-title">特殊属性</div>
                <div class="u-attrs">
                    <div class="u-attr-item" v-for="(attr, index) in magicAttrs" :key="index">
                        <el-popover
                            placement="top"
                            width="300"
                            trigger="click"
                            popper-class="u-attr-popover">
                            <div class="u-attr-pop">
                                <div class="u-attr-name" v-if="attr.name">
                                    {{
                                        (attr.name || "") +
                                        (Number(attr.level) ? attr.level + "级" : "")
                                    }}
                                </div>
                                <div class="u-attr-desc">{{ attr.desc }}</div>
                            </div>
                            <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" slot="reference"/>
                        </el-popover>
                    </div>
                </div>
            </div>
        </div>
<!--        同类坐骑-->
        <div class="m-same-horses"  v-if="sameList.length">
            <div class="m-title">同类坐骑</div>
            <div class="m-horse-card">
                <div class="u-item" v-for="item in sameListInit" :key="item?.ID" @click="openOther(item)">
                    <img :src="getImgSrc(item, true)"  @error="replaceByDefault" class="u-img" />
                    <div class="u-name">{{ item.Name }}</div>
                    <div class="u-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            <div class="u-more" v-show="sameList.length>3&& !showMore" @click="showMore=true">加载更多</div>
        </div>
        <div> <PvxUserMiniprogram :id="id" name="坐骑" type="item"></PvxUserMiniprogram></div>
    </div>
</template>
<script>
import wx from "weixin-js-sdk";
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";
import ItemIcon from "@/components/common/item_icon.vue";
import { getHorse, getHorses } from "@/service/horse";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@jx3box/jx3box-common/data/jx3box.json";
import  { wxNewPage } from "@/utils/minprogram";
import horseMapList from "@/assets/data/horse_map.json";
import horseSites from "@/assets/data/horse_sites.json";

import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";

export default {
    name: "Single",
    components: { PvxUserMiniprogram, ItemIcon,SuspendCommon },
    inject: ["__imgRoot", "__imgRoot2"],
    data() {
        return {
            loading: false,
            sameLoading: false,
            item: {},
            sameList: [],
            showMore:false
        };
    },
    computed: {
        originDatas() {
            const name = this.item.Name;
            if (name) {
                let mapList = horseMapList.find((item) => name.indexOf(item.name) > -1)
                    ? horseMapList.find((item) => name.indexOf(item.name) > -1).mapList
                    : [];
                const arr = [];
                if (mapList.length) {
                    mapList.forEach((mapId) => {
                        // arr.push({
                        //     mapId: mapId,
                        //     mapName: horseSites[mapId].mapName,
                        //     coordinates: horseSites[mapId].coordinates,
                        // });
                        arr.push(horseSites[mapId].mapName);
                    });
                }
                if(!arr.length) return '无'
                return arr.join("/");
            } else {
                return '无';
            }
        },
        id() {
            return this.$route.params.id || this.sourceId;
        },
        type() {
            return this.$route.query.type;
        },
        client() {
            return this.$store.state.client;
        },
        basicAttrs() {
            const attrs = this.item.MagicAttributes;
            return attrs && attrs.length
                ? attrs
                    .filter((item) => !item.level || item.level === "0")
                    .map((mItem) => {
                        mItem.iconUrl = iconLink(mItem.icon);
                        return mItem;
                    })
                : [];
        },
        magicAttrs() {
            const attrs = this.item.MagicAttributes;
            return attrs && attrs.length
                ? attrs
                    .filter((item) => item.icon && item.level !== "0")
                    .map((mItem) => {
                        mItem.iconUrl = iconLink(mItem.icon);
                        return mItem;
                    })
                : [];
        },
        typeName() {
            const item = this.item;
            // SubType 15为坐骑 23 为马具
            // DetailType 0普通坐骑，非0奇趣坐骑
            // DetailType 0头饰，1鞍饰，2足饰，3马饰
            let type = "";
            if (item.SubType === 15) {
                if (item.DetailType === 0) {
                    type = "普通坐骑";
                } else {
                    type = "奇趣坐骑";
                }
            } else if (item.SubType === 23) {
                if (item.DetailType === 0) {
                    type = "头饰";
                } else if (item.DetailType === 1) {
                    type = "鞍饰";
                } else if (item.DetailType === 2) {
                    type = "足饰";
                } else if (item.DetailType === 3) {
                    type = "马饰";
                } else {
                    type = "马具";
                }
            }
            return type;
        },
        modeName() {
            // 双骑
            let name = "";
            const item = this.item;
            if (item.SubType === 15) {
                if (item.MagicAttributes && item.MagicAttributes.length) {
                    name = item.MagicAttributes.find((attr) => attr.id === "15650")
                        ? item.MagicAttributes.find((attr) => attr.id === "15650").name
                        : "单骑";
                }
            }
            return name;
        },
        feedName() {
            const item = this.item;
            let feed = "";
            if (item.SubType === 15 && item.Feed) {
                const start = item.Feed.FeedTip.indexOf("【");
                const end = item.Feed.FeedTip.indexOf("】");
                feed = item.Feed.FeedTip.slice(start, end + 1);
            }
            return this.isRobot ? feed.replace("【", "").replace("】", "") : feed;
        },
        speedName() {
            const item = this.item;
            let speed = "";
            if (item.MoveSpeed) {
                speed = item.MoveSpeedDesc.split("移动速度提高")[1];
            }
            return speed;
        },
        displayType() {
            let type = this.typeName;
            if (this.type !== "2") {
                type += ` · ${this.modeName}`;
                if (this.item.GetType) {
                    type += ` · ${this.item.GetType}`;
                }
            }
            return type;
        },
        sameListInit() {
            if(this.showMore) return this.sameList;
            if(this.sameList.length>3)return this.sameList.slice(0,3);
            return this.sameList;
        }
    },
    watch: {
        id: {
            immediate: true,
            handler(val) {
                val && this.getHorse(val);
            },
        },
    },
    methods: {
        openOther(item){
            wxNewPage(`/horse/${item.ItemID}?type=${this.type}`)
        },
        search(){
            wx.miniProgram.navigateTo({ url: `/pages/search/search-detail/search-detail?app=坐骑&filter_name=pvxhorse` });
        },
        replaceByDefault(e) {
            e.target.src = require("../../../assets/img/horse_item_bg_sm.jpg");
        },
        getHorse(id) {
            const params = {
                id: id,
                client: this.client,
            };
            if (this.type === "2") {
                params.type = 2;
            }
            this.loading = true;
            getHorse(params)
                .then((res) => {
                    this.loading = false;
                    this.item = res.data || {};
                    let name = res.data.Name;
                    document.title=name;
                    if (this.typeName === "普通坐骑") {
                        name = res.data.Name.split("·")[0];
                    }
                    if (this.type !== "2" && name) {
                        this.getSameHorses(name);
                    }
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getSameHorses(name) {
            const params = {
                page: 1,
                pageSize: 50,
                client: this.client,
                keyword: name,
            };
            this.sameLoading = true;
            getHorses(params)
                .then((res) => {
                    this.sameLoading = false;
                    this.sameList = res.data.list
                        .filter((item) => item.ID !== this.item.ID)
                        .map((item) => {
                            item.imgUrl = this.getImgSrc(item);
                            if (item.MagicAttributes && item.MagicAttributes.length) {
                                item.MagicAttributes.map((mItem) => {
                                    mItem.iconUrl = iconLink(mItem.icon);
                                    return mItem;
                                });
                            }
                            return item;
                        });
                })
                .finally(() => {
                    this.sameLoading = false;
                });
        },
        getImgSrc(item,isAuto = false) {
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
        getLink,
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

.p-horse-single_mobile {
    background: #fafafa;
    padding: 0.75rem 1.25rem 4.45rem 1.25rem ;
    box-sizing: border-box;
    overflow: auto;
    height: 100vh;
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
            //justify-content: space-between;
            gap:0.5rem;
            .mb(1rem);
            .u-name{
                color:@fontColor;
                .fz(1rem,1.5rem);
                .bold(700);
            }
            .u-id{
                color:@fontColor;
                .fz(0.75rem,1.5rem);
                .bold(400);
            }
            .u-img{
                .size(2.875rem);
                .r(0.25rem);
                background: #AAA;
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
            }
        }
        .m-attrs{
            .u-attrs{
                .flex;
                flex-wrap: wrap;
                gap:0.5rem;
                .u-attr-item{
                    .size(2.25rem);
                    .r(0.25rem);
                    background: #D9D9D9;
                }
                .u-attr-icon{
                    .r(0.25rem);
                }
            }
        }
    }
    //同类坐骑
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
                .w(calc(calc(100% - 1.5rem) / 3));
                flex-shrink: 0;
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
    .p-horse-single_mobile{
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
