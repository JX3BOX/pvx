<template>
    <div class="c-public-notice" v-if="html">
        <div class="m-notice-content">
            <img svg-inline :src="require('@/assets/img/notice.svg')" class="u-img" />
            <span class="m-notice-text" v-html="html"></span>
        </div>
    </div>
</template>

<script>
import { getBreadcrumb } from "@jx3box/jx3box-common/js/api_misc";
export default {
    name: "PublicNotice",
    props: ["bckey"],
    data() {
        return {
            html: "",
        };
    },
    mounted() {
        this.bckey &&
            getBreadcrumb(this.bckey).then((res) => {
                this.html = res;
            });
    },
    methods: {},
};
</script>

<style lang="less">
.c-public-notice {
    padding: 10px 0;
    .m-notice-content {
        .flex;
        .r(40px);
        padding: 10px 20px;
        background: #ffffff;
        box-shadow: 0px 0px 10px 0px #00000040;
        min-height: 40px;
        align-items: center;
        line-height: 24px;
        box-sizing: border-box;
        gap: 20px;
    }
    .u-img {
        .w(16px);
    }
    .m-notice-text {
        font-family: Microsoft YaHei;
        font-size: 14px;
        font-weight: 400;
        line-height: 18px;
        letter-spacing: 0em;
        text-align: left;
    }
}
</style>
