<template>
    <div class="m-simple-mp">
        <div class="m-mp-item" :class="item.current && 'is-active'" v-for="(item, index) in list" :key="index">
            <div class="u-mp-title">
                <div class="u-name">{{ item.name }}</div>
                <div class="u-map">{{ item.map }}</div>
            </div>
            <div class="u-mp-time">
                {{ item.time }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "SimpleMp",
    data() {
        return {
            list: [
                {
                    name: "事件名称",
                    map: "地图位置",
                    time: "周一 07:00 ~ 周六 06:59",
                    current: true,
                },
                {
                    name: "事件名称",
                    map: "地图位置",
                    time: "周六 12:00/14:00/16:00/18:00/20:00/22:00",
                },
                {
                    name: "事件名称",
                    map: "地图位置",
                    time: "周日 12:00/14:00/16:00/18:00/20:00/22:00",
                },
            ],
        };
    },
};
</script>
