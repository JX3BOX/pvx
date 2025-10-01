<template>
    <div class="m-luckey-item">
        <a class="u-pet" :href="getPetLink(item)" target="_blank">
            <i class="u-img">
                <img class="u-pic" :src="imgPath" loading="lazy" @error="onError" />
            </i>
        </a>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
import {resolveImagePath} from '@jx3box/jx3box-common/js/utils'
export default {
    name: "luckyItem",
    props: ["item"],
    data: function () {
        return {};
    },
    computed: {
        imgPath() {
            return `${__cdn}design/pet/std/${this.item.source_id}.png`;
        }
    },
    methods: {
        getPetLink(item) {
            return item.source_id ? `/pet/${item.source_id}` : item.link;
        },
        resolveImagePath,
        onError(e) {
            e.target.src = this.resolveImagePath(this.item.img);
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pet/item.less";
</style>
