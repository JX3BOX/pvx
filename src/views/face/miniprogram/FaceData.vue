<template>
    <div class="m-pvx-face-data">
        <NewFace :facedata="facedata" :body_type="body_type" :cleandata="cleandata" :clean="clean" :lock="lock"
            :decalDb="decalDb" v-if="decalDb && facedata?.tBone && facedata.bNewFace">
        </NewFace>
        <OldFace :facedata="facedata" :body_type="body_type" :cleandata="cleandata" :clean="clean" :lock="lock"
            :decalDb="decalDb" v-if="decalDb && facedata?.tBone && !facedata.bNewFace">
        </OldFace>
    </div>
</template>

<script>
import _ from "lodash";
import { __ossMirror, __iconPath, __ossRoot } from "@/utils/config";
import fixOldData from "@jx3box/jx3box-facedat/src/fixOldData.js";
import decal_default from "@jx3box/jx3box-facedat/assets/data/face/decal_default.json";

import { DecalDatabase } from "@jx3box/jx3box-facedat/src/DecalDatabase";

import NewFace from "@/components/face/miniprogram/NewFaceData";
import OldFace from "@/components/face/miniprogram/OldFaceData";
export default {
    name: "Facedat",
    props: ["tab_type"],

    data: function () {
        return {
            lock: true,
            active: "eye",
            subActive: {
                mouth: "整体",
                eye: "整体",
                nose: "整体",
                decals: "底妆",
                contour: "额头",
                eyebrow: "整体",
            },
            // 数据
            body_type: "",
            facedata: "",
            visible: false,
            // 骨骼

            // 妆容

            // 导出设置
            clean: false,
            version: "std",

            decalDb: null,
            decalMap: "",
            decorationMap: "",
            totalPrice: "",
            // test
            // data
        };
    },
    components: {
        NewFace,
        OldFace,
    },
    computed: {
        cleandata: function () {
            if (this.clean && this.facedata) {
                let _cleandata = _.cloneDeep(this.facedata);
                _cleandata.nDecorationID = 0;
                for (let key in _cleandata.tDecal) {
                    let CanUseInCreate = this.decalDb.getDecalIsFree(key, _cleandata.tDecal[key]["nShowID"]);
                    if (!CanUseInCreate) {
                        _cleandata.tDecal[key]["nShowID"] = decal_default[key]["nShowID"];
                    }
                }
                return _cleandata;
            } else {
                return this.facedata;
            }
        },
        // 自动检测数据版本
        client: function () {
            let _nMajorVersion = this.facedata?.nMajorVersion;
            if (_nMajorVersion == 1 || !_nMajorVersion) {
                return "std";
            } else {
                return "origin";
            }
        },
    },
    watch: {
        // client: {
        //     immediate: true,
        //     handler: function (val) {
        //         let facedata = this.faceDatSession.object;
        //         this.decalDb = new DecalDatabase(this.client, facedata.bNewFace);
        //     },
        // },
    },
    methods: {
        // 数据构建
        render: function () {
            let data;
            try {
                data = JSON.parse(sessionStorage.getItem("faceData"));
            } catch (e) {
                sessionStorage.removeItem("faceData");
            }
            // this.decalDb.ready()
            this.decalDb = new DecalDatabase(this.client, data?.object?.bNewFace);

            // 是否为空
            if (!data) {
                this.body_type = "";
                this.facedata = "";
                return;
            }

            // json 转为 object
            try {
                let facedata = data.object;
                // 旧版数据
                this.body_type = facedata.status ? facedata.misc[0]["value"] : facedata.nRoleType;

                this.decalDb.setBodyType(this.body_type);
                this.facedata = facedata.status ? fixOldData(facedata) : facedata;
                if (!this.facedata.bNewFace) {
                    this.totalPrice = this.decalDb.getTotalPrice(this.cleandata);
                }
            } catch (e) {
                this.facedata = "";

                this.$notify.error({
                    title: "错误",
                    message: "脸型数据无法解析",
                });
            }
        },
    },
    mounted: function () {
        this.render()
    },
};
</script>

<style lang="less">
@import "~@/assets/css/face/miniprogram/face-data.less";
</style>
