<template>
    <div class="c-facedat">
        <NewFace :facedata="facedata" :body_type="body_type" :cleandata="cleandata" :clean="clean" :lock="lock"
            :decalDb="decalDb" v-if="decalDb && facedata.bNewFace">
        </NewFace>
        <OldFace :facedata="facedata" :body_type="body_type" :cleandata="cleandata" :clean="clean" :lock="lock"
            :decalDb="decalDb" v-if="decalDb && !facedata.bNewFace">
        </OldFace>
    </div>
</template>

<script>
import _ from "lodash";
import { __ossMirror, __iconPath, __ossRoot } from "@jx3box/jx3box-common/data/jx3box.json";
import fixOldData from "@jx3box/jx3box-facedat/src/fixOldData.js";
import decal_default from "@jx3box/jx3box-facedat/assets/data/face/decal_default.json";

import { DecalDatabase } from "@jx3box/jx3box-facedat/src/DecalDatabase";

import NewFace from "@/components/face/mobile/newFaceData";
import OldFace from "@/components/face/mobile/oldFaceData";
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
            let data = JSON.parse(sessionStorage.getItem("faceData"));
            console.log(this.client);
            // this.decalDb.ready()
            this.decalDb = new DecalDatabase(this.client, data.bNewFace);
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
                console.log(e);
                this.$notify.error({
                    title: "错误",
                    message: "脸型数据无法解析",
                });
            }
        },
    },
    mounted: function () {
        this.render()
        console.log(navigator.userAgent.toLowerCase())
    },
};
</script>

<style lang="less">
@fontcolor: #1c1c1c;
@fontcolor2: rgba(28, 28, 28, 0.8);
@fontcolor3: rgba(28, 28, 28, 0.4);
@fontColor-dark: #fff;
@fontColor-dark2: rgba(255, 255, 255, 0.8);
@fontColor-dark3: rgba(255, 255, 255, 0.4);
@bgcolor1: #f3f1f1;

.c-facedat {
    height: 100vh;
    // padding: 0 20px 12px 20px;
    background-color: @bgcolor1;

    .m-face-list_mobile__tabs {
        position: sticky;
        top: 0;
        .z(2);
        .flex;
        justify-content: space-between;
        align-items: center;
        height: 32px;
        padding: 20px 8px;
        gap: 10px;

        .u-tab_item {
            color: @fontcolor3;
            .fz(18px, 28px);
            .bold(700);

            &.is-active {
                color: @fontcolor;
                border-bottom: 2px solid @fontcolor;
            }
        }
    }
}

.c-facedat-preivew {
    overflow: auto;
    height: calc(100vh - 73px);
    padding: 0 8px 10px 8px;
    box-sizing: border-box;
}

.c-facedat-group {
    .u-title {
        .bold;
        .fz(15px, 2);
        flex-shrink: 0;
        width: 220px;
    }

    .u-title-old {
        .bold;
        .fz(15px, 2);
        flex-shrink: 0;
        width: 100px;
    }

    .u-type-title {
        border-radius: 8px;
        border: 1px solid rgba(40, 40, 40, 0.05);
        background-color: #fff;
        padding: 4px 8px;
        .flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
        align-self: stretch;
        color: @fontcolor2;
        .fz(12px, 18px);
        .bold(700);
    }

    .u-list {
        list-style: none;
        padding: 0;
        .mb(10px);
        .mt(0px);

        li {
            padding: 5px 8px;
            .flex;
            flex-flow: row;
        }

        .u-sub-title {
            .h(24px);
            .pl(8px);
            color: @fontcolor3;
            .fz(12px, 18px);
            .bold(700);
        }

        label,
        span {
            .fz(14px);
        }

        label {
            .mr(10px);
            font-weight: normal;
            .w(80px);
            color: #000;
            .x(left);
        }

        .x(right);

        input,
        .u-range {
            //.w(290px);
            flex: 1;
            .mr(5px);
        }

        span {
            .w(50px);
            .mr(10px);
            .nobreak;
            .bold;
            color: #5856d6;
            .x(right);
        }

        &.u-new {
            label {
                .w(40px);
            }
        }
    }

    .u-decals {
        .r(5px);
        list-style: none;
        background-color: @fontColor-dark;
        .mt(12px);

        .u-decals-box {
            padding: 8px;
        }

        li {
            display: flex;
            align-items: center;
            height: 50px;
            gap: 10px;
        }

        img {
            .size(32px);
            .y;
            .mr(5px);
            .r(3px);
        }

        span {
            flex: 1 1 auto;
            .fz(14px);
            .nobreak;
            .bold;
            max-width: 15%;
        }

        .u-decals-params-box {
            .w(calc(100vw - 32px));
            .mt(8px);
            .flex;
            flex-wrap: wrap;
            gap: 10px;
        }

        .u-decals-params {
            .w(calc(100% / 3 - 10px));
            box-sizing: border-box;

            span {
                &:first-child {
                    width: 28px;
                    .fz(14px);
                    color: @fontcolor2;
                    .pr(10px);
                }

                &:nth-child(2) {
                    width: 28px;
                    color: #5856d6;
                }
            }
        }

        .u-top-box {
            .flex;
            justify-content: space-between;
        }

        .u-price {
            .fz(12px);
            color: #fba524;
            .h(18px);
            .mb(8px);
        }

        .u-free {
            .fz(12px);
            color: #49c10f;
        }

        .u-dcolor {
            .flex;
            .flex(o);
            .fz(12px);
            color: #999;
            .ml(3px);
        }

        .u-dflip {
            .fz(12px);
            color: #555;
            .ml(3px);
        }
    }
}

.m-price-all {
    .fz(12px0.18px);
    .bold(700);
    .x;

    .u-title {
        color: @fontcolor3;
    }

    .u-total {
        color: #fba524;
    }
}

// @media screen and (width: 390px)
@media (prefers-color-scheme: dark) {
    .c-facedat {
        background-color: #000;

        .m-face-list_mobile__tabs {
            background-color: #000;

            .u-tab_item {
                color: @fontColor-dark2;

                &.is-active {
                    color: @fontColor-dark;
                    border-bottom: 2px solid @fontColor-dark;
                }
            }
        }
    }

    .c-facedat-group {
        .u-type-title {
            background-color: #282828;
        }

        .u-decals {
            background-color: #282828;
        }

        .u-title,
        .u-title-old,
        .u-type-title,
        .u-decals-params {
            color: @fontColor-dark2;
        }

        .u-list {

            .u-sub-title,
            li,
            label {
                color: @fontColor-dark2;
            }
        }

        .u-decals-params-box {
            .u-decals-params {
                span {
                    &:first-child {
                        color: @fontColor-dark2;
                    }
                }
            }
        }
    }

    .m-price-all {
        .u-title {
            color: @fontColor-dark2;
        }
    }
}
</style>
