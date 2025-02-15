<template>
    <div class="m-special-item m-pet-item">
        <div>福缘宠物</div>
        <div>
            <a
                v-for="item in luckyList"
                :key="item.Index"
                class="u-pet"
                :href="getPetLink(item.Index)"
                target="_blank"
                >{{ item.Name }}</a
            >
        </div>
    </div>
</template>

<script>
import { getPets, getPetLucky } from "@/service/pvg/gonggao";
import dayjs from "@/utils/day";
export default {
    name: "lucky-pet",
    props: {
        date: {
            type: String,
            default: dayjs.tz().format("YYYY-MM-DD"),
        },
        client: {
            type: String,
            default: "std",
        },
    },
    data() {
        return {
            luckyList: [],
        };
    },
    watch: {
        date: {
            immediate: true,
            handler() {
                if (this.client === "std") this.loadPetLucky();
            },
        },
    },
    methods: {
        // 获取福缘宠物
        loadPetLucky: function () {
            getPetLucky().then((res) => {
                let data = res.data.std;
                let dateIndex = dayjs.tz(this.date).format("MDD");
                let ids = data[dateIndex];
                getPets(ids).then((res) => {
                    this.luckyList = res.data.list;
                });
            });
        },
        // 前往宠物单页
        getPetLink(id) {
            return `/pet/${id}`;
        },
    },
};
</script>
