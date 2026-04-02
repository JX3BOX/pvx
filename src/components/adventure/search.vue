<template>
    <div class="m-adventure-search">
        <div class="m-adventure-mark">
            <span class="u-mark" v-for="(item, i) in marks" :key="i" @click="changeMark(i)">
                <b :class="i == index ? 'active' : ''"></b>
                <span>{{ item.name }}</span>
            </span>
        </div>
        <div class="u-input">
            <input type="text" v-model="search" placeholder="请输入奇遇或宠物名字搜索" />
        </div>
    </div>
</template>

<script>
export default {
    name: "search",
    props: ["hasSearch"],
    data: function () {
        return {
            search: "",
            marks: [
                { name: "全部奇遇", type: "all" },
                { name: "绝世奇遇", type: "perfect" },
                { name: "普通奇遇", type: "normal" },
                { name: "宠物奇遇", type: "pet" },
            ],
            index: 0,
        };
    },
    methods: {
        changeMark(i) {
            this.index = i;
            this.jointParams();
        },
        jointParams() {
            let params = {};
            const item = this.marks[this.index];
            if (item.type !== "all") {
                params.type = item.type;
            }
            if (this.search) params.name = this.search;
            this.$emit("onSearch", params);
        },
    },
    watch: {
        search(val) {
            this.jointParams();
        },
        hasSearch(val) {
            this.search = val;
        },
    },
};
</script>
