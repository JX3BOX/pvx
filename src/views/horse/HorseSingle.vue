<template>
    <div class="p-pvx-horse-single p-pvx-horse-single--modern m-single-wrapper">
        <PvxPageShell class="m-pvx-horse-single-shell">
                <div class="m-pvx-horse-single-layout">
                    <PvxSurface class="m-pvx-horse-navigation" tag="nav" padding="small" radius="medium">
                        <PvxActionButton variant="light" @click="goBack">
                            <ArrowLeft />
                            {{ $t("pages.horse.single.ui.actions.back") }}
                        </PvxActionButton>
                        <PvxSingleAdminDrop />
                    </PvxSurface>

                    <PvxSurface class="m-pvx-horse-header" tag="header" padding="large">
                        <div class="m-pvx-horse-header__info">
                            <div class="m-pvx-horse-header__meta">
                                <span class="u-pvx-horse-eyebrow">
                                    {{ $t("pages.horse.single.ui.guideLabel") }}
                                </span>
                                <span class="u-pvx-horse-type">{{ displayType }}</span>
                            </div>
                            <h1 class="u-pvx-horse-page-title">{{ item.Name }}</h1>
                        </div>
                        <div class="m-pvx-horse-header__actions">
                            <PvxActionButton
                                class="u-pvx-horse-action"
                                :href="getLink('item', id)"
                                target="_blank"
                                rel="noopener noreferrer"
                                variant="light"
                            >
                                <CollectionTag />
                                {{ $t("pages.horse.single.ui.actions.item") }}
                            </PvxActionButton>
                        </div>
                        <div class="m-pvx-horse-guide-tip">
                            <!-- “坐骑/马具”是 QQ 机器人协议关键词，不随界面语言翻译。 -->
                            <PvxRobotTip
                                :type-name="type == 2 ? '马具' : '坐骑'"
                                :reply="item.Name"
                                variant="modern"
                                :quick-guide-text="$t('pages.horse.single.ui.robot.quickGuide')"
                                :copy-success-title="$t('pages.horse.single.ui.robot.copySuccess')"
                                :reply-prefix="$t('pages.horse.single.ui.robot.replyPrefix')"
                                :reply-suffix="$t('pages.horse.single.ui.robot.replySuffix')"
                                :copy-qq-label="$t('pages.horse.single.ui.robot.copyQq')"
                                :copy-command-label="$t('pages.horse.single.ui.robot.copyCommand')"
                            />
                        </div>
                    </PvxSurface>

            <PvxSurface class="m-pvx-horse-single-content" padding="medium" v-loading="loading">
                <!-- 主要信息 -->
                <div class="m-pvx-horse-main-info">
                    <div v-if="item.ID" class="m-pvx-horse-main-info__wrap">
                        <div class="m-pvx-horse-main-info__info">
                            <div class="u-pvx-horse-metas">
                                <div class="u-pvx-horse-meta">
                                    <span class="u-meta-label">{{ $t("pages.horse.single.ui.fields.id") }}</span>
                                    <span>{{ item.ID }}</span>
                                </div>
                                <div class="u-pvx-horse-meta">
                                    <span class="u-meta-label">{{ $t("pages.horse.single.ui.fields.quality") }}</span>
                                    <span>{{ item.Level }}</span>
                                </div>
                                <div v-if="type !== '2'" class="u-pvx-horse-meta">
                                    <span class="u-meta-label">{{ $t("pages.horse.single.ui.fields.speed") }}</span>
                                    <span>{{ speedName }}</span>
                                </div>
                                <div v-if="type !== '2'" class="u-pvx-horse-meta">
                                    <span class="u-meta-label">{{ $t("pages.horse.single.ui.fields.feed") }}</span>
                                    <span>{{ feedName }}</span>
                                </div>
                            </div>

                            <div class="u-pvx-horse-info-item u-pvx-horse-desc">
                                <div class="u-pvx-horse-title">{{ $t("pages.horse.single.ui.sections.basicAttrs") }}</div>
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
                                                        {{ attributeName(attr) }}
                                                    </div>
                                                    <div class="u-pvx-horse-attr-desc">{{ attr.desc }}</div>
                                                </div>
                                            </template>
                                            <img class="u-pvx-horse-attr-icon" style="cursor: default" :src="attr.iconUrl"
                                                :alt="attr.name" />
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div v-else class="u-pvx-horse-no-data">{{ $t("pages.horse.single.ui.emptyValue") }}</div>
                            </div>
                            <div class="u-pvx-horse-info-item u-pvx-horse-desc">
                                <div class="u-pvx-horse-title">{{ $t("pages.horse.single.ui.sections.magicAttrs") }}</div>
                                <div v-if="magicAttrs.length" class="u-pvx-horse-attr-list">
                                    <div class="u-pvx-horse-attr" v-for="(attr, index) in magicAttrs" :key="index">
                                        <el-tooltip trigger="hover" placement="top">
                                            <template #content>
                                                <div class="u-pvx-horse-attr-pop">
                                                    <div class="u-pvx-horse-attr-name" v-if="attr.name">
                                                        {{ attributeName(attr) }}
                                                    </div>
                                                    <div class="u-pvx-horse-attr-desc">{{ attr.desc }}</div>
                                                </div>
                                            </template>
                                            <img class="u-pvx-horse-attr-icon" :src="attr.iconUrl" :alt="attr.name" />
                                        </el-tooltip>
                                    </div>
                                </div>
                                <div v-else class="u-pvx-horse-no-data">{{ $t("pages.horse.single.ui.emptyValue") }}</div>
                            </div>
                        </div>
                        <div class="m-pvx-horse-main-info__img" :class="`u-quality-bg--` + item.Quality">
                            <el-image v-if="item.SubType === 15" :src="getCdnImgUrl(item.ID)" class="u-image">
                            </el-image>
                            <item-icon v-else class="u-image" :item_id="String(item.ItemID)" :isLink="false" :size="150"
                                :onlyIcon="true"></item-icon>
                        </div>
                    </div>
                    <PvxEmptyState
                        v-else
                        illustrated
                        :title="$t('pages.horse.single.ui.empty.title')"
                        :description="$t('pages.horse.single.ui.empty.description')"
                    />
                </div>
                <section v-if="originDatas.length" class="m-pvx-horse-map-section">
                    <PvxSectionHeader
                        class="m-pvx-horse-section-header"
                        :title="$t('pages.horse.single.ui.sections.map')"
                        :description="$t('pages.horse.single.ui.sections.mapDescription')"
                        level="h2"
                    >
                        <template #icon><Location /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-horse-detail-map">
                        <horse-map :name="item.Name" :list="originDatas" />
                    </div>
                </section>
            </PvxSurface>
                <!-- 同类坐骑 - 普通坐骑 -->
                <PvxSurface v-if="sameList.length" class="m-pvx-horse-same-list" padding="medium" v-loading="sameLoading">
                    <PvxSectionHeader
                        class="m-pvx-horse-section-header"
                        :title="$t('pages.horse.single.ui.sections.similar')"
                        :description="$t('pages.horse.single.ui.sections.similarDescription')"
                        level="h2"
                    >
                        <template #icon><CopyDocument /></template>
                    </PvxSectionHeader>
                    <div class="m-pvx-horse-list">
                        <HorseCard :item="item" v-for="item in sameList" :key="item.ItemID"
                            @click="getHorse(item.ItemID)"></HorseCard>
                    </div>
                </PvxSurface>

                <pvx-user
                    class="m-pvx-horse-community"
                    :id="id"
                    :name="$t('pages.horse.single.ui.typeName')"
                    type="item"
                    i18n-key-prefix="pages.horse.single.ui.wiki"
                />
                </div>
            </PvxPageShell>
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
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, CollectionTag, CopyDocument, Location } from "@element-plus/icons-vue";

import horseMapList from "@/assets/data/horse_map.json";
import horseSites from "@/assets/data/horse_sites.json";
import { __imgPath, __dataPath, __cdn } from "@/utils/config";
import { getHorseType, getHorseModeName, getHorseFeedName, getHorseSpeed, getHorseImgSrc } from "@/utils/horse";

export default {
    name: "Single",
    components: {
        HorseCard,
        HorseMap,
        PvxUser,
        ItemIcon,
        PvxSingleAdminDrop,
        PvxRobotTip,
        PvxActionButton,
        PvxEmptyState,
        PvxPageShell,
        PvxSectionHeader,
        PvxSurface,
        ArrowLeft,
        CollectionTag,
        CopyDocument,
        Location,
    },
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
            return this.$route.params.id;
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
        localizedTypeName() {
            let key = "gear";
            if (this.item.SubType === 15) {
                key = this.item.DetailType === 0 ? "normal" : "fun";
            } else if (this.item.SubType === 23) {
                key = ["headgear", "saddle", "feet", "ornament"][this.item.DetailType] || "gear";
            }
            return this.$t(`pages.horse.ui.types.${key}`);
        },
        modeName() {
            return getHorseModeName(this.item);
        },
        localizedModeName() {
            return this.modeName === "单骑" ? this.$t("pages.horse.ui.rideModes.solo") : this.modeName;
        },
        feedName() {
            return getHorseFeedName(this.item);
        },
        speedName() {
            return getHorseSpeed(this.item);
        },
        displayType() {
            let type = this.localizedTypeName;
            if (this.type !== "2") {
                type += ` · ${this.localizedModeName}`;
                if (this.item.GetType) {
                    type += ` · ${this.item.GetType}`;
                }
            }
            return type;
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
        attributeName(attr) {
            const level = Number(attr.level)
                ? this.$t("pages.horse.ui.attributeLevel", { level: attr.level })
                : "";
            return `${attr.name || ""}${level}`;
        },
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
@import "~@/assets/css/modules/horse-detail-theme.less";
</style>
