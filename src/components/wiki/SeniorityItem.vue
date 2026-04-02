<template>
    <div class="m-seniority__item">
        <img class="u-left__img" src="../../assets/img/wiki/overview/seniority_item_bg.png" alt="">
        <div class="m-info_layout">
            <div class="u-progress style1"></div>
            <div class="m-seniority__title">
                <div class="u-text">杂文</div>
                <div class="u-percent">26%</div>
            </div>
            <div class="m-seniority__num">
                <div class="m-item">
                    <img class="u-icon" src="../../assets/img/wiki/overview/tasks_num.png" alt="" />
                    <div class="u-text">12/32</div>
                </div>
                <div class="m-item">
                    <img class="u-icon" :src="iconPath('point.svg')" alt="" />
                    <div class="u-text">191/1324</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
export default {
    name: "SeniorityItem",
    components: {},
    data: function () {
        return {
            loading: false,
        };
    },
    computed: {},
    watch: {},
    methods: {
        iconPath(url) {
            return `${__cdn}img/dashboard/${url}`;
        },
    },
    created: function () {},
};
</script>
<style lang="less">
@import "~@/assets/css/wiki/SeniorityItem.less";
</style>
