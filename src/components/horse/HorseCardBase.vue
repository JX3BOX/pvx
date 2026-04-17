<script>
import { __cdn } from "@/utils/config";

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
        getPlaceholderImage() {
            return require('@/assets/img/horse/horse_item_bg_sm.jpg');
        },
        handleImageError(e) {
            e.target.src = this.getPlaceholderImage();
            e.target.style.opacity = '1';
        },
        getLink(item) {
            const id = item.ItemID;
            const type = item.SubType === 15 ? 1 : 2;
            return `/horse/${id}?type=${type}`;
        },
        getImgSrc(item, isAuto = false) {
            const client = isAuto ? this.client : "std";
            const path = item.ImgPath;
            if (path) {
                let img = path.toLowerCase().match(/.*[\/,\\]homeland(.*?).tga/);
                let name = img?.[1].replace(/\\/g, "/");
                if (img?.[1] == "default") {
                    return this.__imgRoot + `homeland/${client}` + "/default/default.png";
                }
                return this.__imgRoot + `homeland/${client}` + name + ".png";
            }
            return `${__cdn}design/horse/${client}/${item.ID}.png`;
        },
        getType(item) {
            let type = "";
            if (item.SubType === 15) {
                type = item.DetailType === 0 ? "普通坐骑" : "奇趣坐骑";
            } else if (item.SubType === 23) {
                const gearTypes = ["头饰", "鞍饰", "足饰", "马饰"];
                type = gearTypes[item.DetailType] || "马具";
            }
            return type;
        },
    },
};
</script>
