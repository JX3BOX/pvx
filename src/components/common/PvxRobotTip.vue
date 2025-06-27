<template>
    <div class="m-robot__pvx-tip">
        <div class="m-qq">
            <img class="u-logo" src="@/assets/img/jx3box_qqbot_logo.png" alt="" />
            <span class="u-name"> 添加QQ机器人，快速获取攻略 </span>
            <span class="u-qq" @click="copy('3889010020')">
                <img class="u-icon" src="@/assets/img/jx3box_qqbot_qq.svg" alt="" />
                <span>3889010020</span>
            </span>
        </div>
        <div class="m-reply">
            <span>回复</span>
            <span class="u-reply" @click="copy(`${typeName} ${reply}`)">{{ typeName }} {{ reply }}</span>
            <span>即可快速获取一图流攻略！</span>
        </div>
    </div>
</template>

<script>
export default {
    name: "PvxRobotTip",
    props: ["reply", "typeName"],
    methods: {
        copy(txt) {
            navigator.clipboard.writeText(txt).then(() => {
                this.$notify({
                    title: "复制成功",
                    message: txt,
                    type: "success",
                });
            });
        },
    },
};
</script>

<style lang="less">
.m-robot__pvx-tip {
    .flex;
    align-items: center;
    gap: 20px;

    @media screen and (max-width: @phone) {
        .none;
        gap: 10px;
    }
    .u-logo {
        width: 41px;
        height: 41px;
    }
    .u-icon {
        .size(14px);
    }
    .m-qq {
        height: 41px;
        width: 375px;
        box-sizing: border-box;
        background: #24292e;
        padding: 0 40px;
        .r(100px);
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
        width: 190px;
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
        background: rgba(255, 255, 255, 1);
        padding: 0 30px;
        color: #000;
        .bold;
        cursor: pointer;
        box-sizing: border-box;
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
        background: #d16400;
        color: #fff;
        opacity: 1;
        border-radius: 4px;
        height: 24px;
        line-height: 20px;
        padding: 2px 4px 2px 4px;
        .bold;
        box-sizing: border-box;
        cursor: pointer;
    }
}
</style>
