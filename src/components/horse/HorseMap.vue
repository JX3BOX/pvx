<template>
    <div class="m-horse-map">
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
                        马驹·${horseName.indexOf("·") > -1 ? horseName.split("·")[0] : horseName}
                        <br /> 坐标：(${coor.x},${coor.y},${coor.z})`,
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
            this.height = size[1] + "px";
        },
    },
};
</script>

<style lang="less"></style>
