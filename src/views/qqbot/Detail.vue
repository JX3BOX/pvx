<template>
    <div class="p-qqrobot-pvx-detail">
        <div class="m-pvx__container">
            <AdventureSingle v-if="type === 'adventure'" :is-robot="true" :source-id="id"></AdventureSingle>
            <PetSingle v-if="type === 'pet'" :is-robot="true" :source-id="id"></PetSingle>
            <HorseSingle v-if="type === 'horse'" :is-robot="true" :source-id="id"></HorseSingle>

            <RobotBottom :type="type" :id="id"></RobotBottom>
        </div>
    </div>
</template>

<script>
import AdventureSingle from "@/views/adventure/AdventureSingle.vue";
import PetSingle from "@/views/pet/PetSingle.vue";
import HorseSingle from "@/views/horse/HorseSingle.vue";
import RobotBottom from "./Bottom.vue";
export default {
    name: "QQRobotPvxDetail",
    components: {
        AdventureSingle,
        PetSingle,
        HorseSingle,
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
    .m-pvx__item {
        padding: 12px;
        border-radius: 8px;
        box-sizing: border-box;
        background: linear-gradient(to top, #383838 0%, #000000 100%);

        border: 1px solid #6e6e6e !important;

        box-shadow: inset 0px 10px 5px #000000;
        text-shadow: none !important;
        font-size: 10px;
    }
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

    .m-wiki-post-empty {
        &.is-robot-empty {
            width: 100%;
            height: 42px;
            border-radius: 8px;
            box-sizing: border-box;
            background: linear-gradient(to top, #383838 0%, #000000 100%);

            border: 1px solid #6e6e6e !important;

            box-shadow: inset 0px 10px 5px #000000;
            text-shadow: none !important;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 12px;

            color: rgba(#fff, 0.75) !important;
        }
    }
    .m-single-wrapper .m-wiki-post-panel > div {
        margin-bottom: 0 !important;
    }
}
</style>
