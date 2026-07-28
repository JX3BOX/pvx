<template>
    <div class="m-pvx-reputation-map">
        <el-carousel v-if="list.length > 1" :autoplay="false" :height="height">
            <el-carousel-item v-for="(datas, mapID) in mapDatas" :key="mapID">
                <jx3box-map :mapId="Number(mapID)" :overview="false" :datas="datas" @resize="handleResize"></jx3box-map>
            </el-carousel-item>
        </el-carousel>
        <jx3box-map
            v-else
            v-for="(datas, mapID) in mapDatas"
            :key="mapID"
            :mapId="Number(mapID)"
            :overview="false"
            :datas="datas"
            @resize="handleResize"
        ></jx3box-map>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";

export default {
    name: "ReputationMap",
    props: {
        name: {
            type: String,
            required: true,
        },
        list: {
            type: Array,
            required: true,
        },
        localized: {
            type: Boolean,
            default: false,
        },
    },
    components: {
        Jx3boxMap,
    },
    data() {
        return {
            height: "275px",
        };
    },
    computed: {
        mapDatas() {
            let result = {};
            for (let data of this.list) {
                let mapId = data.mapId;
                if (!result[mapId]) result[mapId] = [];
                const coor = data.guides;
                const kind = coor.kind || this.mapText("npc", "NPC");
                const coordinate = this.mapText("coordinate", "坐标");
                result[mapId].push({
                    // title: this.name,
                    content: `
                      ${kind}：${coor.npcName}
                      <br /> ${coordinate}：(${coor.positions[0]},${coor.positions[1]},${coor.positions[2]})`,
                    x: coor.positions[0],
                    y: coor.positions[1],
                    z: coor.positions[2],
                });
            }
            return result;
        },
    },
    methods: {
        mapText(key, fallback) {
            return this.localized ? this.$t(`pages.reputation.single.ui.mapLabels.${key}`) : fallback;
        },
        handleResize(size) {
            this.height = size[1] + "px";
        },
    },
};
</script>

<style lang="less"></style>
