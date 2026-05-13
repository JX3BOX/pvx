<template>
    <div class="p-pvx-horse-single m-single-wrapper">
        <template v-if="!isRobot">
            <div class="back-wrap m-navigation">
                <div class="u-pvx-horse-goback" @click="goBack">返回列表</div>
                <!-- <el-button @click="goBack">返回列表</el-button> -->
                <div class="u-back-right">
                    <PvxRobotTip v-if="!isRobot" :type-name="type == 2 ? '马具' : '坐骑'" :reply="item.Name"></PvxRobotTip>
                    <PvxSingleAdminDrop></PvxSingleAdminDrop>
                </div>
            </div>
            <div class="m-pvx-horse-single-content" v-loading="loading">
                <!-- 主要信息 -->
                <div class="m-pvx-horse-main-info">
                    <div v-if="item.ID" class="m-pvx-horse-main-info__wrap">
                        <div class="m-pvx-horse-main-info__info">
                            <div class="u-pvx-horse-info-item">
                                <span class="u-pvx-horse-id">ID: {{ item.ID }}</span>
                                <span class="u-pvx-horse-name">{{ item.Name }}</span>
                            </div>
                            <div class="u-pvx-horse-info-item u-pvx-horse-desc">
                                <span>
                                    分类:
                                    {{ displayType }}
                                </span>
                                <span>品质: {{ item.Level }}</span>
                                <span v-if="type !== '2'">跑速: {{ speedName }}</span>
                                <span v-if="type !== '2'">饲料: {{ feedName }}</span>
                            </div>

                            <div class="u-pvx-horse-info-item u-pvx-horse-desc">
                                <div class="u-pvx-horse-title">基础属性</div>
                                <!-- <div v-if="basicAttrs.length" class="basic-list">
                                <div class="item" v-for="item in basicAttrs" :key="item.id">
                                    {{ item.desc }}
                                </div>
                            </div> -->
                                <div v-if="basicAttrs.length" class="u-pvx-horse-attr-list">
                                    <div class="u-pvx-horse-attr" v-for="attr in basicAttrs" :key="attr.id">
                                        <el-tooltip trigger="hover" placement="top">
                                            <template #content>
                                                <div class="u-pvx-horse-attr-pop">
                                                    <div class="u-pvx-horse-attr-name" v-if="attr.name">
                                                        {{
                                                            (attr.name || "") +
                                                            (Number(attr.level) ? attr.level + "级" : "")
                                                        }}
                                                    </div>
                                                    <div class="u-pvx-horse-attr-desc">{{ attr.desc }}</div>
                                                </div>
                                            </template>
                                            <img class="u-pvx-horse-attr-icon" style="cursor: default" :src="attr.iconUrl"
                                                :alt="attr.name" />
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div v-else class="u-pvx-horse-no-data">无</div>
                            </div>
                            <div class="u-pvx-horse-info-item u-pvx-horse-desc">
                                <div class="title">特殊属性</div>
                                <div v-if="magicAttrs.length" class="u-pvx-horse-attr-list">
                                    <div class="u-pvx-horse-attr" v-for="(attr, index) in magicAttrs" :key="index">
                                        <el-tooltip trigger="hover" placement="top">
                                            <template #content>
                                                <div class="u-pvx-horse-attr-pop">
                                                    <div class="u-pvx-horse-attr-name" v-if="attr.name">
                                                        {{
                                                            (attr.name || "") +
                                                            (Number(attr.level) ? attr.level + "级" : "")
                                                        }}
                                                    </div>
                                                    <div class="u-pvx-horse-attr-desc">{{ attr.desc }}</div>
                                                </div>
                                            </template>
                                            <img class="u-pvx-horse-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div v-else class="u-pvx-horse-no-data">无</div>
                            </div>
                            <a class="u-pvx-horse-link" :href="getLink('item', this.id)" target="_blank">
                                <i class="el-icon-collection-tag"></i>
                                物品信息
                            </a>
                        </div>
                        <div class="m-pvx-horse-main-info__img" :class="`u-quality-bg--` + item.Quality">
                            <el-image v-if="item.SubType === 15" :src="getCdnImgUrl(item.ID)" class="u-image">
                            </el-image>
                            <item-icon v-else class="u-image" :item_id="String(item.ItemID)" :isLink="false" :size="150"
                                :onlyIcon="true"></item-icon>
                        </div>
                    </div>
                    <div v-else>无此信息</div>
                </div>
                <!-- 同类坐骑 - 普通坐骑 -->
                <div v-if="sameList.length" class="m-pvx-horse-same-list" v-loading="sameLoading">
                    <div class="title">同类坐骑</div>
                    <div class="m-pvx-horse-list">
                        <HorseCard :item="item" v-for="item in sameList" :key="item.ItemID"
                            @click="getHorse(item.ItemID)"></HorseCard>
                    </div>
                </div>
            </div>
        </template>
        <template v-else>
            <div class="m-pvx__item m-robot__horse-header">
                <div class="m-title">
                    <div class="u-pvx-horse-title" :class="`u-pvx-horse-title--level-${item.Quality}`">
                        {{ robotTitle }}
                    </div>
                    <div class="m-meta">
                        <div class="u-meta">{{ displayType }}</div>
                        <div class="u-meta">品质: {{ item.Level }}</div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_horse.svg" />
                </div>
            </div>
            <div class="m-robot__horse-info">
                <div class="m-left">
                    <div class="img-wrap">
                        <el-image v-if="item.SubType === 15" :src="getCdnImgUrl(item.ID)" class="u-image"> </el-image>
                        <item-icon v-else class="u-image" :item_id="String(item.ItemID)" :isLink="false" :size="150"
                            :onlyIcon="true"></item-icon>
                    </div>
                    <div class="m-pvx__item m-id">
                        <div class="u-id">ID: {{ item.ID }}</div>
                        <div class="u-meta" v-if="type !== '2'">跑速: {{ speedName }}</div>
                        <div class="u-meta" v-if="type !== '2'">饲料: {{ feedName }}</div>
                    </div>
                </div>
                <div class="m-right">
                    <div class="m-pvx__item m-attr m-basic-attr">
                        <div class="u-pvx-horse-title">基础属性</div>

                        <div v-if="basicAttrs.length" class="u-list">
                            <div class="u-attr" v-for="attr in basicAttrs" :key="attr.id">
                                <img class="u-attr-icon" style="cursor: default" :src="attr.iconUrl" :alt="attr.name" />
                                <div class="u-attr-info">
                                    <div class="u-attr-name" v-if="attr.name">
                                        {{ (attr.name || "") + (Number(attr.level) ? attr.level + "级" : "") }}
                                    </div>
                                    <div class="u-attr-desc">{{ attr.desc }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-data">无</div>
                    </div>
                    <div class="m-pvx__item m-attr m-special-attr">
                        <div class="u-pvx-horse-title">特殊属性</div>

                        <div class="title">特殊属性</div>
                        <div v-if="magicAttrs.length" class="u-list">
                            <div class="u-attr" v-for="(attr, index) in magicAttrs" :key="index">
                                <img class="u-attr-icon" :src="attr.iconUrl" :alt="attr.name" />

                                <div class="u-attr-info">
                                    <div class="u-attr-name" v-if="attr.name">
                                        {{ (attr.name || "") + (Number(attr.level) ? attr.level + "级" : "") }}
                                    </div>
                                    <div class="u-attr-desc">{{ attr.desc }}</div>
                                </div>
                            </div>
                        </div>
                        <div v-else class="no-data">无</div>
                    </div>
                </div>
            </div>
        </template>
        <!-- 捕获地图 -->
        <div v-if="originDatas.length" class="m-pvx-horse-catch" :class="isRobot ? 'is-robot' : ''">
            <div class="title">捕获地图</div>
            <!-- 地图组件 -->
            <horse-map :name="item.Name" :list="originDatas" :compact="isRobot" />
        </div>
        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="id" name="坐骑" type="item" :isRobot="isRobot"></pvx-user>
    </div>
</template>

<script>
import ItemIcon from "@/components/common/item_icon.vue";
import { getHorse, getHorses } from "@/service/horse";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import HorseCard from "@/components/horse/HorseCard";
import HorseMap from "@/components/horse/HorseMap.vue";
import PvxUser from "@/components/PvxUser.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";

import horseMapList from "@/assets/data/horse_map.json";
import horseSites from "@/assets/data/horse_sites.json";
import { __imgPath, __dataPath, __cdn } from "@/utils/config";
import { getHorseType, getHorseModeName, getHorseFeedName, getHorseSpeed, getHorseImgSrc } from "@/utils/horse";

export default {
    name: "Single",
    props: ["isRobot", "sourceId"],
    components: { HorseCard, HorseMap, PvxUser, ItemIcon, PvxSingleAdminDrop, PvxRobotTip },
    data() {
        return {
            loading: false,
            sameLoading: false,
            item: {},
            sameList: [],
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
                        arr.push({
                            mapId: mapId,
                            mapName: horseSites[mapId].mapName,
                            coordinates: horseSites[mapId].coordinates,
                        });
                    });
                }
                return arr;
            } else {
                return [];
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
        robotTitle() {
            let titlePrefix = this.item?.SubType === 15 ? "坐骑" : "";
            return titlePrefix + " · " + (this.item?.Name || "");
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
        getCdnImgUrl(id) {
            return `${__cdn}design/horse/std/${id}.png`;
        },
        goBack() {
            this.$router.push({ path: "/" });
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
                    if (this.typeName === "普通坐骑") {
                        name = res.data.Name.split("·")[0];
                    }
                    if (this.type !== "2" && name) {
                        this.getSameHorses(name);
                    }

                    document.title = `${this.item?.Name}` + this.$t("pages.common.appendTitle");
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
        getImgSrc(item) {
            return getHorseImgSrc(item, this.client, __imgPath + "homeland/", __imgPath + "horse/");
        },
        getLink,
    },
};
</script>

<style lang="less">
@import "~@/assets/css/horse/pc/single.less";
@import "~@/assets/css/common/wiki.less";

.m-robot__horse-header {
    .flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 75px;
    opacity: 1;

    .u-pvx-horse-title {
        font-size: 20px;
        .bold;
        color: #fff;
        .flex;
        align-items: center;
        gap: 5px;

        &.u-pvx-horse-title--level-2 {
            color: rgba(13, 192, 63, 1);
        }

        &.u-pvx-horse-title--level-3 {
            color: rgba(0, 133, 255, 1);
        }

        &.u-pvx-horse-title--level-4 {
            color: rgba(204, 70, 237, 1);
        }

        &.u-pvx-horse-title--level-5 {
            color: rgba(255, 168, 17, 1);
        }
    }

    .m-meta {
        margin-top: 4px;
        .flex;
        flex-wrap: wrap;
        align-items: center;
        gap: 4px;

        .u-meta {
            .r(4px);
            background: rgba(89, 89, 89, 1);
            padding: 0 4px;
            font-size: 10px;
            color: #fff;
            height: 15px;
            line-height: 15px;
            box-sizing: border-box;
        }
    }
}

.m-robot__horse-info {
    .flex;
    justify-content: space-between;
    gap: 10px;
    margin-top: 12px;

    .m-left {
        .flex;
        flex-direction: column;
        gap: 10px;
        flex: none;
        width: 120px;
    }

    .img-wrap {
        .size(100%, 120px);
        .r(4px);
        box-sizing: border-box;
        background: url("../../assets/img/horse/horse_item_bg_sm.jpg") no-repeat center center;
        background-size: cover;
        transition: all 0.5s;
    }

    .m-id {
        flex: 1;

        .u-id {
            color: rgba(255, 168, 17, 1);
        }
    }

    .m-right {
        flex: 1;
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, 1fr);

        .m-attr {
            min-width: 186px;

            .u-pvx-horse-title {
                font-size: 12px;
            }

            &.m-basic-attr .u-pvx-horse-title {
                color: rgba(255, 168, 17, 1);
            }

            &.m-special-attr .u-pvx-horse-title {
                color: rgba(204, 70, 237, 1);
            }

            .u-attr {
                .flex;
                align-items: center;
                gap: 4px;
                margin-top: 4px;
                width: 100%;
            }

            .u-attr-icon {
                .size(24px);
            }

            .u-attr-name {
                color: #fff;
            }

            .u-attr-desc {
                color: rgba(255, 255, 255, 0.5);
                .dbi;
                width: 135px;
                .nobreak;
            }
        }
    }
}
</style>
