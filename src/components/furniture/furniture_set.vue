<template>
    <div class="m-furniture-set">
        <router-link class="u-item" :class="quality(data.Quality)" slot="reference" :to="`/${data.dwID}`">
            <div class="u-image">
                <img class="u-pic" :src="formatImg(data.Path)" />
            </div>
            <div class="u-name">{{ data.szName }}</div>
            <div class="u-type">{{ getType(data) }}</div>
        </router-link>
    </div>
</template>
<script>
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
            if (!link) return;
            let img = link.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
            let name = img?.[1].replace(/\\/g, "/");

            if (img?.[1] == "default") return this.__imgRoot + `homeland/${this.client}` + "/default/default.png";
            return this.__imgRoot + `homeland/${this.client}` + name + ".png";
        },
        getType(data) {
            const Category1 = data.nCatag1Index;
            const Category2 = data.nCatag2Index;
            const name1 = this.category[Category1]?.name || "";
            let name2 = "";
            if (name1) {
                const list = this.category[Category1]?.children || [];
                name2 = list.find((item) => ~~item.nCatag2Index === Category2)?.szName || "";
            }
            return name1 + "-" + name2;
        },
    },
    created() {},
};
</script>

<style lang="less" scoped>
.m-furniture-set {
    .r(10px);
    padding: 10px;
    box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.1);
    border: 1px solid transparent;
    transition: 0.3s ease-out;
    &:hover {
        border: 1px solid #E86F00;
        box-shadow: 0px 0px 10px 0px #E86F0066;
        background: #E86F001A;
    }
    .u-item {
        .flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 10px;
        transition: all 0.1s ease-in-out;
        width: 140px;
        height: 200px;
        border-radius: 10px;
        box-sizing: border-box;
        overflow: hidden;
        .u-image {
            background-image: url("../../assets/img/horse_item_bg_sm.jpg");
            background-position: center;
            background-repeat: no-repeat;
            background-size: cover;
            width: 120px;
            height: 120px;
            border-radius: 10px;
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
