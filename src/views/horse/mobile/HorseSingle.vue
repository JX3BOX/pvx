<template>
    <div class="p-pvx-horse-single-mobile">
        <SuspendCommon :btnOptions="{ showHome: true }" :drawerOptions="{
            hideType: ['report', 'rss', 'search', 'user'],
            title: item.Name,
            postType: 'horse',
            id: id,
        }" @search="search" v-if="$route.query?.disabled != 'true'" class="u-horse-common">
        </SuspendCommon>
        <div class="m-info-main">
            <div class="u-top-box">
                <div class="u-pvx-horse-img">
                    <img v-if="type !== 2" :src="getImgSrc(item, true)" @error="replaceByDefault" class="u-pvx-horse-image" />

                    <item-icon v-else class="u-pvx-horse-image" :item_id="String(item.ItemID)" :isLink="false" :size="150"
                        :onlyIcon="true"></item-icon>
                </div>
                <div class="u-info">
                    <div class="u-pvx-horse-name">{{ item.Name }}</div>
                    <div class="u-pvx-horse-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            <!--        分类-->
            <div class="m-box m-types">
                <div class="u-pvx-horse-title">分类</div>
                <div class="u-text">{{ displayType }}</div>
            </div>
            <!--        其他-->
            <div class="m-box m-other">
                <div class="u-item">
                    <div class="u-pvx-horse-title">品质</div>
                    <div class="u-text">{{ item.Level }}</div>
                </div>
                <div class="u-item" v-if="type !== '2'">
                    <div class="u-pvx-horse-title">跑速</div>
                    <div class="u-text">{{ speedName }}</div>
                </div>
                <div class="u-item" v-if="type !== '2'">
                    <div class="u-pvx-horse-title">捕获地图</div>
                    <div class="u-text">{{ originDatas }}</div>
                </div>
                <div class="u-item" v-if="type !== '2'">
                    <div class="u-pvx-horse-title">饲料</div>
                    <div class="u-text">{{ feedName }}</div>
                </div>
            </div>
            <!--        属性模块-->
            <div class="m-box m-attrs" v-if="basicAttrs.length">
                <div class="u-pvx-horse-title">属性</div>
                <div class="u-attrs">
                    <div class="u-attr-item" v-for="attr in basicAttrs" :key="attr.id">
                        <el-popover placement="top" width="300" trigger="click" popper-class="u-attr-popover">
                            <div class="u-attr-pop">
                                <div class="u-attr-name" v-if="attr.name">
                                    {{ (attr.name || "") + (Number(attr.level) ? attr.level + "级" : "") }}
                                </div>
                                <div class="u-attr-desc">{{ attr.desc }}</div>
                            </div>
                            <template #reference>
                                <img class="u-pvx-horse-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                            </template>
                        </el-popover>
                    </div>
                </div>
            </div>
            <div class="m-box m-attrs" v-if="magicAttrs.length">
                <div class="u-pvx-horse-title">特殊属性</div>
                <div class="u-attrs">
                    <div class="u-attr-item" v-for="(attr, index) in magicAttrs" :key="index">
                        <el-popover placement="top" width="300" trigger="click" popper-class="u-attr-popover">
                            <div class="u-attr-pop">
                                <div class="u-attr-name" v-if="attr.name">
                                    {{ (attr.name || "") + (Number(attr.level) ? attr.level + "级" : "") }}
                                </div>
                                <div class="u-attr-desc">{{ attr.desc }}</div>
                            </div>
                            <template #reference>
                                <img class="u-pvx-horse-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                            </template>
                        </el-popover>
                    </div>
                </div>
            </div>
        </div>
        <!--        同类坐骑-->
        <div class="m-same-horses" v-if="sameList.length">
            <div class="m-title">同类坐骑</div>
            <div class="m-pvx-horse-card">
                <div class="u-item" v-for="item in sameListInit" :key="item?.ID" @click="openOther(item)">
                    <img :src="getImgSrc(item, true)" @error="replaceByDefault" class="u-pvx-horse-img" />
                    <div class="u-pvx-horse-name">{{ item.Name }}</div>
                    <div class="u-pvx-horse-id">ID：{{ item.ID }}</div>
                </div>
            </div>
            <div class="u-pvx-horse-more" v-show="sameList.length > 3 && !showMore" @click="showMore = true">加载更多</div>
        </div>
        <div>
            <PvxUserMiniprogram :id="id" name="坐骑" type="item"></PvxUserMiniprogram>
        </div>
    </div>
</template>
<script>
import wx from "weixin-js-sdk";
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import ItemIcon from "@/components/common/item_icon.vue";
import { getHorse, getHorses } from "@/service/horse";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { __cdn } from "@/utils/config";
import { getHorseType, getHorseModeName, getHorseFeedName, getHorseSpeed, getHorseImgSrc, handleHorseImgError } from "@/utils/horse";
import { wxNewPage } from "@/utils/minprogram";
import horseMapList from "@/assets/data/horse_map.json";
import horseSites from "@/assets/data/horse_sites.json";

import PvxUserMiniprogram from "@/components/PvxUserMiniprogram.vue";

export default {
    name: "Single",
    components: { PvxUserMiniprogram, ItemIcon, SuspendCommon },
    inject: ["__imgRoot", "__imgRoot2"],
    data() {
        return {
            loading: false,
            sameLoading: false,
            item: {},
            sameList: [],
            showMore: false,
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
                if (!arr.length) return "无";
                return arr.join("/");
            } else {
                return "无";
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
            return getHorseType(this.item);
        },
        modeName() {
            return getHorseModeName(this.item);
        },
        feedName() {
            return getHorseFeedName(this.item, this.isRobot);
        },
        speedName() {
            return getHorseSpeed(this.item);
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
            if (this.showMore) return this.sameList;
            if (this.sameList.length > 3) return this.sameList.slice(0, 3);
            return this.sameList;
        },
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
        openOther(item) {
            wxNewPage(`/horse/${item.ItemID}?type=${this.type}`);
        },
        search() {
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=坐骑&filter_name=pvxhorse`,
            });
        },
        replaceByDefault(e) {
            handleHorseImgError(e);
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
                    document.title = name + this.$t("pages.common.appendTitle");
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
        getImgSrc(item, isAuto = false) {
            return getHorseImgSrc(item, this.client, this.__imgRoot, this.__imgRoot2, isAuto);
        },
        getLink,
    },
};
</script>
<style lang="less">
@import "~@/assets/css/horse/miniprogram/single.less";
</style>
