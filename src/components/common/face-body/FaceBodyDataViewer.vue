<template>
    <component :is="viewerComponent" class="m-pvx-fb-data-viewer" :data="data" :lock="lock" :type="type" />
</template>

<script>
import Facedat from "@jx3box/jx3box-facedat/src/Facedat.vue";
import Bodydat from "@jx3box/jx3box-facedat/src/Bodydat.vue";

export default {
    name: "FaceBodyDataViewer",
    components: { Facedat, Bodydat },
    props: {
        type: {
            type: String,
            required: true,
            validator: (value) => ["face", "body"].includes(value),
        },
        data: {
            type: [Object, String],
            default: "",
        },
        lock: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        viewerComponent() {
            return this.type === "face" ? "Facedat" : "Bodydat";
        },
    },
};
</script>
