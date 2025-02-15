<template>
    <div class="m-face-list_mobile">
        <div style="padding-left: 20px; box-sizing: border-box">
            <routine></routine>
        </div>
    </div>
</template>

<script>
import routine from "@/components/face/mobile/routine.vue";
import { isPhone } from "@/utils/index";
import { cloneDeep, omit, concat, debounce } from "lodash";
import { getFaceList, getSliders } from "@/service/face";
export default {
    components: { routine },
    data() {
        return {
            loading: false,
            tabsData: {},
            active: -1,
            list: [
                { label: "全部", list: [], value: -1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成男", list: [], value: 1, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "成女", list: [], value: 2, client: ["std", "origin"], page: 1, pages: 1 },
                { label: "正太", list: [], value: 5, client: ["std"], page: 1, pages: 1 },
                { label: "萝莉", list: [], value: 6, client: ["std", "origin"], page: 1, pages: 1 },
            ],
            page: 1,
            per: 14,
            total: 0,
            count: 0,

            appendMode: false,

            link: {
                data: "/face/facedata",
                key: "face",
            },
            itemData: {
                color: "#786CBB",
                width: "190",
                height: "280",
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        params({ tabsData }) {
            return {
                ...tabsData,
                body_type: this.active,
                pageSize: this.per,
                client: this.client,
            };
        },
        hasNextPage() {
            const pages = this.list.filter((e) => e.value == this.active)[0].pages;
            return pages > 1 && this.page < pages;
        },
        alertTitle: function () {
            if (this.title) return "没找到对应的捏脸，请重新选择条件或关键词搜索";
            return "没有找到相关的捏脸";
        },
        subList() {
            if (!this.active) return null;
            return this.list.filter((e) => e.value === this.active)[0].list;
        },
        typeName() {
            return this.list.filter((e) => e.value == this.active)[0].label;
        },
        noList() {
            if (this.active === -1) return this.list.every((obj) => obj.list.length === 0);
            return this.subList.length === 0;
        },
    },
    watch: {
        params: {
            handler: debounce(function () {
                this.loadData();
            }, 500),
            deep: true,
        },
        active(val) {
            this.per = val === -1 ? this.count : this.count * 3;
            this.page = 1;
        },
    },

    methods: {
        setActive(val) {
            this.active = val;
            document.documentElement.scrollTop = 0;
        },
        // 捏脸海报
        getSliders() {
            getSliders("slider", this.client, 9).then((res) => {
                this.slidersList = res.data.data.list || [];
            });
        },
        // 加载数据
        loadData() {
            this.loading = true;
            let params = omit(this.params, ["type"]);
            if (this.active === -1) {
                const list = this.list.filter((e) => e.value !== -1);
                list.forEach((e) => {
                    params.pageIndex = e.page;
                    params.body_type = e.value;
                    this.loadList(params, e.value);
                });
            } else {
                params.pageIndex = this.page;
                this.loadList({ ...params, body_type: this.active }, this.active);
            }
        },

        loadList(params, key) {
            const index = this.list.findIndex((e) => e.value === key);
            if (this.list[index].pages < params.pageIndex && this.active === -1) params.pageIndex = 1;
            getFaceList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.appendMode ? concat(this.list[index].list, list) : list;
                    this.list[index].list = _list || [];
                    this.list[index].page = page.index || 1;
                    this.list[index].pages = page.pageTotal || 1;
                    if (this.active !== -1) this.page = page.index || 1;
                    this.total = page.total;
                })
                .finally(() => {
                    this.loading = false;
                    this.appendMode = false;
                });
        },
        changePage(i) {
            this.page = i;
            this.loadData();
        },
        appendPage() {
            this.appendMode = true;
            this.handleLoad(this.active);
        },
        handleFaceTabChange: function (data) {
            this.page = 1;
            this.tabsData = data;
        },
        showCount() {
            if (isPhone()) {
                this.per = 8;
                return;
            }
            const listWidth = this.$refs.listRef?.clientWidth - 120;
            this.count = Math.floor(listWidth / (Number(this.itemData.width) + 10));
            this.per = this.active === -1 ? this.count : this.count * 3;
        },
        handleLoad(type) {
            const page = this.list.filter((e) => e.value === type)[0].page;
            let params = cloneDeep(this.params);
            params.pageSize = this.per;
            params.pageIndex = page + 1;
            params.body_type = type;
            this.loadList(params, type);
        },
        listId(list) {
            return list.map((e) => e.id);
        },
    },
    mounted() {
        this.showCount();
    },
};
</script>

<style lang="less"></style>
