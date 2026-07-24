<template>
    <div class="m-robot__pvx-tip" :class="`m-robot__pvx-tip--${variant}`">
        <div class="m-qq">
            <img class="u-logo" src="@/assets/img/qqbot/jx3box_qqbot_logo.png" alt="" />
            <span class="u-name">{{ quickGuideText }}</span>
            <button
                type="button"
                class="u-qq"
                :title="copyQqLabel"
                :aria-label="copyQqLabel"
                @click="copy(qqNumber)"
            >
                <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_qq.svg" alt="" />
                <span>{{ qqNumber }}</span>
            </button>
        </div>
        <div class="m-reply" v-if="!hidden">
            <span>{{ replyPrefix }}</span>
            <button
                type="button"
                class="u-reply"
                :title="copyCommandLabel"
                :aria-label="copyCommandLabel"
                @click="copy(`${typeName} ${reply}`)"
            >
                {{ typeName }} {{ reply }}
            </button>
            <span>{{ replySuffix }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "PvxRobotTip",
    props: {
        reply: {
            type: String,
            default: "",
        },
        typeName: {
            type: String,
            default: "",
        },
        hidden: {
            type: Boolean,
            default: false,
        },
        variant: {
            type: String,
            default: "default",
        },
        qqNumber: {
            type: String,
            default: "3889010020",
        },
        quickGuideText: {
            type: String,
            default: "添加QQ机器人，快速获取攻略",
        },
        copySuccessTitle: {
            type: String,
            default: "复制成功",
        },
        replyPrefix: {
            type: String,
            default: "回复",
        },
        replySuffix: {
            type: String,
            default: "即可快速获取一图流攻略！",
        },
        copyQqLabel: {
            type: String,
            default: "复制QQ机器人账号",
        },
        copyCommandLabel: {
            type: String,
            default: "复制攻略指令",
        },
    },
    methods: {
        copy(txt) {
            navigator.clipboard.writeText(txt).then(() => {
                this.$notify({
                    title: this.copySuccessTitle,
                    message: txt,
                    type: "success",
                });
            });
        },
    },
};
</script>

<style lang="less">
@import (reference) "~@/assets/css/design-system/_tokens.less";
@import (reference) "~@/assets/css/design-system/_mixins.less";

.m-robot__pvx-tip {
    .flex;
    align-items: center;
    gap: 20px;

    @media screen and (max-width: @ipad-y) {
        .none;
        gap: 10px;
    }

    .u-logo {
        width: 30px;
        height: 30px;
    }

    .u-icon {
        .size(14px);
    }

    .m-qq {
        height: 41px;
        width: 375px;
        box-sizing: border-box;
        border: 0;
        background: #24292e;
        padding: 0 30px;
        .r(100px);
        font-family: inherit;
        font-size: 14px;
        font-weight: 700;
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 10px;

        &:hover {
            .u-name {
                .none;
            }

            .u-qq {
                display: inline-flex;
            }
        }
    }

    .u-name {
        .flex;
        align-items: center;
        gap: 20px;
        color: #fff;
        width: auto;
        text-align: center;
    }

    .u-qq {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        width: 190px;
        height: 25px;
        opacity: 1;
        border-radius: 8px;
        border: 0;
        background: rgba(255, 255, 255, 1);
        padding: 0 30px;
        color: #000;
        font-family: inherit;
        font-size: inherit;
        .bold;
        box-sizing: border-box;
        cursor: pointer;
        .none;
    }

    .m-reply {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        gap: 5px;
        font-size: 14px;
    }

    .u-reply {
        border: 0;
        background: #d16400;
        color: #fff;
        opacity: 1;
        border-radius: 4px;
        height: 24px;
        line-height: 20px;
        padding: 2px 4px;
        font-family: inherit;
        font-size: inherit;
        .bold;
        box-sizing: border-box;
        cursor: pointer;
    }
}

.m-robot__pvx-tip--modern {
    display: grid;
    width: 100%;
    grid-template-columns: minmax(280px, 380px) minmax(0, 1fr);
    align-items: center;
    padding: @pvx-space-3;
    gap: @pvx-space-4;
    border: 1px solid @pvx-border-light;
    border-radius: @pvx-radius-card;
    background:
        radial-gradient(circle at 0 0, fade(@pvx-primary, 10%), transparent 42%),
        @pvx-surface-muted;

    .m-reply {
        min-width: 0;
        justify-content: flex-start;
        flex-wrap: wrap;
        gap: @pvx-space-1;
        color: @pvx-text-secondary;
        line-height: 1.7;
        overflow-wrap: anywhere;
    }

    .u-reply {
        .pvx-focus-ring();
        width: auto;
        max-width: 100%;
        height: auto;
        min-height: 32px;
        padding: 4px @pvx-space-2;
        border: 1px solid @pvx-border-focus;
        border-radius: @pvx-radius-small;
        color: @pvx-primary;
        background: @pvx-primary-soft;
        line-height: 1.5;
        white-space: normal;
        overflow-wrap: anywhere;
        transition:
            color @pvx-duration-fast @pvx-ease-standard,
            border-color @pvx-duration-fast @pvx-ease-standard,
            background-color @pvx-duration-fast @pvx-ease-standard,
            transform @pvx-duration-fast @pvx-ease-standard;

        &:hover {
            border-color: @pvx-primary;
            color: @pvx-text-inverse;
            background: @pvx-primary;
        }

        &:active {
            transform: translateY(1px);
        }
    }
}

@media screen and (max-width: 1080px) {
    .m-robot__pvx-tip--modern {
        grid-template-columns: minmax(0, 1fr);
    }
}
</style>
