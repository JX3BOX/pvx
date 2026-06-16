<template>
    <div class="p-furniture-single m-single-wrapper" :class="{ 'is-robot': isRobot }" v-loading="loading">
        <template v-if="!isRobot">
        <div class="m-navigation">
            <div class="u-goback" @click="goBack">返回列表</div>
            <PvxSingleAdminDrop></PvxSingleAdminDrop>
        </div>

        <div class="m-furniture-content">
            <div class="u-info">
                <div class="u-info-title" :class="'quality_' + data.Quality">
                    {{ data.szName }}
                    <i class="u-interact" v-if="data.bInteract"></i>
                </div>
                <!-- <div class="u-attrs">
                    <span class="u-attr" v-if="data.Attribute1"><span class="u-label blue">观赏</span>{{ data.Attribute1 }}</span>
                    <span class="u-attr" v-if="data.Attribute2"><span class="u-label pink">实用</span>{{ data.Attribute2 }}</span>
                    <span class="u-attr" v-if="data.Attribute3"><span class="u-label yellow">坚固</span>{{ data.Attribute3 }}</span>
                    <span class="u-attr" v-if="data.Attribute4"><span class="u-label green">风水</span>{{ data.Attribute4 }}</span>
                    <span class="u-attr" v-if="data.Attribute5"><span class="u-label purple">趣味</span>{{ data.Attribute5 }}</span>
                </div> -->
                <div class="u-attrs" v-if="data.Record || data.Record === 0">
                    <span class="u-attr"
                        ><span class="u-label score">装修评分</span>{{ data.Record }}</span
                    >
                </div>
                <div class="u-metas">
                    <span class="u-meta"
                        ><img src="../../assets/img/furniture/origin.svg" svg-inline /><span class="u-label"
                            >来源途径：</span
                        >{{ data.szSource }}</span
                    >
                    <span v-if="data.LevelLimit" class="u-meta"
                        ><img src="../../assets/img/furniture/level.svg" svg-inline /><span class="u-label"
                            >摆放等级：</span
                        >{{ data.LevelLimit }}级</span
                    >
                    <span v-if="data.MaxAmountPerLand" class="u-meta"
                        ><img src="../../assets/img/furniture/limit.svg" svg-inline /><span class="u-label"
                            >摆放上限：</span
                        >{{ data.MaxAmountPerLand }}</span
                    >
                    <span class="u-meta u-meta-scale" v-if="data.szScaleRange"
                        ><img src="../../assets/img/furniture/scale.svg" svg-inline /><span class="u-label"
                            >缩放大小：</span
                        >
                        <span class="u-value">
                            <b v-for="(item, index) in scaleRange(data.szScaleRange)" :key="index">{{ item }}</b>
                        </span>
                    </span>
                    <span class="u-meta u-meta-dyes" v-if="color_list.length"
                        ><img src="../../assets/img/furniture/level.svg" svg-inline /><span class="u-label"
                            >染色选项：</span
                        >
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

                <div class="m-buttons">
                    <a v-if="other_id" class="u-link u-item" :href="getLink('item', item_id)" target="_blank"
                        ><i class="el-icon-collection-tag"></i>物品信息</a
                    >
                    <a v-if="achieve_id" class="u-link u-achievement" :href="getLink('cj', achieve_id)" target="_blank">
                        <i class="el-icon-trophy"></i>
                        成就信息
                    </a>
                    <!-- 收藏按钮 -->
                    <Fav
                        class="u-collect"
                        post-type="furniture"
                        :post-id="id"
                        :post-title="data && data.szName"
                        :author_id="fav_author_id"
                    />
                </div>
            </div>
            <div class="u-img">
                <div class="u-img-wrap">
                    <img :src="formatImg(data.Path)" :alt="data.szName" />
                </div>
            </div>
        </div>

        <div class="m-extend" v-if="has_extend">
            <div class="m-extend-content m-extend-relation" v-if="setData">
                <div class="u-title">
                    <div>{{ setData.szName }}</div>
                    <el-rate class="u-star" v-model="setData.nStars" disabled></el-rate>
                </div>
                <div class="u-desc">
                    <div v-if="data.szTip" class="u-txt" v-html="description_filter(data.szTip)"></div>
                    <div v-else class="u-txt">暂无介绍</div>
                </div>

                <!--                <list-cross v-if="setData.furnitures.length" :width="30" :list="setData.furnitures">-->
                <div v-if="setData.furnitures.length" class="u-furniture-list">
                    <furnitureSet
                        v-for="(item, index) in setData.furnitures"
                        :data="item"
                        :category="category"
                        :key="index"
                    />
                </div>
                <!--                </list-cross>-->
            </div>
            <div class="m-extend-content m-extend-materials" v-if="data.szSource == '生活技能' && data.__manufactureID">
                <div class="u-title">合成材料</div>
                <furnitureMaterials :id="other_id" />
            </div>
        </div>

        <!-- 攻略 -->
        <div class="m-furniture-wiki" v-if="wiki_source_id">
            <Wiki
                :key="wiki_source_key"
                :source_type="wiki_source_type"
                :source_id="wiki_source_id"
                :type="type"
                :id="id"
                :title="wiki_title"
                :source_title="wiki_source_title"
            ></Wiki>
        </div>
        <WikiComments
            v-if="comment_source_id"
            :key="comment_source_key"
            :type="comment_source_type"
            :source-id="String(comment_source_id)"
        />
        </template>
        <template v-else>
            <div class="m-pvx__item m-pvx-furniture-robot__header">
                <div class="m-title">
                    <div class="u-title" :class="'quality_' + data.Quality">家具 · {{ data.szName || id }}</div>
                    <div class="m-meta">
                        <span class="u-meta">ID: {{ id }}</span>
                        <span class="u-meta" v-if="furniture_type">{{ furniture_type }}</span>
                        <span class="u-meta" v-if="data.szSource">{{ data.szSource }}</span>
                    </div>
                </div>
            </div>

            <div class="m-pvx-furniture-robot__body">
                <div class="m-pvx__item m-pvx-furniture-robot__attrs">
                    <div class="u-title">家具属性</div>
                    <div class="u-attrs" v-if="furniture_attrs.length">
                        <span class="u-attr" v-for="item in furniture_attrs" :key="item.key">
                            <span class="u-label" :class="item.className">{{ item.label }}</span>
                            {{ item.value }}
                        </span>
                    </div>
                    <div class="u-empty" v-else>暂无属性</div>
                </div>

                <div class="m-pvx__item m-pvx-furniture-robot__info">
                    <div class="u-title">摆放信息</div>
                    <div class="u-list">
                        <div class="u-item" v-if="data.LevelLimit">摆放等级：{{ data.LevelLimit }}级</div>
                        <div class="u-item" v-if="data.MaxAmountPerLand">摆放上限：{{ data.MaxAmountPerLand }}</div>
                        <div class="u-item" v-if="data.szScaleRange">
                            缩放大小：
                            <span class="u-scale">
                                <b v-for="(item, index) in scaleRange(data.szScaleRange)" :key="index">{{ item }}</b>
                            </span>
                        </div>
                        <div class="u-item" v-if="color_list.length">
                            染色选项：
                            <span class="u-dyes">
                                <i
                                    v-for="item in color_list"
                                    :key="item"
                                    class="u-dye"
                                    :style="{ backgroundColor: `rgb(${item})` }"
                                ></i>
                            </span>
                        </div>
                        <div class="u-item" v-if="data.bInteract">可交互家具</div>
                    </div>
                </div>

                <div class="m-pvx__item m-pvx-furniture-robot__source">
                    <div class="u-title">来源途径</div>
                    <div class="u-source">{{ data.szSource || "暂无来源" }}</div>
                </div>
            </div>

            <div class="m-pvx__item m-pvx-furniture-robot__set" v-if="setData">
                <div class="u-title">套组 · {{ setData.szName }}</div>
                <div class="u-desc" v-if="data.szTip" v-html="description_filter(data.szTip)"></div>
                <div class="u-set-list" v-if="set_furnitures.length">
                    <div
                        class="u-set-item"
                        :class="{ 'is-current': item.dwID == id }"
                        v-for="item in set_furnitures"
                        :key="item.ID || item.dwID"
                    >
                        <div class="u-set-img">
                            <img v-if="getFurnitureImg(item)" :src="getFurnitureImg(item)" :alt="item.szName" />
                        </div>
                        <div class="u-set-name">{{ item.szName }}</div>
                        <div class="u-set-type">{{ getType(item) }}</div>
                    </div>
                </div>
            </div>
            <div class="m-pvx__item m-pvx-furniture-robot__set" v-else-if="data.szTip">
                <div class="u-title">家具说明</div>
                <div class="u-desc" v-html="description_filter(data.szTip)"></div>
            </div>

            <PvxUser
                v-if="robot_wiki_id"
                :id="robot_wiki_id"
                :name="robot_wiki_name"
                :type="robot_wiki_type"
                :is-robot="true"
            />
        </template>
    </div>
</template>

<script>
import furnitureSet from "@/components/furniture/furniture_set.vue";
import Wiki from "@/components/wiki/Wiki.vue";
import furnitureMaterials from "@/components/furniture/furniture_materials.vue";
import Fav from "@jx3box/jx3box-ui/src/interact/Fav.vue";
import PvxUser from "@/components/PvxUser.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";

import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import User from "@jx3box/jx3box-common/js/user";

import { getFurnitureDetail, getSetList, getFurnitureColor } from "@/service/furniture.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";
// import ListCross from "@/components/ListCross.vue";
import { getFurnitureCategory } from "@/service/homeland.js";
import { formatFurnitureImg, getFurnitureType } from "@/utils/furniture";
import { __imgPath } from "@/utils/config";
import WikiComments from "@jx3box/jx3box-ui/src/wiki/WikiComments";

export default {
    name: "FurnitureSingle",
    props: {
        isRobot: {
            type: Boolean,
            default: false,
        },
        sourceId: {
            type: [String, Number],
            default: "",
        },
    },
    inject: {
        __imgRoot: {
            default: __imgPath + "homeland/",
        },
    },
    components: {
        Wiki,
        furnitureSet,
        furnitureMaterials,
        Fav,
        PvxUser,
        PvxSingleAdminDrop,
        // ListCross,
        WikiComments,
    },
    data: function () {
        return {
            type: "furniture",
            loading: false,
            data: "", // 家具数据
            setData: "",
            colorData: "", // 染色数据
            category: {},
            imagesLoaded: false,
        };
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
        id: function () {
            return ~~(this.$route.params.id || this.sourceId);
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
        wiki_source_key: function () {
            return `${this.wiki_source_type}-${this.wiki_source_id}`;
        },
        wiki_title: function () {
            if (this.wiki_source_type === "item") return "物品攻略";
            if (this.wiki_source_type === "achievement") return "成就攻略";
            return "";
        },
        wiki_source_title: function () {
            return this.wiki_source_type === "achievement" ? this.setData?.szName || this.data?.szName : this.data?.szName;
        },
        comment_source_type: function () {
            return this.wiki_source_type;
        },
        comment_source_id: function () {
            return this.wiki_source_id;
        },
        comment_source_key: function () {
            return `${this.comment_source_type}-${this.comment_source_id}`;
        },
        robot_wiki_type: function () {
            return this.wiki_source_type;
        },
        robot_wiki_id: function () {
            return this.wiki_source_id;
        },
        robot_wiki_name: function () {
            return this.robot_wiki_type === "achievement" ? "成就" : "物品";
        },
        fav_author_id: function () {
            return Number(this.data?.user_id || this.data?.author_id || User.getInfo().uid) || "";
        },
        furniture_type: function () {
            if (!this.data || !Object.keys(this.category).length) return "";
            return getFurnitureType(this.data, this.category);
        },
        furniture_attrs: function () {
            return [
                { key: "view", label: "观赏", value: this.data?.Attribute1, className: "blue" },
                { key: "practical", label: "实用", value: this.data?.Attribute2, className: "pink" },
                { key: "strong", label: "坚固", value: this.data?.Attribute3, className: "yellow" },
                { key: "fengshui", label: "风水", value: this.data?.Attribute4, className: "green" },
                { key: "interest", label: "趣味", value: this.data?.Attribute5, className: "purple" },
            ].filter((item) => item.value);
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
        set_furnitures: function () {
            return this.setData?.furnitures || [];
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
                    if (this.isRobot && !this.robot_wiki_id) this.preloadRobotImages();
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
        getFurnitureImg(data) {
            return data?.Path ? this.formatImg(data.Path) : iconLink(data?.nRepresentID, this.client);
        },
        getType(data) {
            return getFurnitureType(data, this.category);
        },

        scaleRange(str) {
            return str?.split(";");
        },
        preloadRobotImages() {
            this.$nextTick(() => {
                const images = Array.from(this.$el?.querySelectorAll("img") || []);
                if (!images.length) {
                    this.setGlobalReady();
                    return;
                }

                Promise.all(
                    images.map((img) => {
                        if (img.complete) return Promise.resolve();
                        return new Promise((resolve) => {
                            img.onload = img.onerror = resolve;
                        });
                    })
                ).then(() => this.setGlobalReady());
            });
        },
        setGlobalReady() {
            if (this.imagesLoaded) return;
            this.imagesLoaded = true;
            window.__READY__ = true;
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
</style>
