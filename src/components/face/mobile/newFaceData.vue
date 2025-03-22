<template>
    <div class="p-new-face_data">
        <div class="m-face-list_mobile__tabs">
            <div class="u-tab_item" v-for="(item, index) in tablist" :key="index"
                :class="{ 'is-active': active == item.value }" @click="active = item.value">
                {{ item.label }}
            </div>
        </div>
        <div class="c-facedat-preivew">
            <div class="c-facedat-group" v-show="active === 'contour'">
                <!-- star -->
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_face_dict['轮廓'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
                    <ul class="u-list u-new" v-for="(subItem, itemIndex) in Object.keys(new_face_dict['轮廓'][item])"
                        :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in new_face_dict['轮廓'][item].root" :key="key + i">
                                <label @click="clog(facedata['tBone'][key.BoneType])">{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in new_face_dict['轮廓'][item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
                <!-- end -->
            </div>
            <div class="c-facedat-group" v-show="active === 'eyebrow'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_face_dict['眉毛'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
                    <ul class="u-list u-new" v-for="(subItem, itemIndex) in Object.keys(new_face_dict['眉毛'][item])"
                        :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in new_face_dict['眉毛'][item].root" :key="key + i">
                                <label @click="clog(facedata['tBone'][key.BoneType])">{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in new_face_dict['眉毛'][item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
            <div class="c-facedat-group" v-show="active === 'eye'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_face_dict['眼部'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
                    <ul class="u-list u-new" v-for="(subItem, itemIndex) in Object.keys(new_face_dict['眼部'][item])"
                        :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in new_face_dict['眼部'][item].root" :key="key + i">
                                <label @click="clog(facedata['tBone'][key.BoneType])">{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in new_face_dict['眼部'][item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
            <div class="c-facedat-group" v-show="active === 'nose'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_face_dict['鼻子'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
                    <ul class="u-list u-new" v-for="(subItem, itemIndex) in Object.keys(new_face_dict['鼻子'][item])"
                        :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in new_face_dict['鼻子'][item].root" :key="key + i">
                                <label @click="clog(facedata['tBone'][key.BoneType])">{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in new_face_dict['鼻子'][item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
            <div class="c-facedat-group" v-show="active === 'mouth'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_face_dict['嘴部'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
                    <ul class="u-list u-new" v-for="(subItem, itemIndex) in Object.keys(new_face_dict['嘴部'][item])"
                        :key="itemIndex">
                        <template v-if="subItem === 'root'">
                            <li v-for="(key, i) in new_face_dict['嘴部'][item].root" :key="key + i">
                                <label @click="clog(facedata['tBone'][key.BoneType])">{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                        <li v-if="subItem !== 'root'" class="u-sub-title">{{ subItem }}</li>
                        <template v-if="subItem !== 'root'">
                            <li v-for="(key, i) in new_face_dict['嘴部'][item][subItem]" :key="i">
                                <label>{{ key.BoneName }}</label>
                                <span>{{ facedata["tBone"][key.BoneType] }}</span>
                                <slider v-if="lock" class="u-range" :min="-128" :max="128"
                                    :value="facedata['tBone'][key.BoneType]"></slider>
                                <el-slider v-else class="u-range" :min="-128" :max="128"
                                    v-model="facedata['tBone'][key]" :disabled="lock"></el-slider>
                            </li>
                        </template>
                    </ul>
                </div>
            </div>
            <div class="c-facedat-group" id="decals" v-show="active === 'decals'">
                <div class="c-facedat-group__item" v-for="(item, index) in Object.keys(new_decal_group['妆容'])"
                    :key="index">
                    <div class="u-type-title">{{ item }}</div>
                    <!-- 二级标题 -->
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
export default {
    name: "NewFace",
    props: ["facedata", "lock", "decalDb", "body_type", "clean"],
    components: {
        Slider,
    },
    data() {
        return {
            tab_type: "card",
            active: "contour",
            tablist: [
                {
                    label: "轮廓",
                    value: "contour",
                },
                {
                    label: "眉毛",
                    value: "eyebrow",
                },
                {
                    label: "眼部",
                    value: "eye",
                },
                {
                    label: "鼻子",
                    value: "nose",
                },
                {
                    label: "嘴部",
                    value: "mouth",
                },
                {
                    label: "妆容",
                    value: "decals",
                },
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

    mounted() {

    },

    computed: {
        cleandata: function () {
            if (this.clean && this.facedata) {
                let _cleandata = _.cloneDeep(this.facedata);
                _cleandata.nDecorationID = 0;
                for (let key in _cleandata.tDecal) {
                    let CanUseInCreate = this.decalDb.getDecalIsFree(key, _cleandata.tDecal[key]["nShowID"], true);

                    if (!CanUseInCreate) {
                        _cleandata.tDecal[key]["nShowID"] = decal_default[key]["nShowID"];
                    }
                }
                return _cleandata;
            } else {
                return this.facedata;
            }
        },
    },
    methods: {},
};
</script>

<style lang="less">
.slide-bar {
    background-color: rgb(107, 82, 255) !important;
}
</style>
