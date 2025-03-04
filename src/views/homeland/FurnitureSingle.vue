<template>
    <div class="v-homeland-furniture" v-loading="loading">
        <div class="m-navigation">
            <el-button class="u-goback" size="medium" icon="el-icon-arrow-left" @click="goBack" plain
                >返回列表</el-button
            >
            <el-input placeholder="请输入家具名字搜索" v-model="search" class="u-input" @keyup.enter.native="goSearch">
                <el-button slot="append" icon="el-icon-search" @click="goSearch"></el-button>
            </el-input>
            <div class="u-links">
                <a v-if="other_id" class="u-link u-item" :href="getLink('item', item_id)" target="_blank"
                    ><i class="el-icon-collection-tag"></i>物品信息</a
                >
                <a v-if="achieve_id" class="u-link u-achievement" :href="getLink('cj', achieve_id)" target="_blank">
                    <i class="el-icon-trophy"></i>
                    成就信息
                </a>
            </div>
        </div>

        <div class="m-info-box">
            <div class="u-img">
                <img :src="formatImg(data.Path)" :alt="data.szName" />
            </div>

            <div class="u-info">
                <div class="u-info-title" :class="'quality_' + data.Quality">
                    {{ data.szName }}
                    <i class="u-interact" v-if="data.bInteract"></i>
                </div>
                <div class="u-attrs">
                    <span class="u-attr" v-if="data.Attribute1"
                        ><span class="u-label blue">观赏</span>{{ data.Attribute1 }}</span
                    >
                    <span class="u-attr" v-if="data.Attribute2"
                        ><span class="u-label pink">实用</span>{{ data.Attribute2 }}</span
                    >
                    <span class="u-attr" v-if="data.Attribute3"
                        ><span class="u-label yellow">坚固</span>{{ data.Attribute3 }}</span
                    >
                    <span class="u-attr" v-if="data.Attribute4"
                        ><span class="u-label green">风水</span>{{ data.Attribute4 }}</span
                    >
                    <span class="u-attr" v-if="data.Attribute5"
                        ><span class="u-label purple">趣味</span>{{ data.Attribute5 }}</span
                    >
                </div>
                <div class="u-metas">
                    <span class="u-meta"><span class="u-label">来源途径：</span>{{ data.szSource }}</span>
                    <span class="u-meta"><span class="u-label">园宅等级：</span>{{ data.LevelLimit }}级</span>
                    <span class="u-meta"><span class="u-label">摆放上限：</span>{{ data.MaxAmountPerLand }}</span>
                    <span class="u-meta u-meta-scale" v-if="data.szScaleRange"
                        ><span class="u-label">缩放大小：</span>
                        <span class="u-value">
                            <b v-for="item in scaleRange(data.szScaleRange)" :key="item">{{ item }}</b>
                        </span>
                    </span>
                    <span class="u-meta u-meta-dyes" v-if="color_list.length"
                        ><span class="u-label">染色选项：</span>
                        <span class="u-value">
                            <i
                                v-for="item in color_list"
                                :key="item"
                                class="u-dye"
                                :style="{ backgroundColor: `rgb(${item})` }"
                            ></i> </span
                    ></span>
                </div>

                <div class="m-buttons">
                    <!-- 收藏按钮 -->
                    <Fav class="u-collect" post-type="furniture" :post-id="id" :post-title="data && data.szName" />
                </div>
            </div>
        </div>

        <div class="m-extend" v-if="has_extend">
            <div class="m-extend-header">
                <img class="u-icon" svg-inline src="../../assets/img/achievement.svg" />
                <span class="u-txt">家具信息</span>
            </div>
            <div class="m-extend-content m-extend-desc" v-if="data.szTip">
                <div class="u-title"><i class="el-icon-star-on"></i>家具介绍</div>
                <div class="u-txt" v-html="description_filter(data.szTip)"></div>
            </div>
            <div class="m-extend-content m-extend-relation" v-if="setData">
                <div class="u-title">
                    <i class="el-icon-star-on"></i>{{ setData.szName
                    }}<el-rate class="u-star" v-model="setData.nStars" disabled></el-rate>
                </div>
                <furnitureSet :data="setData" />
            </div>
            <div class="m-extend-content m-extend-materials" v-if="data.szSource == '生活技能' && data.__manufactureID">
                <div class="u-title"><i class="el-icon-star-on"></i>合成材料</div>
                <furnitureMaterials :id="other_id" />
            </div>
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

        <!-- 评论 -->
        <div class="m-furniture-comment">
            <Comment :id="id" :category="type" order="desc" />
        </div>
    </div>
</template>

<script>
import furnitureSet from "@/components/homeland/furniture_set.vue";
import Wiki from "@/components/wiki/Wiki.vue";
import Comment from "@jx3box/jx3box-comment-ui/src/Comment.vue";
import furnitureMaterials from "@/components/homeland/furniture_materials.vue";

import { getLink } from "@jx3box/jx3box-common/js/utils";

import { getFurnitureDetail, getSetList, getFurnitureColor } from "@/service/furniture.js";
import { postStat } from "@jx3box/jx3box-common/js/stat.js";

export default {
    name: "FurnitureSingle",
    props: [],
    inject: ["__imgRoot"],
    components: {
        Wiki,
        Comment,
        furnitureSet,
        furnitureMaterials,
    },
    data: function () {
        return {
            type: "furniture",
            loading: false,
            data: "", // 家具数据
            setData: "",
            colorData: "", // 染色数据

            search: "",
        };
    },
    computed: {
        id: function () {
            return this.$route.params.id;
        },
        other_id: function () {
            return this.data?.__manufactureID;
        },
        item_id: function () {
            return "10_" + this.data?.__manufactureID;
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
    },
    watch: {
        id: function () {
            this.getData();
        },
    },
    methods: {
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

        scaleRange(str) {
            return str?.split(";");
        },

        goBack() {
            this.$router.push({ name: "list" });
        },

        goSearch() {
            this.$router.push({ name: "list", params: { search: this.search } });
        },
    },
    created: function () {
        this.getData();
    },
};
</script>
<style lang="less">
@import "~@/assets/css/homeland/single.less";
</style>
