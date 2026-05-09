<template>
    <div class="m-pvx-face-new-data">
        <div class="m-pvx-face-list-mobile__tabs">
            <div class="u-tab_item" v-for="(item, index) in tablist" :key="index"
                :class="{ 'is-active': active == item.value }" @click="active = item.value">
                {{ item.label }}
            </div>
        </div>
        <div class="c-facedat-preivew">
            <div class="c-facedat-group" v-for="category in boneCategories" :key="category.tabValue"
                v-show="active === category.tabValue">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(category.data)" :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <ul class="u-list u-new"
                        v-for="(subItem, itemIndex) in Object.keys(category.data[item])" :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in category.data[item].root" :key="key + i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :model-value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="localFacedata.tBone[key.BoneType]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in category.data[item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :model-value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="localFacedata.tBone[key.BoneType]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
            <div class="c-facedat-group" id="decals" v-show="active === 'decals'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_decal_group['妆容'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <div class="u-decals" v-for="(subItem, itemIndex) in new_decal_group['妆容'][item]" :key="itemIndex">
                        <div v-if="facedata.tDecal[subItem.DecalsType].bUse" class="u-decals-box">
                            <div class="u-price">
                                <i class="el-icon-coin"></i>
                                {{
                                    decalDb.getDecalPrice(
                                        subItem.DecalsType,
                                        facedata.tDecal[subItem.DecalsType]["nShowID"],
                                        true
                                    )
                                }}
                                通宝
                            </div>
                            <div class="u-title">
                                <img class="u-pic" :src="decalDb.getDecalIcon(
                                    subItem.DecalsType,
                                    facedata.tDecal[subItem.DecalsType]['nShowID'],
                                    true
                                )
                                    " />
                                {{
                                    decalDb.getDecalName(
                                        subItem.DecalsType,
                                        facedata.tDecal[subItem.DecalsType]["nShowID"],
                                        true
                                    )
                                }}
                                <span class="u-dname"> ({{ facedata.tDecal[subItem.DecalsType].nColorID }})</span>
                            </div>
                            <div class="u-decals-params-box">
                                <div class="u-decals-params">
                                    <span>{{ subItem.Name1 }}</span>
                                    <span>{{ facedata.tDecal[subItem.DecalsType].fValue1.toFixed(2) }}</span>
                                </div>
                                <div class="u-decals-params" v-if="!subItem.bValueXY">
                                    <template v-if="subItem.bShowScroll2">
                                        <span>{{ subItem.Name2 }}</span>
                                        <span>{{ facedata.tDecal[subItem.DecalsType].fValue2.toFixed(2) }}</span>
                                    </template>
                                </div>
                                <div class="u-decals-params" v-if="!subItem.bValueXY">
                                    <template v-if="subItem.bShowScroll3">
                                        <span>{{ subItem.Name3 }}</span>
                                        <span>{{ facedata.tDecal[subItem.DecalsType].fValue3.toFixed(2) }}</span>
                                    </template>
                                </div>
                                <div class="u-decals-params" v-if="subItem.bValueXY">
                                    <span>X坐标</span>
                                    <span>{{ facedata.tDecal[subItem.DecalsType].fValue3.toFixed(2) }}</span>
                                </div>
                                <div class="u-decals-params" v-if="subItem.bValueXY">
                                    <span>Y坐标</span>
                                    <span>{{ facedata.tDecal[subItem.DecalsType].fValue3.toFixed(2) }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="m-price-all">
                    <span class="u-title">总计：</span>
                    <span class="u-total"><i class="el-icon-coin"></i>
                        <b>{{ decalDb.getTotalPrice(facedata, true) }}</b> 通宝</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Slider from "@jx3box/jx3box-facedat/src/Slider.vue";
import new_face_dict from "@jx3box/jx3box-facedat/assets/data/newface/ui.json";
import new_decal_group from "@jx3box/jx3box-facedat/assets/data/newface/decal.json";
import new_decal_type from "@jx3box/jx3box-facedat/assets/data/newface/decal_v2.json";
import { cloneDeep } from "lodash";

const CATEGORY_MAP = {
    contour: "轮廓",
    eyebrow: "眉毛",
    eye: "眼部",
    nose: "鼻子",
    mouth: "嘴部",
};

export default {
    name: "NewFace",
    props: ["facedata", "lock", "decalDb", "body_type", "clean"],
    components: {
        Slider,
    },
    data() {
        return {
            localFacedata: {
                tBone: {},
                tDecal: {},
            },
            tab_type: "card",
            active: "contour",
            tablist: [
                { label: "轮廓", value: "contour" },
                { label: "眉毛", value: "eyebrow" },
                { label: "眼部", value: "eye" },
                { label: "鼻子", value: "nose" },
                { label: "嘴部", value: "mouth" },
                { label: "妆容", value: "decals" },
            ],
            subActive: {
                mouth: "整体",
                eye: "整体",
                nose: "整体",
                decals: "底妆",
                contour: "额头",
                eyebrow: "整体",
            },
            new_face_dict,
            new_decal_group,
            new_decal_type,
        };
    },
    computed: {
        boneCategories() {
            return Object.entries(CATEGORY_MAP).map(([tabValue, dictKey]) => ({
                tabValue,
                dictKey,
                data: this.new_face_dict[dictKey],
            }));
        },
    },
    watch: {
        facedata: {
            immediate: true,
            handler(val) {
                if (val && typeof val === "object") {
                    this.localFacedata = cloneDeep(val);
                    return;
                }
                this.localFacedata = {
                    tBone: {},
                    tDecal: {},
                };
            },
        },
    },
    mounted() { },
    methods: {},
};
</script>

<style lang="less">
.slide-bar {
    // !important: 覆写 @jx3box/jx3box-facedat 组件内部样式，该组件未暴露样式定制接口
    background-color: rgb(107, 82, 255) !important;
}
</style>
