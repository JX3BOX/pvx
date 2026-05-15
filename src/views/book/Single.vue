<template>
    <div ref="bookSingleWrap" class="m-pvx-book-single m-single-wrapper">
        <template v-if="!isRobot">
            <div class="back-wrap m-navigation">
                <div class="u-goback" @click="goBack">返回列表</div>
                <div class="u-back-right">
                    <PvxRobotTip v-if="!isRobot" type-name="书籍" :reply="book.Name"></PvxRobotTip>
                    <PvxSingleAdminDrop></PvxSingleAdminDrop>
                </div>
            </div>
            <div v-if="book" class="m-pvx-book-single__content" v-loading="loading">
                <div class="m-pvx-book-single__header">
                    <h2 class="u-pvx-book-title">{{ book.Name }}</h2>
                    <p class="u-pvx-book-desc" v-html="book.Desc"></p>
                </div>
                <div class="m-pvx-book-single__detail">
                    <div class="m-pvx-book-single__info">
                        <p class="u-subtitle">
                            <img svg-inline src="@/assets/img/book/book-info.svg" />
                            <span>书籍信息</span>
                        </p>
                        <div class="u-book-info">
                            <div v-if="!['其它', '碑铭'].includes(getOrigin(book))" class="u-item book-origin">
                                来源：
                                <el-tooltip placement="top" popper-class="book-notice-tooltip">
                                    <template #content>
                                        <div>
                                            <template v-if="getOrigin(book).indexOf('秘境') > -1">
                                                <div class="u-detail-item">秘境</div>
                                                <div class="u-pvx-book-fb" v-html="getBossOrigin(book)"></div>
                                            </template>
                                            <template v-if="getOrigin(book).indexOf('商店') > -1">
                                                <div class="u-detail-item">商店</div>
                                                <div class="u-pvx-book-shop" v-html="getShopOrigin(book)"></div>
                                            </template>
                                            <template v-if="getOrigin(book).indexOf('任务') > -1">
                                                <div class="u-detail-item">任务</div>
                                                <div class="u-pvx-book-quest">
                                                    <div
                                                        class="quest-item"
                                                        v-for="item in getQuestOrigin(book)"
                                                        :key="item.questId"
                                                    >
                                                        <a target="_blank" :href="getLink('quest', item.questId)">
                                                            [{{ item.questName }}]</a
                                                        >
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </template>
                                    <span :class="getOrigin(book) !== '其它' && 'u-pvx-book-special'">{{
                                        getOrigin(book)
                                    }}</span>
                                </el-tooltip>
                            </div>
                            <div v-else class="u-info-item">
                                来源：<span v-if="getOrigin(book) === '碑铭'" class="u-pvx-book-special"
                                    >{{ getOrigin(book) }}
                                    <a
                                        class="look-site"
                                        href="javascript:;"
                                        v-if="bookMapSite.length"
                                        @click="dialogVisible = true"
                                        >查看位置</a
                                    >
                                </span>
                                <!-- 其它 -->
                                <span v-else>{{ getOrigin(book) }}</span>
                            </div>
                            <div class="u-info-item">
                                所属套书：{{
                                    "【" + getProfessionType(book.ExtendProfessionID1) + "】" + book.BookName
                                }}
                            </div>
                            <div class="u-info-item">阅读等级：{{ book.RequireLevel }}</div>
                        </div>
                        <template v-if="book.copy && book.copy.ID">
                            <p class="u-subtitle">
                                <img svg-inline src="@/assets/img/book/request.svg" />
                                <span>抄录要求</span>
                            </p>
                            <div class="u-book-info">
                                <div class="u-info-item">
                                    <span>角色等级：</span>
                                    <span>{{ book.copy?.RequirePlayerLevel }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span>阅读等级：</span>
                                    <span>{{ book.copy?.RequireLevel }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span>{{ getProfessionType(book.ExtendProfessionID1) }}等级：</span>
                                    <span>{{ book.copy?.RequireLevelExt }}</span>
                                </div>
                                <div class="u-info-item">
                                    <span>精力消耗：</span>
                                    <span>{{ book.copy?.CostVigor }}</span>
                                </div>
                                <div v-if="book.copyList?.length" class="u-info-item">
                                    <span>所需材料：</span>
                                    <item-icon
                                        v-for="material in book.copyList"
                                        :key="material.item_id"
                                        :item_id="material.item_id"
                                        :size="28"
                                        :amount="material.count"
                                        :onlyIcon="true"
                                    ></item-icon>
                                </div>
                            </div>
                        </template>
                    </div>
                    <div
                        v-if="book.contentInfo"
                        class="m-pvx-book-single__content-wrapper"
                        :class="`m-pvx-book-single__content-wrapper-${book.ExtendProfessionID1}`"
                    >
                        <div class="right-div"></div>
                        <div
                            v-if="/^\d+$/g.test(book.contentInfo)"
                            class="u-pvx-book-content"
                            :class="/^\d+$/g.test(book.contentInfo) && 'img-content'"
                        >
                            <img :src="iconLink(book.contentInfo, client)" :alt="iconLink(book.contentInfo, client)" />
                        </div>
                        <template v-else>
                            <div ref="bookWrap" class="u-pvx-book-content" :class="isVertical ? 'vertical' : 'row'">
                                <div ref="bookTitle" class="title">{{ book.Name }}</div>
                                <div ref="bookContent" class="content" v-html="book.contentInfo"></div>
                            </div>
                            <div v-if="arrowShow" class="buttons" :class="isVertical ? 'vertical' : 'row'">
                                <div class="left" :class="noMore && 'disabled'" @click="toMore">
                                    <i :class="isVertical ? 'el-icon-arrow-left' : 'el-icon-arrow-down'"></i>
                                    <!-- <span>继续</span> -->
                                </div>
                                <div class="right" :class="noBack && 'disabled'" @click="toBack">
                                    <!-- <span>返回</span> -->
                                    <i :class="isVertical ? 'el-icon-arrow-right' : 'el-icon-arrow-up'"></i>
                                </div>
                            </div>
                            <div class="switch" @click="toSwitch">{{ isVertical ? "古风" : "现代" }}</div>
                        </template>
                    </div>
                </div>
                <!-- 套书列表 -->
                <div v-if="bookList.length" class="m-pvx-book-list" v-loading="listLoading">
                    <div class="u-title">
                        <span class="title">套书·{{ book.BookName }}</span>
                        <a
                            v-if="book.AchievementID"
                            class="u-pvx-book-achievement"
                            target="_blank"
                            :href="getLink('achievement', book.AchievementID)"
                        >
                            <!-- [{{ book.achievement ? book.achievement.Name : "" }}] -->
                            <i class="el-icon-warning"></i>
                            <span>该套书有成就</span>
                        </a>
                    </div>
                    <div class="m-pvx-book-list__wrapper">
                        <div class="m-pvx-book-list__content">
                            <BookCard :item="item" v-for="(item, index) in bookList" :key="item.idKey + index">
                            </BookCard>
                        </div>
                    </div>
                </div>
                <!-- 碑铭信息 -->
                <!-- <div v-if="bookMapSite.length" class="m-book-map">
                <div class="u-title">
                    <span class="u-txt">碑铭信息</span>
                </div>
                <jx3box-map
                    class="u-content"
                    :map-id="parseInt(bookMapSite[0].map)"
                    :datas="bookMapSite[0].position"
                ></jx3box-map>
            </div> -->
            </div>
        </template>
        <template v-else>
            <div class="m-pvx__item m-pvx-robot-book-header">
                <div class="m-title">
                    <div class="u-title">书籍 · {{ book?.Name || "" }}</div>
                    <div class="m-meta">
                        <div class="u-meta u-class" :class="`u-class-${book.ExtendProfessionID1}`">
                            {{ bookTypeMap?.[book.ExtendProfessionID1] || "" }}
                        </div>
                        <div class="u-pvx-book-desc" v-html="book.Desc"></div>
                    </div>
                </div>
                <div class="u-right">
                    <img class="u-icon" src="@/assets/img/qqbot/jx3box_qqbot_book.svg" />
                </div>
            </div>
            <div class="m-pvx-robot-book-info">
                <div class="m-pvx__item m-book-info">
                    <div class="u-title">书籍信息</div>
                    <div class="m-list">
                        <div v-if="!['其它', '碑铭'].includes(getOrigin(book))" class="u-item book-origin">
                            来源：
                            <span :class="getOrigin(book) !== '其它' && 'u-pvx-book-special'">{{ getOrigin(book) }}</span>
                        </div>
                        <div v-else class="u-info-item">
                            来源：<span v-if="getOrigin(book) === '碑铭'" class="u-pvx-book-special"
                                >{{ getOrigin(book) }}
                            </span>
                            <!-- 其它 -->
                            <span v-else>{{ getOrigin(book) }}</span>
                        </div>
                        <div class="u-info-item">
                            所属套书：{{ "【" + getProfessionType(book.ExtendProfessionID1) + "】" + book.BookName }}
                        </div>
                        <div class="u-info-item">阅读等级：{{ book.RequireLevel }}</div>
                    </div>
                </div>
                <div class="m-pvx__item m-book-write">
                    <div class="u-title">抄录要求</div>

                    <div class="m-list">
                        <div class="u-info-item">
                            <span>角色等级：</span>
                            <span>{{ book.copy?.RequirePlayerLevel }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>阅读等级：</span>
                            <span>{{ book.copy?.RequireLevel }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>{{ getProfessionType(book.ExtendProfessionID1) }}等级：</span>
                            <span>{{ book.copy?.RequireLevelExt }}</span>
                        </div>
                        <div class="u-info-item">
                            <span>精力消耗：</span>
                            <span>{{ book.copy?.CostVigor }}</span>
                        </div>
                    </div>
                    <div v-if="book.copyList?.length" class="u-info-item m-materials">
                        <span>所需材料：</span>
                        <div class="u-material" v-for="material in book.copyList" :key="material.item_id">
                            <item-icon :item_id="material.item_id" :onlyName="true"></item-icon>
                            <span class="u-num"> x {{ material.count }}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="m-pvx-robot-book-pack">
                <div class="u-title">同套书籍 · {{ book.BookName }}</div>
                <div class="m-pvx__item m-book-pack">
                    <div class="u-item" v-for="(item, index) in bookList" :key="item.idKey + index">
                        {{ item.SegmentName }}
                    </div>
                </div>
            </div>
            <div class="m-pvx-robot-book-content">
                <div class="m-pvx-book-content">
                    <div class="u-content" v-for="(item, i) in contentList" :key="i">
                        <div class="u-title" v-if="!i">《{{ book.Name }}》</div>
                        <div v-html="item"></div>
                    </div>
                </div>
            </div>
        </template>
        <!-- 包含攻略、评论、历史版本、点赞等 书籍，宠物等物品为item, 声望成就等为achievement -->
        <pvx-user :id="id" name="书籍" type="item" :is-robot="isRobot"></pvx-user>
        <!-- 碑铭信息 -->
        <el-dialog
            title="碑铭位置"
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
    BOOK_TYPE_MAP,
} from "@/utils/book";

export default {
    name: "bookSingle",
    props: ["isRobot", "sourceId"],
    components: { Jx3boxMap, BookCard, ItemIcon, PvxUser, PvxSingleAdminDrop, PvxRobotTip },
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
            bookTypeMap: BOOK_TYPE_MAP,
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
        getProfessionType: _getProfessionType,
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
        splitText(text, ratios = [3.2, 3.4, 3.4]) {
            const segments = [];
            const totalLength = text.length;

            // 计算总比例单位
            const totalRatio = ratios.reduce((sum, ratio) => sum + ratio, 0);

            // 计算每段的实际长度
            const segmentLengths = ratios.map((ratio) => Math.floor((totalLength * ratio) / totalRatio));

            let start = 0;
            for (let i = 0; i < ratios.length; i++) {
                let end = start + segmentLengths[i];

                // 最后一段直接到文本末尾
                if (i === ratios.length - 1) {
                    end = totalLength;
                } else {
                    // 在指定范围内寻找合适的分割点
                    const searchRange = Math.min(100, totalLength - end);
                    let found = false;

                    // 首先尝试找段落边界（\n\n）
                    for (let j = end; j < end + searchRange; j++) {
                        if (text[j] === "\n" && j + 1 < totalLength && text[j + 1] === "\n") {
                            end = j + 2;
                            found = true;
                            break;
                        }
                    }

                    // 如果没有找到段落边界，找句子结束符号
                    if (!found) {
                        const punctuation = [".", "。", ";", "；", "!", "！", "?", "？"];
                        for (let j = end; j < end + searchRange; j++) {
                            if (
                                punctuation.includes(text[j]) &&
                                (j + 1 >= totalLength || ["\n", " "].includes(text[j + 1]))
                            ) {
                                end = j + 1;
                                break;
                            }
                        }
                    }
                }

                segments.push(text.substring(start, end));
                start = end;
            }

            return segments;
        },
    },
    mounted() {
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
        contentList() {
            return this.splitText(this.book.contentInfo);
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
@import "~@/assets/css/book/robot.less";
</style>
