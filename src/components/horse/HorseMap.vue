<template>
    <div class="m-horse-map is-trimmed" :style="{ '--horse-map-trim-offset': trimOffset + 'px' }">
        <el-carousel :autoplay="false" :height="height">
            <el-carousel-item v-for="(datas, mapID) in mapDatas" :key="mapID">
                <jx3box-map :mapId="Number(mapID)" :datas="datas" @resize="handleResize"></jx3box-map>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";

export default {
    name: "HorseMap",
    props: {
        name: {
            type: String,
            required: true,
        },
        list: {
            type: Array,
            required: true,
        },
    },
    components: {
        Jx3boxMap,
    },
    data() {
        return {
            height: "896px",
            trimOffset: 0,
        };
    },
    computed: {
        mapDatas() {
            let result = {};
            const horseName = this.name;
            for (let data of this.list) {
                let mapId = data.mapId;
                if (!result[mapId]) result[mapId] = [];
                for (let coor of data.coordinates) {
                    result[mapId].push({
                        title: data.mapName,
                        content: `
                        ${this.$t("pages.horse.single.ui.map.youngHorse", {
                            name: horseName.indexOf("·") > -1 ? horseName.split("·")[0] : horseName,
                        })}
                        <br /> ${this.$t("pages.horse.single.ui.map.coordinate")}：(${coor.x},${coor.y},${coor.z})`,
                        x: coor.x,
                        y: coor.y,
                        z: coor.z,
                    });
                }
            }
            return result;
        },
    },
    methods: {
        handleResize(size) {
            const width = Array.isArray(size) ? Number(size[0] || 0) : 0;
            const h = Array.isArray(size) ? Number(size[1] || 0) : 0;
            if (!h) return;
            // 标准地图原图上下带有约 5% 宽度的透明边，详情页裁去透明区域以铺满容器。
            const trim = width * 0.05;
            const target = Math.max(h - trim, 0);
            this.trimOffset = trim / 2;
            this.height = target + "px";
        },
    },
};
</script>

<style lang="less"></style>
