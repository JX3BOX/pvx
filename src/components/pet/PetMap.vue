<template>
    <div class="m-pvx-pet-map__box">
        <el-carousel :autoplay="false" :height="height">
            <el-carousel-item v-for="(datas, mapID) in mapDatas" :key="mapID">
                <jx3box-map :mapId="Number(mapID)" :datas="datas" @resize="handleResize"></jx3box-map>
            </el-carousel-item>
        </el-carousel>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";
import PetPOI from "@/assets/data/pet_pois.json";

export default {
    name: "PvxPetMap",
    props: {
        petId: {
            type: Number,
            default: 0,
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
            height: "896px",
        };
    },
    mounted() {
        if (this.originDatas?.length) {
            this.$emit("loaded", true);
        }
    },
    computed: {
        originDatas() {
            if (this.petId && PetPOI[this.petId]) {
                return PetPOI[this.petId];
            }
            return [];
        },
        mapDatas() {
            let result = {};
            for (let data of this.originDatas) {
                let mapId = data.MapID;
                if (!result[mapId]) result[mapId] = [];
                for (let coor of data.Coordinates) {
                    result[mapId].push({
                        title: this.pointType(data.WorkType),
                        content: `${this.mapText("coordinate", "坐标")}：(${coor.x},${coor.y},${coor.z}) <br />
                        ${this.objectType(data.ObjectType)}：${data.ObjectID}`,
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
        mapText(key, fallback) {
            return this.localized ? this.$t(`pages.pet.single.ui.mapLabels.${key}`) : fallback;
        },
        pointType: function (WorkType) {
            switch (WorkType) {
                case "TRIGGER":
                    return this.mapText("trigger", "触发点");
                case "LOOT":
                    return this.mapText("prerequisite", "前置/其他");
                default:
                    return this.mapText("unknown", "未知");
            }
        },
        objectType: function (ObjectType) {
            switch (ObjectType) {
                case 3:
                    return this.mapText("npc", "NPC");
                default:
                    return this.mapText("interactiveItem", "交互物品");
            }
        },
    },
};
</script>

<style lang="less" scoped></style>
