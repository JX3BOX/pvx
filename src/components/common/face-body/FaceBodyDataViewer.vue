<template>
    <component :is="viewerComponent" class="m-pvx-fb-data-viewer" :data="data" :lock="lock" :type="type" />
</template>

<script>
import Facedat from "@jx3box/jx3box-facedat/src/Facedat.vue";
import Bodydat from "@jx3box/jx3box-facedat/src/Bodydat.vue";

export default {
    name: "FaceBodyDataViewer",
    components: { Facedat, Bodydat },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ["face", "body"].includes(value),
        },
        data: {
            type: [Object, String],
            default: "",
        },
        lock: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        viewerComponent() {
            return this.type === "face" ? "Facedat" : "Bodydat";
        },
    },
};
</script>

<style lang="less">
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-pvx-fb-data-viewer {
    min-height: 240px;
    padding: 0;
    border-radius: 0;
    background: transparent;

    .c-facedat-tab {
        margin-top: 0;
    }

    .c-facedat-preivew {
        margin-top: @pvx-space-3;
        padding: @pvx-space-3 @pvx-space-2;
        border-radius: @pvx-radius-small;
        background: @pvx-surface;
        box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);

        .el-tabs__nav-scroll {
            padding-top: 1px;
        }

        .el-tabs__content {
            z-index: 9;
        }
    }

    #decals .u-decals {
        margin: 0 0 @pvx-space-2;
        padding: 0;
        overflow: hidden;
        border: 1px solid @pvx-border-light;
        border-radius: @pvx-radius-small;
        background: @pvx-surface;

        > .u-decal-item {
            display: grid;
            min-height: 58px;
            grid-template-columns: minmax(180px, 1fr) minmax(420px, 2fr) minmax(92px, auto);
            align-items: center;
            gap: @pvx-space-2;
            box-sizing: border-box;
            padding: @pvx-space-1 @pvx-space-3;
        }

        .u-decal-main {
            display: flex;
            min-width: 0;
            align-items: center;
            gap: @pvx-space-2;

            .u-pic {
                width: 36px;
                height: 36px;
                flex: 0 0 36px;
                margin: 0;
                border: 1px solid @pvx-border-light;
                border-radius: @pvx-space-1;
                object-fit: cover;
            }
        }

        .u-decal-details {
            display: grid;
            min-width: 0;
            grid-template-columns: repeat(3, minmax(110px, 1fr));
            gap: @pvx-space-3;
        }

        .u-decals-params {
            display: grid;
            min-width: 0;
            align-items: baseline;
            grid-template-columns: max-content max-content;
            column-gap: @pvx-space-2;
            justify-content: start;
            color: @pvx-text-regular;
            white-space: nowrap;

            span:first-child {
                color: @pvx-text-regular;
                font-weight: 500;
            }

            span:last-child {
                color: @pvx-primary;
                font-weight: 600;
            }
        }

        .u-price {
            display: inline-flex;
            width: auto;
            max-width: none;
            align-items: center;
            justify-self: end;
            gap: 4px;
            margin: 0;
            color: @pvx-warning;
            font-weight: 600;
            white-space: nowrap;
        }
    }

    #decals > .c-facedat-group > .u-decals {
        display: grid;
        min-height: 48px;
        grid-template-columns: minmax(180px, 1.5fr) 72px repeat(3, minmax(96px, 1fr)) minmax(92px, 0.8fr);
        align-items: center;
        gap: @pvx-space-2;
        box-sizing: border-box;
        padding: @pvx-space-2 @pvx-space-3;
        border-color: #fde68a;
        background: #fffbeb;

        .u-title {
            width: auto;
            grid-column: 1;
            color: @pvx-text-secondary;
            font-weight: 500;
        }

        .u-total {
            width: auto;
            grid-column: 6;
            justify-self: end;
            margin: 0;
            color: @pvx-warning;
            font-weight: 600;
            white-space: nowrap;
        }
    }
}

@media screen and (max-width: @ipad) {
    .m-pvx-fb-data-viewer #decals .u-decals > .u-decal-item {
        grid-template-columns: minmax(150px, 1fr) minmax(330px, 2fr);

        > .u-price {
            grid-column: 1 / -1;
            justify-self: end;
        }
    }
}

@media screen and (max-width: @phone) {
    .m-pvx-fb-data-viewer {
        .c-facedat-tab {
            overflow-x: auto;

            .el-radio-group {
                display: flex;
                width: max-content;
                flex-wrap: nowrap;
            }
        }

        .c-facedat-preivew {
            padding: @pvx-space-2;
            overflow-x: auto;
        }

        #decals .u-decals > .u-decal-item {
            grid-template-columns: minmax(0, 1fr);

            .u-decal-details {
                grid-template-columns: minmax(0, 1fr);
            }

            > .u-price {
                grid-column: auto;
                justify-self: start;
            }
        }
    }
}
</style>
