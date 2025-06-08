<template>
    <div class="p-qqrobot-pvx-detail">
        <div class="m-pvx__container">
            <AdventureSingle v-if="type === 'adventure'" :is-robot="true" :source-id="id"></AdventureSingle>
            <RobotBottom :type="type" :id="id"></RobotBottom>
        </div>
    </div>
</template>

<script>
import AdventureSingle from "@/views/adventure/AdventureSingle.vue";
import RobotBottom from "./Bottom.vue";
export default {
    name: "QQRobotPvxDetail",
    components: {
        AdventureSingle,
        RobotBottom,
    },
    computed: {
        type() {
            return this.$route.query.type || "";
        },
        id() {
            return this.$route.query.id || "";
        },
    },
    mounted() {},
};
</script>

<style lang="less">
.p-qqrobot-pvx-detail {
    position: relative;
    width: 560px;
    background-color: #000;
    box-sizing: border-box;
    .m-pvx__container {
        margin: 0 auto;
        width: 560px;
        height: 100%;
        overflow: hidden;
        .r(12px);
        padding: 10px;
        box-sizing: border-box;
        color: rgba(#ffffff, 0.75);
        border: 0.5px solid transparent;
        background-clip: padding-box, border-box;
        background-origin: padding-box, border-box;
        background-image: linear-gradient(to top, rgba(64, 64, 64, 1), rgba(87, 87, 87, 1)),
            linear-gradient(to top, #000, rgba(255, 255, 255, 0.75));

        overflow-y: auto;
        .c-wiki-panel {
            margin-top: 12px !important;
        }
        .m-wiki-post-panel {
            margin-top: 0 !important;
            .r(8px);
            overflow: hidden;
            .c-wiki-panel {
                margin-bottom: 0;
            }
            .m-panel-actions {
                .none;
            }
        }
    }
}
</style>
