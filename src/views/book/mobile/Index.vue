<!---
 * @Author: ymg
 * @Date: 2025-08-20 08:58:08
 * @Description: 小程序书籍
 -->

<template>
    <div class="p-pvx-book-mobile" ref="bookRef" @scroll="handleScroll">
        <SuspendCommon :btnOptions="{ showHome: true }"
            :drawerOptions="{ hideType: ['collect', 'rss', 'laterOn', 'pin', 'user', 'report', 'search'] }">
            <template #default>
                <!--                切换按钮区域-->
                <div class="m-pvx-book-suspend-btn">
                    <div class="u-btn-item line" @click="switchClick">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/switch_touchbar.svg" svg-inline />
                        {{ switchTitle }}
                    </div>
                    <div class="u-btn-item line" @click="searchClick">
                        <img class="u-icon" src="@/assets/img/pvxsuspension/search.svg" svg-inline />
                        搜索
                    </div>
                </div>
            </template>
        </SuspendCommon>
        <el-drawer v-model="showForm" direction="btt" :with-header="false" :modal-append-to-body="false" append-to-body
            class="c-drawer">
            <div class="m-pvx-book-cut">
                <div class="u-cut-all" :class="{ 'is-active': showActive == -1 }" @click="showActive = -1">
                    <img class="u-icon" src="@/assets/img/pvxsuspension/all.svg" svg-inline /> 全部书籍
                </div>
                <div class="u-cut-box">
                    <div class="u-cut-item" v-for="(item, index) in tabs" :key="index"
                        :class="{ 'is-active': showActive == item.id }" @click="showActive = item.id">
                        <img class="u-icon" src="@/assets/img/book/zj.svg" svg-inline v-if="item.id == 11" />
                        <img class="u-icon" src="@/assets/img/book/dj.svg" svg-inline v-if="item.id == 10" />
                        <img class="u-icon" src="@/assets/img/book/fx.svg" svg-inline v-if="item.id == 9" />

                        <span>{{ item.label }} </span>
                    </div>
                </div>
                <div class="u-cut-btn">
                    <div class="u-report-btn" @click="report()">重置</div>
                    <div class="u-confirm-btn" :class="{ active: showHighlightConfirm }" @click="cut()">确定</div>
                </div>
            </div>
        </el-drawer>
        <div class="m-pvx-book-list" v-if="active === -1">
            <div class="u-item" v-for="(item, index) in allList" :key="index">
                <div class="m-title">
                    {{ item.label }}
                </div>
                <div class="u-list">
                    <div class="u-pvx-book-item" v-for="(item2, index2) in item.list" :key="'book' + index2"
                        @click="openOther(item2, item.bgColod)">
                        <div class="u-pvx-book-cover" :style="{ background: item.bgColod }">
                            <div class="u-pvx-book-name">
                                <div class="u-text">
                                    <!--                                   <div class="u-name-vertical"  :class="{scroll:item2.Name.length>5}">-->
                                    <!--                                       {{item2.Name}}-->
                                    <!--                                   </div>-->
                                    {{
                                        item2.Name.length > 5
                                            ? (item2.Name.match(/[\u4e00-\u9fa5]/g) || []).slice(0, 5).join("")
                                            : item2.Name
                                    }}
                                </div>
                            </div>
                            <div class="u-pvx-book-line">
                                <img src="../../../assets/img/book/line.png" />
                            </div>
                        </div>
                        <div class="u-name"><span class="u-name-text">{{ item2.Name }}</span></div>
                        <div class="u-desc">{{ item2.Desc }}</div>
                    </div>
                </div>
            </div>
        </div>
        <div class="m-pvx-book-list" v-else>
            <div class="u-item">
                <div class="u-list">
                    <div class="u-pvx-book-item" v-for="(item2, index) in list" :key="index" @click="openOther(item2)">
                        <div class="u-pvx-book-cover" :style="{ background: getBookCoverColor() }">
                            <div class="u-pvx-book-name">
                                <div class="u-text">
                                    {{
                                        item2.Name.length > 5
                                            ? (item2.Name.match(/[\u4e00-\u9fa5]/g) || []).slice(0, 5).join("")
                                            : item2.Name
                                    }}
                                </div>
                            </div>
                            <div class="u-pvx-book-line">
                                <img src="../../../assets/img/book/line.png" />
                            </div>
                        </div>
                        <div class="u-name"><span class="u-name-text">{{ item2.Name }}</span></div>
                        <div class="u-desc">{{ item2.Desc }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";
import { omit, cloneDeep, concat } from "lodash";
import { getList } from "@/service/book";
import wx from "weixin-js-sdk";
import { wxNewPage } from "@/utils/minprogram";
import { BOOK_TABS } from "@/utils/book";

export default {
    name: "Index",
    components: { SuspendCommon },
    data() {
        return {
            loading: false,
            tabs: BOOK_TABS,
            allList: [
                {
                    label: "杂集",
                    bgColod: "#324148",
                    total: 0,
                    list: [],
                    params: {
                        page: 1,
                        per: 6,
                        profession: 11,
                    },
                },
                {
                    label: "道学",
                    bgColod: "#194372",
                    total: 0,
                    list: [],
                    params: {
                        page: 1,
                        per: 6,
                        profession: 10,
                    },
                },
                {
                    label: "佛学",
                    bgColod: "#947d2e",
                    total: 0,
                    list: [],
                    params: {
                        page: 1,
                        per: 6,
                        profession: 9,
                    },
                },
            ],

            active: -1,
            showActive: -1, //切换弹窗内active，仅在弹窗打开时有效
            showHighlightConfirm: false,
            switchTitle: "分类",
            showForm: false,
            cutShow: false,
            isFinish: false,
            list: [],
            queryParams: {
                page: 1,
                per: 15,
            },
        };
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
    },
    watch: {
        showActive(val) {
            this.showHighlightConfirm = val !== this.active;
        },
    },
    methods: {
        checkNameScroll() {
            this.$nextTick(() => {
                const nameEls = this.$el.querySelectorAll(".u-name");
                nameEls.forEach((el) => {
                    const textEl = el.querySelector(".u-name-text");
                    if (!textEl) return;
                    const overflow = textEl.scrollWidth - el.clientWidth;
                    if (overflow > 0) {
                        textEl.classList.add("is-scroll");
                        textEl.style.setProperty("--scroll-offset", `-${overflow}px`);
                        textEl.style.setProperty("--scroll-duration", `${Math.max(3, overflow / 20)}s`);
                    } else {
                        textEl.classList.remove("is-scroll");
                    }
                });

                const bookNameEls = this.$el.querySelectorAll(".u-pvx-book-name .u-text");
                bookNameEls.forEach((el) => {
                    const overflow = el.scrollHeight - el.clientHeight;
                    if (overflow > 0) {
                        el.classList.add("is-scroll");
                        el.style.setProperty("--vscroll-offset", `-${overflow}px`);
                        el.style.setProperty("--vscroll-duration", `${Math.max(4, overflow / 10)}s`);
                    } else {
                        el.classList.remove("is-scroll");
                    }
                });
            });
        },
        getBookCoverColor() {
            if (this.active == -1) return;
            return this.tabs.filter((e) => e.id == this.active)[0].bgColod;
        },
        openOther(item, bgColor) {
            wxNewPage(`/book/${item.idKey}`);
        },
        // 加载更多处理
        handleScroll(event) {
            if (this.active == -1) return;
            const { target } = event;
            if (this.loading || this.isFinish) return;
            if (target.scrollHeight - target.scrollTop - 60 < target.clientHeight) {
                this.queryParams.page++;

                this.showForm = false;
                this.loadData();
            }
        },
        switchClick() {
            this.showForm = true;
        },
        searchClick() {
            wx.miniProgram.navigateTo({
                url: `/pages/search/search-detail/search-detail?app=书籍大全&filter_name=pvxbook`,
            });
        },
        // 切换书籍时操作
        cut() {
            if (!this.showHighlightConfirm) {
                this.showForm = false;
                return;
            }
            this.cutShow = false;
            this.active = this.showActive;
            this.isFinish = false;
            this.showForm = false;
            this.queryParams.profession = "";
            if (this.active != -1) {
                this.queryParams.profession = this.active;
                this.queryParams.pageIndex = 1;
                this.list = [];
                this.listShow = false;
                this.loadData();
            }
            let info = this.tabs.filter((e) => e.id == this.active)[0];
            info.label ? (this.switchTitle = info.label) : "分类";
            // this.switchType('filtrateShow')
        },
        report() {
            this.showActive = -1;
            this.cut();
        },
        loadData() {
            this.loading = true;
            if (this.active === -1) {
                this.allList.forEach((e, index) => {
                    this.loadList({ client: this.client, ...e.params }, index);
                });
            } else {
                this.loadList(this.queryParams);
            }
        },
        // 加载type对应的数据
        loadList(params, index) {
            if (this.isFinish) return;
            getList(params)
                .then((res) => {
                    const { list, page } = res.data;
                    const _list = this.active != -1 ? concat(this.list, list || []) : list;

                    if (this.active !== -1) {
                        if (!list || list.length < params.per) this.isFinish = true;
                        this.list = _list || [];
                        this.queryParams.page = page.index || 1;
                    } else {
                        this.allList[index].list = _list || [];
                    }
                })
                .finally(() => {
                    this.loading = false;
                    this.checkNameScroll();
                });
        },
    },
    mounted: function () {
        this.loadData();
    },
};
</script>

<style lang="less">
@import "~@/assets/css/book/mobile/index.less";
</style>
