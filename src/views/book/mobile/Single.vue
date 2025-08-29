<!---
 * @Author: ymg
 * @Date: 2025-08-20 08:58:08
 * @Description: 小程序书籍
 -->
<template>
    <div class="p-book-single-mobile">
        <SuspendCommon
            :btnOptions="{ showHome: true }"
            :drawerOptions="{
                hideType: ['report', 'rss', 'search', 'user', 'collect'],
                title: book.Name,
                postType: type,
                id: id,
            }"
            v-if="$route.query?.disabled != 'true'"
            class="u-horse-common"
        >
            <template #default>
                <div class="m-suspend-btn">
                    <div class="u-btn-item line" @click="doFav">
                        <img
                            class="u-icon"
                            src="@/assets/img/pvxsuspension/collect_active.svg"
                            svg-inline
                            v-if="favorite"
                        />
                        <img class="u-icon" src="@/assets/img/pvxsuspension/collect.svg" svg-inline v-else />
                        收藏
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <div class="m-info-main">
            <div class="m-box u-top-content">
                <div class="m-title">{{ book.Name }}</div>
                <div :class="{ 'u-box': isShadow }">
                    <div
                        class="u-content"
                        :class="{ scroll: contentScrollTop > 10 }"
                        v-html="book.contentInfo"
                        ref="filteateContent"
                        @scroll="handleFilteateScroll"
                    ></div>
                </div>
            </div>

            <!--        其他-->
            <div class="m-box m-other">
                <div class="m-title">书籍信息</div>
                <div class="u-other-box">
                    <div class="u-item"  v-if="!['其它', '碑铭'].includes(getOrigin(book))">
                        <div class="u-title">来源</div>
                        <div class="u-text">
                            <span :class="getOrigin(book) !== '其它' && 'book-special'">{{ getOrigin(book) }}</span>
                        </div>
                    </div>

                    <div class="u-item" v-else>
                        <div class="u-title">来源</div>
                        <div class="u-text">
                           <span v-if="getOrigin(book) === '碑铭'" class="book-special"
                           >{{ getOrigin(book) }}
                            </span>
                            <!-- 其它 -->
                            <span v-else>{{ getOrigin(book) }}</span>
                        </div>
                    </div>

                    <div class="u-item" >
                        <div class="u-title">所属套书</div>
                        <div class="u-text">{{
                                "【" + getProfessionType(book.ExtendProfessionID1) + "】" + book.BookName
                            }}</div>
                    </div>
<!--                    <div class="u-item" >-->
<!--                        <div class="u-title">类型</div>-->
<!--                        <div class="u-text">{{ book.MaxAmountPerLand }}</div>-->
<!--                    </div>-->
                    <div class="u-item" >
                        <div class="u-title">阅读等级</div>
                        <div class="u-text">{{ book.RequireLevel }}</div>
                    </div>
                </div>
                <div class="m-title m-title-other">抄录要求</div>
                <div class="u-other-box">
                    <div class="u-item">
                        <div class="u-title">角色等级</div>
                        <div class="u-text">{{ book.copy?.RequirePlayerLevel }}</div>
                    </div>
                    <div class="u-item" >
                        <div class="u-title">阅读等级</div>
                        <div class="u-text">{{ book.copy?.RequireLevel }}</div>
                    </div>
                    <div class="u-item" >
                        <div class="u-title">{{ getProfessionType(book.ExtendProfessionID1) }}等级</div>
                        <div class="u-text">{{ book.copy?.RequireLevelExt }}</div>
                    </div>
                    <div class="u-item" >
                        <div class="u-title">精力消耗</div>
                        <div class="u-text">{{ book.copy?.CostVigor }}</div>
                    </div>
                    <div class="u-item" >
                        <div class="u-title">所需材料</div>
                        <div class="u-text u-copy-list">
                            <item-icon
                                v-for="material in book.copyList"
                                :key="material.item_id"
                                :item_id="material.item_id"
                                :size="28"
                                :amount="material.count"
                                :onlyIcon="true"
                            ></item-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--        其他列表-->
        <div class="m-other-list" >
            <div class="m-title">
                套书·{{ book.BookName }}
            </div>
            <div class="u-item" >
                <div class="u-list" >
                    <div class="u-book-item" v-for="(item2,index) in showMore?bookList:bookList.slice(0,3)" :key="index" @click="openOther(item2.ID)">
                        <div class="u-cover">
                            <div class="u-book-name">
                                <div class="u-text">
                                    <div class="u-name"  :class="{scroll:item2.Name.length>5}">
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
            <div class="u-more" v-show="bookList.length>3&& !showMore" @click="showMore=true">加载更多</div>
        </div>


        <!-- 攻略 -->
        <div class="m-furniture-wiki" v-if="id">
            <Wiki
                source_type="item"
                :source_id="book.ItemID"
                :type="type"
                :id="id"
                title="家具攻略"
                :source_title="book.Name"
            ></Wiki>
        </div>
        <WikiComments type="item" :source-id="String(id)" />
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-common-ui/src/SuspendCommon";

import bookProfession from "@/assets/data/book_profession.json";
// 碑铭坐标json
import bookMapInfoStd from "@/assets/data/stele_std_fwd.json";
import bookMapInfoOrigin from "@/assets/data/stele_origin_fwd.json";

// 副本地图json
import maps_std from "@jx3box/jx3box-data/data/fb/fb_map.json";
import maps_orgin from "@jx3box/jx3box-data/data/fb/fb_map_origin.json";

import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { getInfo, getList } from "@/service/book";
import { addFav, delFav, hasFav } from "@jx3box/jx3box-common-ui/service/fav";
import User from "@jx3box/jx3box-common/js/user";
import ItemIcon from "@/components/book/common/item_icon_v2.vue";
import WikiComments from "@jx3box/jx3box-common-ui/src/wiki/WikiComments";
import Wiki from "@/components/wiki/Wiki.vue";
import { wxNewPage } from "@/utils/minprogram";

export default {
    name: "bookSingle",
    props: ["isRobot", "sourceId"],
    components: { Wiki, ItemIcon, SuspendCommon,WikiComments },
    data() {
        return {
            favorite: null,
            login: User.isLogin(),
            type: "item",
            isShadow: true, //是否显示阴影
            showMore:false,

            contentScrollTop: 0,
            compatible: false,
            is_empty: true,
            arrowShow: false,
            book: {
                idKey: "",
                Name: "",
                Desc: "",
                BookName: "",
                contentInfo: "",
            },
            loading: false,
            bookMapSite: [], // 碑铭点位信息
            listLoading: false,
            bookList: [],

            bookTypeMap: {
                11: "杂集",
                10: "道学",
                9: "佛学",
            },
        };
    },
    methods: {
        iconLink,
        openOther(item){
            wxNewPage(`/book/${item.ID}`)
        },

        handleFilteateScroll(event) {
            const { target } = event;
            this.contentScrollTop = target.scrollTop;
            if (target.scrollHeight - target.scrollTop - target.offsetHeight < 10) {
                this.isShadow = false;
            } else {
                this.isShadow = true;
            }
        },
        doFav: function () {
            if (this.login) {
                this.favorite ? this.delFav() : this.addFav();
            } else {
                this.$message.error("请先登录！");
            }
        },
        hasFav: function () {
            hasFav(this.type, this.idKey).then((res) => {
                this.favorite = res.id || false;
            });
        },
        addFav: function () {
            addFav(this.type, this.idKey, this.book.Name).then((res) => {
                this.favorite = res.id;
            });
        },
        delFav: function () {
            delFav(this.favorite).then(() => {
                this.favorite = false;
            });
        },
        getBossOrigin(book) {
            const fbMaps = this.client === "std" ? maps_std : maps_orgin;
            const maps = Object.values(fbMaps)
                .map((item) => Object.values(item.dungeon))
                .reduce(function (a, b) {
                    return a.concat(b);
                })
                .map((item) => {
                    return item.maps.map((mItem) => {
                        return {
                            map_id: Number(mItem.map_id),
                            name: mItem.mode + item.name,
                        };
                    });
                })
                .flat();
            const drops = book?.drops;
            if (drops && drops.length) {
                let orgin = "";
                drops.forEach((item) => {
                    orgin =
                        orgin +
                        (orgin.length ? "<br />" : "") +
                        ("[" + item.BossName + "]") +
                        (maps.find((mItem) => mItem.map_id === item.MapID)
                            ? "(" + maps.find((mItem) => mItem.map_id === item.MapID).name + ")"
                            : "");
                });
                return orgin;
            }
            return "";
        },
        getShopOrigin(book) {
            let shopNames = book?.ShopNames;
            if (shopNames) {
                shopNames = shopNames.replace(/\|/g, "<br />");
            }
            return shopNames;
        },
        getQuestOrigin(book) {
            const quests = book?.Quests;
            let questList = [];
            if (quests) {
                questList = quests.split(";").map((item) => {
                    if (item.indexOf(":") > -1) {
                        return {
                            questId: item.split(":")[0],
                            questName: item.split(":")[1],
                        };
                    }
                });
            }
            return questList;
        },
        getOrigin(item) {
            const tempId = item.DoodadTemplateID;
            const ShopNames = item?.ShopNames;
            const drops = item.drops || [];
            const quests = item?.Quests;
            let orgin = "";
            if (tempId) {
                orgin = orgin + (orgin ? "/" : "") + (this.bookMapInfo[tempId] ? "碑铭" : "其它");
            }
            if (ShopNames) {
                orgin = orgin + (orgin ? "/" : "") + "商店";
            }
            if (drops.length) {
                orgin = orgin + (orgin ? "/" : "") + "秘境";
            }
            if (quests) {
                orgin = orgin + (orgin ? "/" : "") + "任务";
            }
            if (!orgin) {
                orgin = "其它";
            }
            return orgin;
        },
        getProfessionType(type) {
            return bookProfession.find((item) => item.id === Number(type))
                ? bookProfession.find((item) => item.id === Number(type)).name
                : "";
        },
        getData() {
            this.loading = true;
            getInfo({
                id: this.idKey,
                client: this.client,
            })
                .then((res) => {
                    const data = res.data;
                    data.contentInfo = data.contents.map((item) => item.content.replace(/\\n/g, "<br>")).join("<br>");
                    if (data.DoodadTemplateID && this.bookMapInfo[data.DoodadTemplateID]) {
                        this.bookMapSite = this.bookMapInfo[data.DoodadTemplateID];
                        this.bookMapSite[0].position[0] = Object.assign(this.bookMapSite[0].position[0], {
                            title: data.Name,
                            content: `坐标：(${this.bookMapSite[0].position[0].x},${this.bookMapSite[0].position[0].y},${this.bookMapSite[0].position[0].z})`,
                        });
                    }
                    if (data?.copy?.ID) {
                        const keyArr = Object.keys(data.copy).filter((key) => key.indexOf("RequireItem") > -1);
                        let len = parseInt(keyArr.length / 3);
                        data.copyList = [];
                        for (let i = 1; i <= len; i++) {
                            if (data.copy["RequireItemType" + i]) {
                                data.copyList.push({
                                    item_id: data.copy["RequireItemType" + i] + "_" + data.copy["RequireItemIndex" + i],
                                    count: data.copy["RequireItemCount" + i],
                                });
                            }
                        }
                    }
                    this.book = data;

                    // 获取套书列表
                    this.getBookList(data.BookName);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getBookList(keyword) {
            const params = {
                page: 1,
                pageSize: 3,
                client: this.client,
                keyword,
            };
            getList(params)
                .then((res) => {
                    this.bookList = res.data.list || [];

                })
                .finally(() => {

                });
        },
        getLink,
    },
    mounted() {
        this.hasFav()
        this.getData();
    },
    computed: {
        idKey: function () {
            return this.$route.params.id || this.sourceId;
        },
        id: function () {
            return this.book?.ItemID;
        },
        client() {
            return this.$store.state.client;
        },
        bookMapInfo() {
            return this.client === "std" ? bookMapInfoStd : bookMapInfoOrigin;
        },
    },
    watch: {},
};
</script>

<style lang="less">
@fontColor: #24292e;
@fontColor-dark: #fedaa3;
@fontcolor-40:rgba(28,28,28,0.40);
@fontcolor-40-dark:rgba(255,255,255,0.40);
@fontcolor-80:rgba(28,28,28,0.80);
@fontcolor-80-dark:rgba(255,255,255,0.80);
.v-miniprogram {
    .m-main {
        padding: 0;
    }
    body {
        padding: 0 !important;
    }
    .el-backtop {
        display: none;
    }
    .u-attr-popover {
        border: none;
        background: #303133;
        color: #fff;
        .fz(0.85rem);
        .u-attr-name {
            color: #00d24b;
        }
    }
}
.p-book-single-mobile {
    background: #fafafa;
    padding: 0.75rem 1.25rem 4.45rem 1.25rem;
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
            flex: 1;
            &.line {
                border-right: 0.5px solid rgba(254, 218, 163, 0.2);
            }
            .u-icon {
                .size(1.25rem, 1.25rem);
            }
        }
    }
    .m-info-main {

        .m-title {
            color: @fontcolor-80;
            .fz(1rem,1.5rem);
            .bold(700);
            &.m-title-other{
                .mt(1rem);
            }
        }
        .u-top-content {

            .u-box {
                .pr;
                &::before {
                    content: "";
                    .pa;
                    z-index: 3;
                    bottom: 0;
                    background: linear-gradient(0deg, #fff 0%, rgba(255, 255, 255, 0) 181.45%);
                    height: 4rem;
                    .w(100%);
                }
            }
            .u-content {
                height: 15rem;
                overflow: auto;
                scrollbar-width: none;

                &::-webkit-scrollbar {
                    width: 0;
                    height: 0;
                }
                &.scroll {
                    margin-top: 1rem;
                }
            }
        }
        .m-box{
            background: #fff;
            .r(0.75rem);
            padding: 1rem;
            box-sizing: border-box;
            &.m-other{
                .mt(1.25rem);
                .u-other-box{
                    .flex;
                    flex-wrap: wrap;
                    gap:1rem;
                    .u-item{
                        .w(calc(calc(100% - 1rem) / 2));
                        flex-shrink: 0;
                        .mt(0.75rem);
                        .u-title{
                            color: @fontcolor-40;
                            .fz(0.75rem,1.25rem);
                            .bold(400)
                        }
                        .u-text{
                            color: @fontcolor-80;
                            .fz(0.875rem,1.25rem);
                            .bold(400)
                        }
                        .u-copy-list{
                            .flex;
                            //gap:0.5r/em
                            .u-item{
                                .w(2rem);
                            }
                        }
                    }
                }


            }
        }
    }
    .m-other-list{
        .mt(1.25rem);
        .mb(1.25rem);
        .u-more{
            color: @fontcolor-40;
            .fz(0.75rem,1.125rem);
            .bold(400);
            .x;
        }
        .m-title{
            color: @fontColor;
            .fz(1rem,1.5rem);
            .bold(700);
            .mb(0.5rem);
        }

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
                    color:@fontcolor-40;
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
                        .u-name{
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
    .p-book-single-mobile{
        background-color: #000;

        .m-info-main{
            .m-box{
                background: #282828;
                .m-title{
                    color:@fontcolor-80-dark;
                }
                .u-box{
                    &::before{
                    background: linear-gradient(0deg, #282828 0%, rgba(40, 40, 40, 0.00) 181.45%);
                    }
                }
                .u-content{
                    color:@fontcolor-80-dark;
                }

                .u-item{
                    .u-title{
                        color:@fontcolor-40-dark !important;
                    }
                    .u-text{
                        color:@fontcolor-80-dark !important;
                    }
                }
            }
        }
        .m-other-list{
            .m-title{
                color:@fontcolor-80-dark;
            }
            .u-item{
                .u-list{
                    .u-name{
                        color:@fontcolor-40-dark;
                    }
                    .u-desc{
                        color:@fontcolor-80-dark !important;
                    }
                }
            }
        }
    }

}
</style>
