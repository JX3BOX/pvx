import { concat } from "lodash";
import wx from "weixin-js-sdk";

export default {
    data() {
        return {
            loading: false,
            loadingList: false,
            listShow: false,
            isFinish: false,
            active: -1,
            tabsData: [
                { label: "成男", value: 1, client: ["std", "origin"] },
                { label: "成女", value: 2, client: ["std", "origin"] },
                { label: "正太", value: 5, client: ["std"] },
                { label: "萝莉", value: 6, client: ["std", "origin"] },
            ],
            showDrawer: false,
            showCut: false,
            showFiltrate: false,
            noBody: false,
            list: [],
            total: 0,
            queryParams: {
                pageIndex: 1,
                pageSize: 15,
            },
            bodyList: [],
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        habitusName() {
            if (this.active === -1) return "体型";
            const item = this.tabsData.find((t) => t.value === this.active);
            return item ? item.label : "体型";
        },
    },
    mounted() {
        this.loadData();
    },
    methods: {
        search() {
            wx.miniProgram.navigateTo({ url: this.searchUrl });
        },

        handleOpenDrawer(type) {
            if (type === "cut") {
                this.showCut = true;
                this.showFiltrate = false;
                this.noBody = false;
            } else if (type === "filter") {
                if (this.active === -1) {
                    this.showCut = false;
                    this.showFiltrate = false;
                    this.noBody = true;
                } else {
                    this.showCut = false;
                    this.showFiltrate = true;
                    this.noBody = false;
                }
            }
            this.showDrawer = true;
        },

        handleSelectBody() {
            this.showCut = true;
            this.showFiltrate = false;
            this.noBody = false;
        },

        handleCutConfirm(val) {
            this.active = val;
            this.isFinish = false;
            this.queryParams.body_type = val !== -1 ? val : "";
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            if (val !== -1) {
                this.loadData();
            }
        },

        handleFilterConfirm(params) {
            this.filterParams = { ...params };
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.isFinish = false;
            this.listShow = false;
            this.loadData();
        },

        handleToTab(val) {
            this.active = val.body_type;
            this.queryParams.body_type = val.body_type;
            this.queryParams.pageIndex = 1;
            this.list = [];
            this.listShow = false;
            this.isFinish = false;
            if (val.body_type !== -1) {
                this.loadData();
            }
        },

        handleLoadMore() {
            this.queryParams.pageIndex++;
            this.loadData();
        },

        loadData() {
            this.loading = true;
            if (this.active === -1) {
                this.allList.forEach((item, index) => {
                    this.loadList({ client: this.client, ...item.params }, index);
                });
                [1, 2, 5, 6].forEach((bodyType, index) => {
                    this.loadList(
                        { client: this.client, body_type: bodyType, ...this.bodySpecialParams },
                        index,
                        true
                    );
                });
            } else {
                this.loadList({
                    client: this.client,
                    ...this.queryParams,
                    ...this.filterParams,
                    body_type: this.active,
                });
            }
        },

        loadList(params, index, isBody = false) {
            this.loadingList = true;
            if (this.isFinish && !isBody) return;

            this.fetchList(params)
                .then((res) => {
                    const { list, page } = res.data.data;
                    const _list = this.active !== -1 ? concat(this.list, list || []) : list;

                    if (isBody) {
                        this.bodyList.push(_list[0]);
                        return;
                    }

                    if (this.active !== -1) {
                        if (!list || list.length < params.pageSize) this.isFinish = true;
                        this.list = _list || [];
                        this.queryParams.pageIndex = page.index || 1;
                        this.total = page.total;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loadingList = false;
                    this.loading = false;
                    this.listShow = true;
                });
        },
    },
};
