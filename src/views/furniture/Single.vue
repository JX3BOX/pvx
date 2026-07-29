<template>
    <div class="p-furniture-single m-single-wrapper" v-loading="loading">
        <PvxPageShell class="p-pvx-furniture-single--modern">
        <div class="m-pvx-furniture-single-layout">
            <PvxSurface class="m-pvx-furniture-navigation" tag="nav" padding="small" radius="medium">
                <PvxActionButton variant="light" @click="goBack">
                    <ArrowLeft />
                    {{ $t("pages.furniture.ui.back") }}
                </PvxActionButton>
                <PvxSingleAdminDrop></PvxSingleAdminDrop>
            </PvxSurface>

            <PvxSurface class="m-pvx-furniture-header" tag="header" padding="large">
                <div class="m-pvx-furniture-header__info">
                    <div class="m-pvx-furniture-header__meta">
                        <span class="u-pvx-furniture-eyebrow">{{ $t("pages.furniture.ui.guideLabel") }}</span>
                        <span v-if="furniture_type" class="u-pvx-furniture-type">{{ furniture_type }}</span>
                    </div>
                    <h1 class="u-pvx-furniture-page-title" :class="'quality_' + data.Quality">
                        {{ data.szName }}
                        <i class="u-interact" v-if="data.bInteract"></i>
                    </h1>
                </div>
                <div class="m-pvx-furniture-header__actions">
                    <PvxActionButton
                        v-if="other_id"
                        class="u-pvx-furniture-action"
                        :href="getLink('item', item_id)"
                        target="_blank"
                        variant="light"
                    >
                        <CollectionTag />
                        {{ $t("pages.furniture.ui.itemInfo") }}
                    </PvxActionButton>
                    <PvxActionButton
                        v-if="achieve_id"
                        class="u-pvx-furniture-action"
                        :href="getLink('cj', achieve_id)"
                        target="_blank"
                        variant="light"
                    >
                        <Trophy />
                        {{ $t("pages.furniture.ui.achievementInfo") }}
                    </PvxActionButton>
                    <Fav
                        class="u-collect"
                        post-type="furniture"
                        :post-id="id"
                        :post-title="data && data.szName"
                        :author_id="fav_author_id"
                    />
                </div>
            </PvxSurface>

        <PvxSurface class="m-furniture-content" padding="medium">
            <div class="u-img">
                <div class="u-img-wrap">
                    <img :src="formatImg(data.Path)" :alt="data.szName" />
                </div>
            </div>
            <div class="u-info">
                <div class="m-pvx-furniture-summary">
                    <span class="u-summary-item">
                        <em>{{ $t("pages.furniture.ui.id") }}</em>
                        {{ id }}
                    </span>
                    <span v-if="furniture_type" class="u-summary-item">
                        <em>{{ $t("pages.furniture.ui.category") }}</em>
                        {{ furniture_type }}
                    </span>
                    <span v-if="data.Record || data.Record === 0" class="u-summary-item">
                        <em>{{ $t("pages.furniture.ui.score") }}</em>
                        {{ data.Record }}
                    </span>
                </div>
                <div class="u-info-title">
                    {{ $t("pages.furniture.ui.basicInfo") }}
                </div>
                <div class="u-attrs" v-if="furniture_attrs.length">
                    <span class="u-attr" v-for="item in furniture_attrs" :key="item.key"
                        ><span class="u-label" :class="item.className">{{ item.label }}</span>{{ item.value }}</span
                    >
                </div>
                <div class="u-info-title u-info-title--placement">
                    {{ $t("pages.furniture.ui.placementInfo") }}
                </div>
                <div class="u-metas">
                    <span class="u-meta">
                        <span class="u-label">{{ $t("pages.furniture.ui.source") }}</span>
                        <span class="u-meta-value">{{ source_text }}</span>
                    </span>
                    <span v-if="data.LevelLimit" class="u-meta">
                        <span class="u-label">{{ $t("pages.furniture.ui.placementLevel") }}</span>
                        <span class="u-meta-value">
                            {{ $t("pages.furniture.ui.levelValue", { level: data.LevelLimit }) }}
                        </span>
                    </span>
                    <span v-if="data.MaxAmountPerLand" class="u-meta">
                        <span class="u-label">{{ $t("pages.furniture.ui.placementLimit") }}</span>
                        <span class="u-meta-value">{{ data.MaxAmountPerLand }}</span>
                    </span>
                    <span class="u-meta u-meta-scale" v-if="data.szScaleRange">
                        <span class="u-label">{{ $t("pages.furniture.ui.scale") }}</span>
                        <span class="u-value">
                            <b v-for="(item, index) in scaleRange(data.szScaleRange)" :key="index">{{ item }}</b>
                        </span>
                    </span>
                    <span class="u-meta u-meta-dyes" v-if="color_list.length">
                        <span class="u-label">{{ $t("pages.furniture.ui.dyes") }}</span>
                        <span class="u-value">
                            <i
                                v-for="item in color_list"
                                :key="item"
                                class="u-dye"
                                :style="{ backgroundColor: `rgb(${item})` }"
                            ></i>
                        </span>
                    </span>
                </div>
            </div>
        </PvxSurface>

        <div class="m-extend" v-if="has_extend">
            <PvxSurface class="m-extend-content m-extend-relation" v-if="setData" padding="medium">
                <PvxSectionHeader
                    :title="setData.szName"
                    :description="$t('pages.furniture.ui.setDescription')"
                    level="h2"
                    class="m-pvx-furniture-section-header"
                >
                    <template #icon><Collection /></template>
                    <template #action>
                        <el-rate class="u-star" v-model="setData.nStars" disabled></el-rate>
                    </template>
                </PvxSectionHeader>
                <div class="u-desc">
                    <div v-if="data.szTip" class="u-txt" v-html="description_filter(data.szTip)"></div>
                    <div v-else class="u-txt">{{ $t("pages.furniture.ui.noIntroduction") }}</div>
                </div>

                <!--                <list-cross v-if="setData.furnitures.length" :width="30" :list="setData.furnitures">-->
                <div v-if="setData.furnitures.length" class="u-furniture-list">
                    <furnitureSet
                        v-for="(item, index) in setData.furnitures"
                        :data="item"
                        :category="category"
                        :key="index"
                        variant="modern"
                        :current-id="id"
                    />
                </div>
                <!--                </list-cross>-->
            </PvxSurface>
            <PvxSurface
                class="m-extend-content m-extend-materials"
                v-if="data.szSource == '生活技能' && data.__manufactureID"
                padding="medium"
            >
                <PvxSectionHeader
                    :title="$t('pages.furniture.ui.materials')"
                    :description="$t('pages.furniture.ui.materialsDescription')"
                    level="h2"
                    class="m-pvx-furniture-section-header"
                >
                    <template #icon><Tools /></template>
                </PvxSectionHeader>
                <furnitureMaterials :id="other_id" />
            </PvxSurface>
        </div>

        <PvxUser
            v-if="wiki_source_id"
            :key="community_key"
            class="m-pvx-furniture-community"
            :id="wiki_source_id"
            :name="community_name"
            :type="wiki_source_type"
            i18n-key-prefix="pages.furniture.ui.wiki"
        />
        </div>
        </PvxPageShell>
    </div>
</template>

<script>
import furnitureSet from "@/components/furniture/furniture_set.vue";
import furnitureMaterials from "@/components/furniture/furniture_materials.vue";
import Fav from "@jx3box/jx3box-ui/src/interact/Fav.vue";
import PvxUser from "@/components/PvxUser.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, Collection, CollectionTag, Tools, Trophy } from "@element-plus/icons-vue";

import { getLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";

import { getFurnitureDetail, getSetList, getFurnitureColor } from "@/service/furniture.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
// import ListCross from "@/components/ListCross.vue";
import { getFurnitureCategory } from "@/service/homeland.js";
import { formatFurnitureImg, getFurnitureType } from "@/utils/furniture";
import { __imgPath } from "@/utils/config";

const HOMELAND_COIN_SOURCE = "\u56ed\u5b85\u5e01";

export default {
    name: "FurnitureSingle",
    inject: {
        __imgRoot: {
            default: __imgPath + "homeland/",
        },
    },
    components: {
        furnitureSet,
        furnitureMaterials,
        Fav,
        PvxUser,
        PvxSingleAdminDrop,
        PvxPageShell,
        PvxActionButton,
        PvxSectionHeader,
        PvxSurface,
        ArrowLeft,
        Collection,
        CollectionTag,
        Tools,
        Trophy,
        // ListCross,
    },
    data: function () {
        return {
            type: "furniture",
            loading: false,
            data: "", // 家具数据
            setData: "",
            colorData: "", // 染色数据
            category: {},
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
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
        wiki_source_type: function () {
            if (!this.data) return "";
            if (this.other_id) return "item";
            if (this.achieve_id) return "achievement";
            return "";
        },
        wiki_source_id: function () {
            if (!this.data) return "";
            if (this.other_id) return this.item_id;
            if (this.achieve_id) return this.achieve_id;
            return "";
        },
        community_key: function () {
            return `${this.wiki_source_type}-${this.wiki_source_id}`;
        },
        community_name: function () {
            return this.wiki_source_type === "achievement"
                ? this.$t("pages.furniture.ui.achievementTypeName")
                : this.$t("pages.furniture.ui.itemTypeName");
        },
        fav_author_id: function () {
            return Number(this.data?.user_id || this.data?.author_id || User.getInfo().uid) || "";
        },
        is_architecture_cost_visible: function () {
            const cost = this.data?.Architecture;
            return this.data?.szSource === HOMELAND_COIN_SOURCE && ![undefined, null, ""].includes(cost);
        },
        source_text: function () {
            if (this.is_architecture_cost_visible) return `${this.data.szSource}（${this.data.Architecture}）`;
            return this.data?.szSource || "";
        },
        furniture_type: function () {
            if (!this.data || !Object.keys(this.category).length) return "";
            return getFurnitureType(this.data, this.category);
        },
        furniture_attrs: function () {
            const hasAttrValue = (value) => ![undefined, null, ""].includes(value);
            const useDefaultAttrs =
                Number(this.data?.nFurnitureType) === 2 &&
                !this.data?.Attribute1 &&
                !this.data?.Attribute2 &&
                !this.data?.Attribute3 &&
                !this.data?.Attribute4 &&
                !this.data?.Attribute5;

            return [
                { key: "view", label: this.$t("pages.furniture.ui.attrs.view"), value: useDefaultAttrs ? 1 : this.data?.Attribute1, className: "blue" },
                { key: "practical", label: this.$t("pages.furniture.ui.attrs.practical"), value: useDefaultAttrs ? 1 : this.data?.Attribute2, className: "pink" },
                { key: "strong", label: this.$t("pages.furniture.ui.attrs.strong"), value: useDefaultAttrs ? 1 : this.data?.Attribute3, className: "yellow" },
                { key: "fengshui", label: this.$t("pages.furniture.ui.attrs.fengshui"), value: useDefaultAttrs ? 1 : this.data?.Attribute4, className: "green" },
                { key: "interest", label: this.$t("pages.furniture.ui.attrs.interest"), value: useDefaultAttrs ? 1 : this.data?.Attribute5, className: "purple" },
            ].filter((item) => hasAttrValue(item.value));
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
    },
    watch: {
        id: function () {
            this.getData();
        },
    },
    methods: {
        getCategory() {
            getFurnitureCategory().then((res) => {
                this.category = res?.data || {};
            });
        },
        // 数据加载
        // ==============
        getData() {
            this.loading = true;
            this.data = "";
            this.setData = "";
            this.colorData = "";
            getFurnitureDetail(this.id)
                .then((res) => {
                    this.data = res.data;

                    document.title = `${this.data.szName} ${this.$t("pages.common.appendTitle")}`;

                    // 发送统计
                    postStat(this.type, this.id);
                })
                .then(() => {
                    const tasks = [];
                    if (this.represent_id) tasks.push(this.getColorData());
                    if (this.set_id) tasks.push(this.getSetData());
                    return Promise.all(tasks);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getColorData() {
            return getFurnitureColor(this.represent_id).then((res) => {
                this.colorData = res.data;
            });
        },
        getSetData() {
            return getSetList(this.set_id).then((res) => {
                this.setData = res.data;
            });
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
            return formatFurnitureImg(link, this.__imgRoot || __imgPath + "homeland/", this.client);
        },
        scaleRange(str) {
            return str?.split(";");
        },

        goBack() {
            this.$router.push({ name: "furniture" });
        },
    },
    created: function () {
        this.getCategory();
        this.getData();
    },
};
</script>
<style lang="less">
@import "~@/assets/css/furniture/pc/single.less";
@import "~@/assets/css/modules/furniture-detail-theme.less";
</style>
