<script>
import {
    getHorseType,
    getHorseImgSrc,
    getHorseLink,
    handleHorseImgError,
} from "@/utils/horse";

export default {
    inject: ["__imgRoot", "__imgRoot2"],
    computed: {
        client() {
            return this.$store.state.client;
        },
        displayAttributes() {
            const attrs = this.item.MagicAttributes || [];
            return attrs.length <= 4 ? attrs : attrs.slice(0, 3);
        },
        hiddenAttributesCount() {
            const attrs = this.item.MagicAttributes || [];
            return attrs.length <= 4 ? 0 : attrs.slice(3).length;
        },
    },
    methods: {
        handleImageError(e) {
            handleHorseImgError(e);
            e.target.style.opacity = "1";
        },
        getLink(item) {
            return getHorseLink(item);
        },
        getImgSrc(item, isAuto = false) {
            return getHorseImgSrc(item, this.client, this.__imgRoot, this.__imgRoot2, isAuto);
        },
        getType(item) {
            return getHorseType(item);
        },
    },
};
</script>
