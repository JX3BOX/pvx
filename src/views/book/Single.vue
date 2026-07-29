<template>
    <div
        ref="bookSingleWrap"
        class="m-pvx-book-single p-pvx-book-single--modern m-single-wrapper"
    >
        <PvxPageShell class="m-pvx-book-single-shell" v-loading="loading">
                <PvxSurface class="m-pvx-book-navigation" tag="nav" padding="small" radius="medium">
                    <button type="button" class="u-goback" @click="goBack">
                        <ArrowLeft />
                        {{ $t("pages.book.single.ui.backToList") }}
                    </button>
                    <PvxSingleAdminDrop />
                </PvxSurface>

                <PvxSurface class="m-pvx-book-header" tag="header" padding="large">
                    <div class="m-pvx-book-header__info">
                        <div class="m-pvx-book-header__meta">
                            <span class="u-pvx-book-eyebrow">{{ $t("pages.book.single.ui.label") }}</span>
                            <span class="u-pvx-book-type">
                                {{ getProfessionLabel(book.ExtendProfessionID1) }}
                            </span>
                        </div>
                        <h1 class="u-pvx-book-title">{{ book.Name }}</h1>
                        <p class="u-pvx-book-desc" v-html="book.Desc"></p>
                    </div>
                    <a
                        v-if="book.AchievementID"
                        class="u-pvx-book-achievement"
                        target="_blank"
                        rel="noopener noreferrer"
                        :href="getLink('achievement', book.AchievementID)"
                    >
                        <Trophy />
                        {{ $t("pages.book.single.ui.achievement") }}
                    </a>
                    <div class="m-pvx-book-guide-tip">
                        <PvxRobotTip
                            type-name="书籍"
                            :reply="book.Name"
                            variant="modern"
                            :quick-guide-text="$t('pages.book.single.ui.robot.quickGuide')"
                            :copy-success-title="$t('pages.book.single.ui.robot.copySuccess')"
                            :reply-prefix="$t('pages.book.single.ui.robot.replyPrefix')"
                            :reply-suffix="$t('pages.book.single.ui.robot.replySuffix')"
                            :copy-qq-label="$t('pages.book.single.ui.robot.copyQq')"
                            :copy-command-label="$t('pages.book.single.ui.robot.copyCommand')"
                        />
                    </div>
                </PvxSurface>

                <PvxSurface v-if="book" class="m-pvx-book-detail" padding="medium">
                    <div class="m-pvx-book-info-column">
                        <section class="m-pvx-book-info-section">
                            <PvxSectionHeader
                                :title="$t('pages.book.single.ui.information')"
                                level="h2"
                            />
                            <div class="m-pvx-book-info-grid">
                                <div v-if="!['其它', '碑铭'].includes(getOrigin(book))" class="u-info-item book-origin">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.origin") }}</span>
                                    <el-tooltip placement="top" popper-class="book-notice-tooltip">
                                        <template #content>
                                            <div>
                                                <template v-if="getOrigin(book).indexOf('秘境') > -1">
                                                    <div class="u-detail-item">
                                                        {{ $t("pages.book.single.ui.sourceTypes.dungeon") }}
                                                    </div>
                                                    <div class="u-pvx-book-fb" v-html="getBossOrigin(book)"></div>
                                                </template>
                                                <template v-if="getOrigin(book).indexOf('商店') > -1">
                                                    <div class="u-detail-item">
                                                        {{ $t("pages.book.single.ui.sourceTypes.shop") }}
                                                    </div>
                                                    <div class="u-pvx-book-shop" v-html="getShopOrigin(book)"></div>
                                                </template>
                                                <template v-if="getOrigin(book).indexOf('任务') > -1">
                                                    <div class="u-detail-item">
                                                        {{ $t("pages.book.single.ui.sourceTypes.quest") }}
                                                    </div>
                                                    <div class="u-pvx-book-quest">
                                                        <div
                                                            v-for="item in getQuestOrigin(book)"
                                                            :key="item.questId"
                                                            class="quest-item"
                                                        >
                                                            <a
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                :href="getLink('quest', item.questId)"
                                                            >
                                                                [{{ item.questName }}]
                                                            </a>
                                                        </div>
                                                    </div>
                                                </template>
                                            </div>
                                        </template>
                                        <span class="u-info-value u-pvx-book-special">{{ getOrigin(book) }}</span>
                                    </el-tooltip>
                                </div>
                                <div v-else class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.origin") }}</span>
                                    <span class="u-info-value" :class="{ 'u-pvx-book-special': getOrigin(book) === '碑铭' }">
                                        {{ getOrigin(book) }}
                                        <button
                                            v-if="getOrigin(book) === '碑铭' && bookMapSite.length"
                                            type="button"
                                            class="look-site"
                                            @click="dialogVisible = true"
                                        >
                                            {{ $t("pages.book.single.ui.actions.viewLocation") }}
                                        </button>
                                    </span>
                                </div>
                                <div class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.collection") }}</span>
                                    <span class="u-info-value">
                                        【{{ getProfessionLabel(book.ExtendProfessionID1) }}】{{ book.BookName }}
                                    </span>
                                </div>
                                <div class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.readingLevel") }}</span>
                                    <span class="u-info-value">{{ book.RequireLevel }}</span>
                                </div>
                            </div>
                        </section>

                        <section v-if="book.copy && book.copy.ID" class="m-pvx-book-info-section">
                            <PvxSectionHeader
                                :title="$t('pages.book.single.ui.copyRequirements')"
                                level="h2"
                            />
                            <div class="m-pvx-book-info-grid">
                                <div class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.playerLevel") }}</span>
                                    <span class="u-info-value">{{ book.copy?.RequirePlayerLevel }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.readingLevel") }}</span>
                                    <span class="u-info-value">{{ book.copy?.RequireLevel }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span class="u-info-label">
                                        {{ $t("pages.book.single.ui.fields.professionLevel", {
                                            profession: getProfessionLabel(book.ExtendProfessionID1),
                                        }) }}
                                    </span>
                                    <span class="u-info-value">{{ book.copy?.RequireLevelExt }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.vigorCost") }}</span>
                                    <span class="u-info-value">{{ book.copy?.CostVigor }}</span>
                                </div>
                                <div v-if="book.copyList?.length" class="u-info-item u-info-item--materials">
                                    <span class="u-info-label">{{ $t("pages.book.single.ui.fields.materials") }}</span>
                                    <span class="u-info-value m-pvx-book-materials">
                                        <item-icon
                                            v-for="material in book.copyList"
                                            :key="material.item_id"
                                            :item_id="material.item_id"
                                            :size="28"
                                            :amount="material.count"
                                            :onlyIcon="true"
                                        />
                                    </span>
                                </div>
                            </div>
                        </section>
                    </div>

                    <section
                        v-if="book.contentInfo"
                        class="m-pvx-book-reader"
                    >
                        <div class="m-pvx-book-reader-header">
                            <PvxSectionHeader :title="$t('pages.book.single.ui.content')" level="h2" />
                            <button
                                v-if="!/^\d+$/g.test(book.contentInfo)"
                                type="button"
                                class="u-pvx-book-reading-mode"
                                @click="toSwitch"
                            >
                                {{ isVertical
                                    ? $t("pages.book.single.ui.actions.modernMode")
                                    : $t("pages.book.single.ui.actions.classicMode") }}
                            </button>
                        </div>
                        <div
                            class="m-pvx-book-reader-frame"
                            :class="`m-pvx-book-single__content-wrapper-${book.ExtendProfessionID1}`"
                        >
                            <div class="right-div"></div>
                            <div
                                v-if="/^\d+$/g.test(book.contentInfo)"
                                class="u-pvx-book-content img-content"
                            >
                                <img :src="iconLink(book.contentInfo, client)" :alt="book.Name" />
                            </div>
                            <template v-else>
                                <div ref="bookWrap" class="u-pvx-book-content" :class="isVertical ? 'vertical' : 'row'">
                                    <div ref="bookTitle" class="title">{{ book.Name }}</div>
                                    <div ref="bookContent" class="content" v-html="book.contentInfo"></div>
                                </div>
                                <div v-if="arrowShow" class="buttons" :class="isVertical ? 'vertical' : 'row'">
                                    <button type="button" class="left" :disabled="noMore" @click="toMore">
                                        <i :class="isVertical ? 'el-icon-arrow-left' : 'el-icon-arrow-down'"></i>
                                    </button>
                                    <button type="button" class="right" :disabled="noBack" @click="toBack">
                                        <i :class="isVertical ? 'el-icon-arrow-right' : 'el-icon-arrow-up'"></i>
                                    </button>
                                </div>
                            </template>
                        </div>
                    </section>
                </PvxSurface>

                <PvxSurface v-if="bookList.length" class="m-pvx-book-collection" padding="medium" v-loading="listLoading">
                    <PvxSectionHeader
                        :title="$t('pages.book.single.ui.collectionTitle', { name: book.BookName })"
                        level="h2"
                    />
                    <div class="m-pvx-book-collection-grid">
                        <BookCard
                            v-for="item in bookList"
                            :key="item.idKey"
                            :item="item"
                            :is-current="item.idKey == idKey"
                            variant="modern"
                        />
                    </div>
                </PvxSurface>

                <pvx-user
                    class="m-pvx-book-wiki"
                    :id="id"
                    :name="$t('pages.book.single.ui.typeName')"
                    type="item"
                    i18n-key-prefix="pages.book.single.ui.wiki"
                />
            </PvxPageShell>
        <!-- 碑铭信息 -->
        <el-dialog
            :title="$t('pages.book.single.ui.locationTitle')"
            v-model="dialogVisible"
            :width="isPhone() ? '90%' : '38%'"
            center
            destroy-on-close
        >
            <div class="m-book-map">
                <jx3box-map
                    v-if="bookMapSite.length"
                    class="u-content"
                    :map-id="parseInt(bookMapSite[0].map)"
                    :datas="bookMapSite[0].position"
                ></jx3box-map>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import Jx3boxMap from "@jx3box/jx3box-map/src/components/Map.vue";
import ItemIcon from "@/components/common/item_icon.vue";
import BookCard from "@/components/book/BookCard";
import PvxUser from "@/components/PvxUser.vue";
import PvxSingleAdminDrop from "@/components/common/PvxSingleAdminDrop.vue";
import PvxRobotTip from "@/components/common/PvxRobotTip.vue";
import PvxPageShell from "@/components/design/PvxPageShell.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import { ArrowLeft, Trophy } from "@element-plus/icons-vue";

import { __imgPath } from "@/utils/config";

import { getLink, iconLink } from "@jx3box/jx3box-common/js/utils";

import { getInfo, getList } from "@/service/book";
import { isPhone } from "@/utils/index";
import {
    getOrigin as _getOrigin,
    getProfessionType as _getProfessionType,
    getBossOrigin as _getBossOrigin,
    getShopOrigin as _getShopOrigin,
    getQuestOrigin as _getQuestOrigin,
    getBookMapInfo,
} from "@/utils/book";

export default {
    name: "bookSingle",
    components: {
        ArrowLeft,
        BookCard,
        ItemIcon,
        Jx3boxMap,
        PvxPageShell,
        PvxRobotTip,
        PvxSectionHeader,
        PvxSingleAdminDrop,
        PvxSurface,
        PvxUser,
        Trophy,
    },
    data() {
        return {
            compatible: false,
            is_empty: true,
            // 是否古风
            isVertical: true,
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
            dialogVisible: false,
            // 是否还有更多
            noMore: false,
            // 是否还可以返回
            noBack: true,
        };
    },
    methods: {
        toSwitch() {
            this.isVertical = !this.isVertical;
            this.noBack = true;
            this.noMore = false;
        },
        isPhone,
        toMore() {
            const isVertical = this.isVertical;
            const bookWrap = this.$refs.bookWrap;
            if (!bookWrap) return;
            if (isVertical) {
                // 当前为古风
                const sW = bookWrap.scrollWidth;
                const sLeft = bookWrap.scrollLeft;
                const cW = bookWrap.clientWidth;
                const step = Math.ceil(cW / 4);
                if (sW + sLeft > cW) {
                    // 没到尽头
                    bookWrap.scrollBy({
                        left: -step,
                        behavior: "smooth",
                    });
                    this.noMore = false;
                    this.noBack = false;
                } else {
                    this.noMore = true;
                    this.noBack = false;
                }
            } else {
                // 当前为现代
                const sH = bookWrap.scrollHeight;
                const sTop = bookWrap.scrollTop;
                const cH = bookWrap.clientHeight;
                const step = Math.ceil(cH / 2);
                if (sH - sTop > cH) {
                    // 没到底
                    bookWrap.scrollBy({
                        top: step,
                        behavior: "smooth",
                    });
                    this.noMore = false;
                    this.noBack = false;
                } else {
                    this.noMore = true;
                    this.noBack = false;
                }
            }
        },
        toBack() {
            const isVertical = this.isVertical;
            const bookWrap = this.$refs.bookWrap;
            if (isVertical) {
                // 当前为古风
                const sLeft = bookWrap.scrollLeft;
                const cW = bookWrap.clientWidth;
                const step = Math.ceil(cW / 4);
                if (sLeft < 0) {
                    // 没到尽头
                    bookWrap.scrollBy({
                        left: step,
                        behavior: "smooth",
                    });
                    this.noBack = false;
                    this.noMore = false;
                } else {
                    this.noBack = true;
                    this.noMore = false;
                }
            } else {
                // 当前为现代
                const sTop = bookWrap.scrollTop;
                const cH = bookWrap.clientHeight;
                const step = Math.ceil(cH / 2);
                if (sTop > 0) {
                    // 没到顶
                    bookWrap.scrollBy({
                        top: -step,
                        behavior: "smooth",
                    });
                    this.noBack = false;
                    this.noMore = false;
                } else {
                    this.noBack = true;
                    this.noMore = false;
                }
            }
        },
        goBack() {
            this.$router.push({ path: "/" });
        },
        iconLink,
        getBossOrigin(book) {
            return _getBossOrigin(book, this.client);
        },
        getShopOrigin: _getShopOrigin,
        getQuestOrigin: _getQuestOrigin,
        getOrigin(item) {
            return _getOrigin(item, this.bookMapInfo);
        },
        getProfessionLabel(id) {
            const keyMap = {
                9: "buddhism",
                10: "taoism",
                11: "misc",
            };
            const key = keyMap[id];
            return key ? this.$t(`pages.book.ui.types.${key}`) : _getProfessionType(id);
        },
        getData() {
            this.loading = true;
            getInfo({
                id: this.idKey,
                client: this.client,
            })
                .then((res) => {
                    const data = res.data;
                    document.title = `${data.Name} ${this.$t("pages.common.appendTitle")}`;
                    data.contentInfo = data.contents.map((item) => item.content.replace(/\\n/g, "<br>")).join("<br>");
                    if (data.DoodadTemplateID && this.bookMapInfo[data.DoodadTemplateID]) {
                        this.bookMapSite = this.bookMapInfo[data.DoodadTemplateID];
                        this.bookMapSite[0].position[0] = Object.assign(this.bookMapSite[0].position[0], {
                            title: data.Name,
                            content: `${this.$t("pages.book.single.ui.coordinate")}：(${this.bookMapSite[0].position[0].x},${this.bookMapSite[0].position[0].y},${this.bookMapSite[0].position[0].z})`,
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
                    // 保存最近阅读
                    const recentBook = {
                        idKey: data.idKey,
                        Name: data.Name,
                        Desc: data.Desc,
                        ExtendProfessionID1: data.ExtendProfessionID1,
                    };
                    this.$store.dispatch("setRecentReadList", recentBook);
                    // 保存当前书籍类型
                    this.$store.dispatch("setCurrentBookType", data.ExtendProfessionID1);
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
                pageSize: isPhone() ? 8 : 16,
                client: this.client,
                keyword,
            };
            this.$nextTick(() => {
                // const listWidth = this.$refs.bookSingleWrap?.clientWidth;
                // if (!isPhone() && Math.floor(listWidth / 210) < params.pageSize) {
                //     params.pageSize = Math.floor(listWidth / 210);
                // }
                this.listLoading = true;
                getList(params)
                    .then((res) => {
                        this.bookList = res.data.list || [];
                        this.listLoading = false;
                    })
                    .finally(() => {
                        this.listLoading = false;
                    });
            });
        },
        getLink,
    },
    mounted() {
        this.getData();
    },
    computed: {
        idKey: function () {
            return this.$route.params.id;
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
    watch: {
        idKey() {
            this.getData();
        },
        id() {
            if (!/^\d+$/g.test(this.book.contentInfo)) {
                // 非图片
                this.$nextTick(() => {
                    const wrapSW = this.$refs.bookWrap?.scrollWidth;
                    const wrapCW = this.$refs.bookWrap?.clientWidth;
                    if (wrapSW > wrapCW) {
                        this.arrowShow = true;
                    }
                });
            }
        },
        isVertical(bol) {
            if (!/^\d+$/g.test(this.book.contentInfo)) {
                // 非图片
                if (bol) {
                    // 竖版
                    this.$nextTick(() => {
                        const wrapSW = this.$refs.bookWrap.scrollWidth;
                        const wrapCW = this.$refs.bookWrap.clientWidth;
                        this.arrowShow = wrapSW > wrapCW;
                    });
                } else {
                    this.$nextTick(() => {
                        const wrapSH = this.$refs.bookWrap.scrollHeight;
                        const wrapCH = this.$refs.bookWrap.clientHeight;
                        this.arrowShow = wrapSH > wrapCH;
                    });
                }
            }
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/book/single.less";
@import "~@/assets/css/modules/book-detail-theme.less";
</style>
