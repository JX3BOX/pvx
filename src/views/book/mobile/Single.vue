<!---
 * @Author: ymg
 * @Date: 2025-08-20 08:58:08
 * @Description: 小程序书籍
 -->
<template>
    <div class="p-pvx-book-single-mobile">
        <SuspendCommon
            :btnOptions="{ showHome: true }"
            :drawerOptions="{
                hideType: ['report', 'rss', 'search', 'user', 'collect'],
                title: book.Name,
                postType: type,
                id: id,
            }"
            v-if="$route.query?.disabled != 'true'"
            class="u-horse-common"
        >
            <template #default>
                <div class="m-pvx-book-suspend-btn">
                    <div class="u-btn-item line" @click="doFav">
                        <img
                            class="u-icon"
                            src="@/assets/img/pvxsuspension/collect_active.svg"
                            svg-inline
                            v-if="favorite"
                        />
                        <img class="u-icon" src="@/assets/img/pvxsuspension/collect.svg" svg-inline v-else />
                        收藏
                    </div>
                </div>
            </template>
        </SuspendCommon>

        <div class="m-pvx-book-info-main">
            <div class="m-box u-top-content">
                <div class="m-title">{{ book.Name }}</div>
                <div :class="{ 'u-box': isShadow }">
                    <div
                        class="u-content"
                        :class="{ scroll: contentScrollTop > 10 }"
                        v-html="book.contentInfo"
                        ref="filteateContent"
                        @scroll="handleFilteateScroll"
                    ></div>
                </div>
            </div>

            <!--        其他-->
            <div class="m-box m-other">
                <div class="m-title">书籍信息</div>
                <div class="u-other-box">
                    <div class="u-item" v-if="!['其它', '碑铭'].includes(getOrigin(book))">
                        <div class="u-title">来源</div>
                        <div class="u-text">
                            <span :class="getOrigin(book) !== '其它' && 'u-pvx-book-special'">{{ getOrigin(book) }}</span>
                        </div>
                    </div>

                    <div class="u-item" v-else>
                        <div class="u-title">来源</div>
                        <div class="u-text">
                            <span v-if="getOrigin(book) === '碑铭'" class="u-pvx-book-special">{{ getOrigin(book) }} </span>
                            <!-- 其它 -->
                            <span v-else>{{ getOrigin(book) }}</span>
                        </div>
                    </div>

                    <div class="u-item">
                        <div class="u-title">所属套书</div>
                        <div class="u-text">
                            {{ "【" + getProfessionType(book.ExtendProfessionID1) + "】" + book.BookName }}
                        </div>
                    </div>
                    <!--                    <div class="u-item" >-->
                    <!--                        <div class="u-title">类型</div>-->
                    <!--                        <div class="u-text">{{ book.MaxAmountPerLand }}</div>-->
                    <!--                    </div>-->
                    <div class="u-item">
                        <div class="u-title">阅读等级</div>
                        <div class="u-text">{{ book.RequireLevel }}</div>
                    </div>
                </div>
                <div class="m-title m-title-other">抄录要求</div>
                <div class="u-other-box">
                    <div class="u-item">
                        <div class="u-title">角色等级</div>
                        <div class="u-text">{{ book.copy?.RequirePlayerLevel }}</div>
                    </div>
                    <div class="u-item">
                        <div class="u-title">阅读等级</div>
                        <div class="u-text">{{ book.copy?.RequireLevel }}</div>
                    </div>
                    <div class="u-item">
                        <div class="u-title">{{ getProfessionType(book.ExtendProfessionID1) }}等级</div>
                        <div class="u-text">{{ book.copy?.RequireLevelExt }}</div>
                    </div>
                    <div class="u-item">
                        <div class="u-title">精力消耗</div>
                        <div class="u-text">{{ book.copy?.CostVigor }}</div>
                    </div>
                    <div class="u-item">
                        <div class="u-title">所需材料</div>
                        <div class="u-text u-copy-list">
                            <item-icon
                                v-for="material in book.copyList"
                                :key="material.item_id"
                                :item_id="material.item_id"
                                :size="28"
                                :amount="material.count"
                                :onlyIcon="true"
                                trigger="click"
                                :isLink="false"
                            ></item-icon>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--        其他列表-->
        <div class="m-pvx-book-other-list">
            <div class="m-title">套书·{{ book.BookName }}</div>
            <div class="u-item">
                <div class="u-list">
                    <div
                        class="u-pvx-book-item"
                        v-for="(item2, index) in showMore ? bookList : bookList.slice(0, 3)"
                        :key="index"
                        @click="openOther(item2)"
                    >
                        <div class="u-pvx-book-cover" :style="{ background: getBookCoverColor() }">
                            <div class="u-pvx-book-name">
                                <div class="u-text">
                                    <!--                                    <div class="u-name-vertical"  :class="{scroll:item2.Name.length>5}">-->
                                    <!--                                        {{item2.Name}}-->
                                    <!--                                    </div>-->
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
            <div class="u-more" v-show="bookList.length > 3 && !showMore" @click="showMore = true">加载更多</div>
        </div>

        <!-- 攻略 -->
        <div class="m-furniture-wiki" v-if="id">
            <Wiki
                source_type="item"
                :source_id="book.ItemID"
                :type="type"
                :id="id"
                title="家具攻略"
                :source_title="book.Name"
            ></Wiki>
        </div>
        <WikiComments type="item" :source-id="String(id)" />
    </div>
</template>

<script>
import SuspendCommon from "@jx3box/jx3box-ui/src/SuspendCommon";

import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";
import { getInfo, getList } from "@/service/book";
import { addFav, delFav, hasFav } from "@jx3box/jx3box-ui/service/fav";
import User from "@jx3box/jx3box-common/js/user";
import ItemIcon from "@/components/common/item_icon.vue";
import WikiComments from "@jx3box/jx3box-ui/src/wiki/WikiComments";
import Wiki from "@/components/wiki/Wiki.vue";
import { wxNewPage } from "@/utils/minprogram";
import {
    getOrigin as _getOrigin,
    getProfessionType as _getProfessionType,
    getBossOrigin as _getBossOrigin,
    getShopOrigin as _getShopOrigin,
    getQuestOrigin as _getQuestOrigin,
    getBookMapInfo,
    BOOK_TYPE_MAP,
    BOOK_TABS,
} from "@/utils/book";

export default {
    name: "bookSingle",
    props: ["isRobot", "sourceId"],
    components: { Wiki, ItemIcon, SuspendCommon, WikiComments },
    data() {
        return {
            favorite: null,
            login: User.isLogin(),
            type: "item",
            isShadow: true, //是否显示阴影
            showMore: false,

            contentScrollTop: 0,
            compatible: false,
            is_empty: true,
            arrowShow: false,
            book: {
                idKey: "",
                Name: "",
                Desc: "",
                BookName: "",
                contentInfo: "",
            },
            loading: false,
            bookMapSite: [], // 碑铭点位信息
            listLoading: false,
            bookList: [],

            bookTypeMap: BOOK_TYPE_MAP,
            tabs: BOOK_TABS,
        };
    },
    methods: {
        iconLink,
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
        openOther(item) {
            wxNewPage(`/book/${item.idKey}`);
        },
        getBookCoverColor() {
            if (!this.book.ExtendProfessionID1) return "#324148";
            return this.tabs.filter((e) => e.id == this.book.ExtendProfessionID1)[0].bgColod;
        },
        handleFilteateScroll(event) {
            const { target } = event;
            this.contentScrollTop = target.scrollTop;
            if (target.scrollHeight - target.scrollTop - target.offsetHeight < 10) {
                this.isShadow = false;
            } else {
                this.isShadow = true;
            }
        },
        doFav: function () {
            if (this.login) {
                this.favorite ? this.delFav() : this.addFav();
            } else {
                this.$message.error("请先登录！");
            }
        },
        hasFav: function () {
            hasFav(this.type, this.idKey).then((res) => {
                this.favorite = res.id || false;
            });
        },
        addFav: function () {
            addFav(this.type, this.idKey, this.book.Name).then((res) => {
                this.favorite = res.id;
            });
        },
        delFav: function () {
            delFav(this.favorite).then(() => {
                this.favorite = false;
            });
        },
        getBossOrigin(book) {
            return _getBossOrigin(book, this.client);
        },
        getShopOrigin: _getShopOrigin,
        getQuestOrigin: _getQuestOrigin,
        getOrigin(item) {
            return _getOrigin(item, this.bookMapInfo);
        },
        getProfessionType: _getProfessionType,
        getData() {
            this.loading = true;
            getInfo({
                id: this.idKey,
                client: this.client,
            })
                .then((res) => {
                    const data = res.data;
                    data.contentInfo = data.contents.map((item) => item.content.replace(/\\n/g, "<br>")).join("<br>");
                    if (data.DoodadTemplateID && this.bookMapInfo[data.DoodadTemplateID]) {
                        this.bookMapSite = this.bookMapInfo[data.DoodadTemplateID];
                        this.bookMapSite[0].position[0] = Object.assign(this.bookMapSite[0].position[0], {
                            title: data.Name,
                            content: `坐标：(${this.bookMapSite[0].position[0].x},${this.bookMapSite[0].position[0].y},${this.bookMapSite[0].position[0].z})`,
                        });
                    }
                    if (data?.copy?.ID) {
                        const keyArr = Object.keys(data.copy).filter((key) => key.indexOf("RequireItem") > -1);
                        let len = parseInt(keyArr.length / 3);
                        data.copyList = [];
                        for (let i = 1; i <= len; i++) {
                            if (data.copy["RequireItemType" + i]) {
                                data.copyList.push({
                                    item_id: data.copy["RequireItemType" + i] + "_" + data.copy["RequireItemIndex" + i],
                                    count: data.copy["RequireItemCount" + i],
                                });
                            }
                        }
                    }
                    this.book = data;

                    // 获取套书列表
                    this.getBookList(data.BookName);
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        getBookList(keyword) {
            const params = {
                page: 1,
                pageSize: 3,
                client: this.client,
                keyword,
            };
            getList(params)
                .then((res) => {
                    this.bookList = res.data.list || [];
                })
                .finally(() => {
                    this.checkNameScroll();
                });
        },
        getLink,
    },
    mounted() {
        this.hasFav();
        this.getData();
    },
    computed: {
        idKey: function () {
            return this.$route.params.id || this.sourceId;
        },
        id: function () {
            return this.book?.ItemID;
        },
        client() {
            return this.$store.state.client;
        },
        bookMapInfo() {
            return getBookMapInfo(this.client);
        },
    },
    watch: {},
};
</script>

<style lang="less">
@import "~@/assets/css/book/mobile/single.less";
</style>
