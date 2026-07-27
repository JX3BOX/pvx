<template>
    <div class="m-pvx-pet-lucky-item" :class="`m-pvx-pet-lucky-item--${variant}`">
        <a class="u-pet" :href="petLink" :target="isPhone ? '_self' : '_blank'"
            :rel="isPhone ? null : 'noopener noreferrer'" :aria-label="item.Name">
            <i class="u-img">
                <span class="u-pet-mask">
                    <img class="u-pet-pic" :src="petImgSrc" loading="lazy" @error="onError" />
                </span>
                <img class="u-bg" :src="bgSrc" loading="lazy" />
                <span class="u-guide">
                    <span class="u-guide-text">{{ $t("pages.pet.ui.lucky.guide") }}</span>
                    <img class="u-guide-logo" src="@/assets/img/common/logo.svg" svg-inline fill="#f1cd8b" />
                </span>
                <span class="u-text">
                    <span class="u-title">
                        <span class="u-adventure">{{ item.AdventureName }}</span>
                        <span class="u-name">{{ item.Name }}</span>
                    </span>
                    <span class="u-desc">{{ desc }}</span>
                </span>
            </i>
        </a>
    </div>
</template>

<script>
import { __cdn } from "@/utils/config";
import { getPetImgSrc, cleanResourceText } from "@/utils/pet";
import { isPhone } from "@/utils";

export default {
    name: "luckyItem",
    props: {
        item: {
            type: Object,
            required: true,
        },
        variant: {
            type: String,
            default: "legacy",
            validator: (value) => ["legacy", "modern"].includes(value),
        },
    },
    computed: {
        isPhone() {
            return isPhone();
        },
        client() {
            return this.$store.state.client;
        },
        petId() {
            return this.item?.Index || this.item?.source_id;
        },
        petLink() {
            return this.petId ? `/pet/${this.petId}` : this.item?.link || "";
        },
        petImgSrc() {
            return getPetImgSrc(this.item?.BgPath, this.client) || this.fallbackSrc;
        },
        bgSrc() {
            return `${__cdn}design/pet/pet-bg.png`;
        },
        fallbackSrc() {
            return `${__cdn}design/pet/std/${this.petId}.png`;
        },
        desc() {
            const match = this.item?.OutputDes?.match(/text="([^"]*)"/);
            return cleanResourceText(match ? match[1] : "");
        },
    },
    methods: {
        onError(e) {
            if (e.target.src === this.fallbackSrc) return;
            e.target.src = this.fallbackSrc;
        },
    },
};
</script>
<style lang="less">
@import "~@/assets/css/pet/pc/item.less";
</style>
