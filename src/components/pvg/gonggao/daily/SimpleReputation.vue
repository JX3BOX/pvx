<template>
    <div class="m-simple-reputation">
        <div class="u-reputation-title">声望</div>
        <div class="m-reputations">
            <div class="u-reputation" v-for="(item, i) in list" :key="i">
                <div v-for="(name, index) in getNames(item)" :key="index">{{ name }}</div>
            </div>
        </div>
    </div>
</template>

<script>
// 家园声望
export default {
    name: "SimpleReputation",
    props: {
        activities: {
            type: Array,
            required: true,
        },
    },
    computed: {
        reputation() {
            return this.activities.find((item) => item.key === "swrc") || {};
        },
        list() {
            const val = this.reputation?.val || "";
            return val.indexOf("、") > -1 ? val.split("、").slice(0, 4) : [];
        },
    },
    methods: {
        getNames(name) {
            const str = "声望·";
            if (name.indexOf(str) > -1) {
                const newName = name.split(str)?.[1] || "";
                const newStr = "英雄";
                if (newName.indexOf(newStr) > -1) {
                    return [newStr].concat(newName.split(newStr));
                }
                if (newName.indexOf("·") > -1) {
                    return newName.split("·");
                }
                return [newName];
            }
            return [name];
        },
    },
};
</script>

<style lang="less"></style>
