<template>
    <div class="p-old-face_data">
        <div class="m-face-list_mobile__tabs">
            <div
                class="u-tab_item"
                v-for="(item, index) in tablist"
                :key="index"
                :class="{ 'is-active': active == item.value }"
                @click="active = item.value"
            >
                {{ item.label }}
            </div>
        </div>
        <div class="c-facedat-preivew">
            <div class="c-facedat-group" v-show="active === 'eye'">
                <ul class="u-list">
                    <li v-for="(key, i) in group['eye']" :key="key + i">
                        <label>{{ dict[key]["desc"] }}</label>
                        <span>{{ facedata["tBone"][key] }}</span>
                        <slider
                            v-if="lock"
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            :value="facedata['tBone'][key]"
                        ></slider>
                        <el-slider
                            v-else
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            v-model="facedata['tBone'][key]"
                            :disabled="lock"
                        ></el-slider>
                    </li>
                </ul>
            </div>
            <div class="c-facedat-group" v-show="active === 'mouth'">
                <ul class="u-list">
                    <li v-for="(key, i) in group['mouth']" :key="key + i">
                        <label>{{ dict[key]["desc"] }}</label>
                        <span>{{ facedata["tBone"][key] }}</span>
                        <slider
                            v-if="lock"
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            :value="facedata['tBone'][key]"
                        ></slider>
                        <el-slider
                            v-else
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            v-model="facedata['tBone'][key]"
                            :disabled="lock"
                        ></el-slider>
                    </li>
                </ul>
            </div>
            <div class="c-facedat-group" v-show="active === 'nose'">
                <ul class="u-list">
                    <li v-for="(key, i) in group['nose']" :key="key + i">
                        <label>{{ dict[key]["desc"] }}</label>
                        <span>{{ facedata["tBone"][key] }}</span>
                        <slider
                            v-if="lock"
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            :value="facedata['tBone'][key]"
                        ></slider>
                        <el-slider
                            v-else
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            v-model="facedata['tBone'][key]"
                            :disabled="lock"
                        ></el-slider>
                    </li>
                </ul>
            </div>
            <div class="c-facedat-group" v-show="active === 'face'">
                <ul class="u-list">
                    <li v-for="(key, i) in group['face']" :key="key + i">
                        <label>{{ dict[key]["desc"] }}</label>
                        <span>{{ facedata["tBone"][key] }}</span>
                        <slider
                            v-if="lock"
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            :value="facedata['tBone'][key]"
                        ></slider>
                        <el-slider
                            v-else
                            class="u-range"
                            :min="bone_range[body_type][dict[key]['type']]['min']"
                            :max="bone_range[body_type][dict[key]['type']]['max']"
                            v-model="facedata['tBone'][key]"
                            :disabled="lock"
                        ></el-slider>
                    </li>
                </ul>
            </div>
            <div class="m-facedat-decals" id="newDecals" v-show="active === 'decals'">
                <div class="c-facedat-group" v-for="(key, i) in group['decal']" :key="key + i">
                    <template v-if="cleandata['tDecal'][key]">
                        <div class="u-decals">
                            <div class="u-decals-box" v-show="!clean || checkdecal_prop(key)">
                                <div class="u-top-box">
                                    <div
                                        v-if="decalDb.getDecalPrice(key, cleandata['tDecal'][key]['nShowID'])"
                                        class="u-price"
                                    >
                                        <i class="el-icon-coin"></i>
                                        {{ decalDb.getDecalPrice(key, cleandata["tDecal"][key]["nShowID"]) }}
                                        通宝
                                    </div>
                                    <div
                                        v-if="decalDb.getDecalIsFree(key, cleandata['tDecal'][key]['nShowID'])"
                                        class="u-free"
                                    >
                                        <i class="el-icon-success"></i> 新建角色可用
                                    </div>
                                </div>
                                <div class="u-title-old">
                                    <template v-if="dict[key]['desc'] === '右瞳'">左瞳</template>
                                    <template v-else-if="dict[key]['desc'] === '左瞳'">右瞳</template>
                                    <template v-else>{{ dict[key]["desc"] }}</template>
                                </div>
                                <div class="u-decals-params-box">
                                    <div class="u-decals-params">
                                        <img
                                            class="u-pic"
                                            :src="decalDb.getDecalIcon(key, cleandata['tDecal'][key]['nShowID'])"
                                        />{{ decalDb.getDecalName(key, cleandata["tDecal"][key]["nShowID"]) }}
                                    </div>
                                    <div
                                        class="u-decals-params u-dflip"
                                        v-if="decalDb.getDecalIsFlip(key, cleandata['tDecal'][key]['nShowID'])"
                                    >
                                        (翻转)
                                    </div>
                                    <div class="u-decals-params u-dcolor">
                                        (颜色:{{ cleandata["tDecal"][key]["nColorID"] }})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <div class="c-facedat-group">
                    <ul class="u-decals">
                        <li>
                            <div class="u-title">装饰物</div>

                            <span class="u-dname"
                                ><img class="u-pic" :src="decalDb.getDecorationIcon(cleandata['nDecorationID'])" />{{
                                    decalDb.getDecorationName(cleandata["nDecorationID"])
                                }}</span
                            >
                            <span class="u-dname"></span>
                            <span class="u-dname"></span>
                            <span class="u-price" v-if="decalDb.showDecorationPrice(cleandata['nDecorationID'])">
                                <i class="el-icon-coin"></i>
                                {{ decalDb.showDecorationPrice(cleandata["nDecorationID"]) }}
                                通宝
                            </span>
                        </li>
                    </ul>
                </div>
                <div class="m-price-all">
                    <span class="u-title">总计：</span>
                    <span class="u-total"
                        ><i class="el-icon-coin"></i> <b>{{ decalDb.getTotalPrice(facedata) }}</b> 通宝</span
                    >
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import Slider from "@jx3box/jx3box-facedat/src/Slider.vue";
import group from "@jx3box/jx3box-facedat/assets/data/face/group.json";
import dict from "@jx3box/jx3box-facedat/assets/data/face/dict.json";
import decal_group from "@jx3box/jx3box-facedat/assets/data/face/decal_group.json";
import bone_range from "@jx3box/jx3box-facedat/assets/data/face/bone_range.json";
import decal_default from "@jx3box/jx3box-facedat/assets/data/face/decal_default.json";
export default {
    name: "Jx3boxFacedatOldFace",
    props: ["facedata", "lock", "decalDb", "body_type", "clean"],
    components: {
        Slider,
    },
    data() {
        return {
            tab_type: "",
            active: "eye",
            tablist: [
                {
                    label: "眼部轮廓",
                    value: "eye",
                },
                {
                    label: "嘴部轮廓",
                    value: "mouth",
                },
                {
                    label: "鼻子轮廓",
                    value: "nose",
                },
                {
                    label: "脸部轮廓",
                    value: "face",
                },
                {
                    label: "贴花",
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
            group,
            dict,
            bone_range,
        };
    },
    computed: {
        cleandata: function () {
            if (this.clean && this.facedata) {
                let _cleandata = _.cloneDeep(this.facedata);
                _cleandata.nDecorationID = 0;
                for (let key in _cleandata.tDecal) {
                    let CanUseInCreate = this.decalDb.getDecalIsFree(key, _cleandata.tDecal[key]["nShowID"]);
                    console.log(CanUseInCreate);
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
    mounted() {
        console.log(bone_range[this.body_type]);
    },

    methods: {
        checkdecal_prop: function (key) {
            return decal_group.origin.includes(key);
        },
    },
};
</script>

<style lang="less">
.c-facedat-tab {
    .mt(20px);
    .mb(20px);
    .u-filter {
        white-space: nowrap;
        vertical-align: middle;
        .el-button,
        .el-checkbox-button__inner,
        .el-radio-button__inner {
            .fz(16px, 33px);
            padding: 0 20px 0 20px;
            margin: 10px 10px 0 10px;
            .db;
            .r(30px);
            color: #8d8d8d;
            border: 1px solid #fff;
            background-color: #fff;
            .bold(400);
            &:hover {
                color: #fff;
                background-color: #6b52ff;
                border-color: #6b52ff;
                .bold(400);
            }
        }
        .el-radio-button__orig-radio:checked + .el-radio-button__inner {
            background-color: #6b52ff;
            border-color: #6b52ff;
            color: #fff;
            .bold(400);
        }
    }
}
</style>
