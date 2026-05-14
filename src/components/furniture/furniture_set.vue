<template>
    <div class="m-furniture-set">
        <router-link class="u-item" :class="quality(data.Quality)" :to="`/${data.dwID}`" target="_blank">
            <div class="u-image">
                <img class="u-pic" :src="formatImg(data.Path)" />
            </div>
            <div class="u-name">{{ data.szName }}</div>
            <div class="u-type">{{ getType(data) }}</div>
        </router-link>
    </div>
</template>
<script>
import { formatFurnitureImg, getFurnitureType } from "@/utils/furniture";
export default {
    name: "Set",
    props: ["data", "category"],
    inject: ["__imgRoot"],
    data: function () {
        return {};
    },
    computed: {
        client: function () {
            return this.$store.state.client;
        },
    },
    methods: {
        quality: function (id) {
            return id ? "quality_" + id : "";
        },
        formatImg(link) {
            return formatFurnitureImg(link, this.__imgRoot, this.client);
        },
        getType(data) {
            return getFurnitureType(data, this.category);
        },
    },
    created() {},
};
</script>

<style lang="less">
.m-furniture-set {
    .r(10px);
    padding: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid transparent;
    transition: 0.3s ease-out;
    &:hover {
        border: 1px solid @furnitureColor;
        box-shadow: 0px 0px 10px 0px fade(@furnitureColor, 40%);
        background: fade(@furnitureColor, 10%);
    }
    .u-item {
        .flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        transition: all 0.1s ease-in-out;
        width: 100%;
        border-radius: 10px;
        box-sizing: border-box;
        .u-image {
            background-image: url("../../assets/img/horse/horse_item_bg_sm.jpg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            width: 100%;
            aspect-ratio: 1 / 1;
            border-radius: 10px;
            flex-shrink: 0;
        }
    }
    .u-name {
        font-weight: 700;
        font-size: 20px;
        line-height: 26px;
        color: #000000;
        box-sizing: border-box;
        text-align: left;
        max-width: 100%;
        .nobreak;
    }
    .u-type {
        font-weight: 400;
        font-size: 14px;
        line-height: 18px;
        color: #000000;
        max-width: 100%;
        .nobreak;
    }
}
</style>
