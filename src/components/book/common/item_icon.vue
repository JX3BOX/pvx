<!--
 * @Author: X3ZvaWQ
 * @Date: 2022-07-11 00:14:57
 * @LastEditors: X3ZvaWQ
 * @LastEditTime: 2022-08-23 20:11:18
 * @Description: 各个地方都有用到的，后端没有联物品表，只提供了物品id，通过该组件展示物品
-->
<template>
    <el-popover
        class="u-item"
        placement="right-start"
        trigger="hover"
        :visible-arrow="false"
        popper-class="u-item__popup"
    >
        <template slot="reference">
            <div class="u-item__wrapper" :class="{ background: !onlyIcon, is_vertical: vertical }">
                <a
                    class="u-item-icon"
                    target="_blank"
                    :style="`height:${size}px; width:${size}px`"
                    :href="getLink('item', source.id)"
                    v-if="!onlyName"
                >
                    <img
                        class="u-item-icon__img"
                        :style="`height:${size}px; width:${size}px`"
                        :src="iconLink(source.IconID)"
                    />
                    <div
                        class="u-item-icon__quality"
                        :style="{ backgroundImage: item_border(source), opacity: source.Quality == 5 ? 0.9 : 1 }"
                    ></div>
                    <div class="u-item-icon__quest" :style="{ backgroundImage: item_border_quest(source) }"></div>
                    <span class="u-item-icon__count" v-if="display_amount !== 1">{{ display_amount }}</span>
                </a>
                <div v-if="!onlyIcon" class="u-item-name" :class="`e-jx3-item__q${source.Quality}`">
                    {{ source.Name }}
                </div>
            </div>
        </template>
        <jx3-item :item="source" />
    </el-popover>
</template>

<script>
import Item from "@jx3box/jx3box-editor/src/Item";
import { get_item } from "@jx3box/jx3box-editor/service/item";
import { iconLink, getLink } from "@jx3box/jx3box-common/js/utils";
import { __imgPath } from "@/utils/config";

export default {
    name: "ItemIcon",
    data() {
        return {
            source: {},
            real_id: null,
            maybeBook: false,
        };
    },
    components: {
        "jx3-item": Item,
    },
    props: {
        size: {
            type: Number,
            default: 28,
        },
        item_id: {
            type: String,
            default: null,
        },
        amount: {
            type: Number,
            default: 1,
        },
        onlyName: {
            type: Boolean,
            default: false,
        },
        onlyIcon: {
            type: Boolean,
            default: false,
        },
        vertical: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        get_data(item_id) {
            if (item_id) {
                get_item(item_id, this.client)
                    .then((res) => {
                        let item = res.data;
                        if (Object.keys(item).length) {
                            this.source = item;
                            sessionStorage.setItem(this.cache_key, JSON.stringify(item));
                        }
                    })
                    .catch((e) => {
                        //书籍类物品id为 type_id_recipe， 其中recipe记录在物品的count里面
                        if (e?.data?.code == 400) {
                            if (this.maybeBook === false) {
                                this.maybeBook = true;
                                this.real_id = `${this.item_id}_${this.amount}`;
                            }
                        }
                    });
            }
        },
        iconLink,
        getLink,
        item_border_quest(item) {
            if (item.IsQuest > 0) return `url(${__imgPath}image/item/renwu.png)`;
            return "";
        },
        item_border(item) {
            switch (item.Quality) {
                case 3:
                    return `url(${__imgPath}image/item/blue.png)`;
                case 4:
                    return `url(${__imgPath}image/item/purple.png)`;
                case 5:
                    return `url(${__imgPath}image/item/orange.gif)`;
                default:
                    return "";
            }
        },
    },
    computed: {
        client() {
            return this.$store.state.client;
        },
        cache_key() {
            return `item-${this.client}-${this.real_id}`;
        },
        display_amount() {
            if (this.maybeBook === false) {
                return this.amount;
            } else {
                return 1;
            }
        },
    },
    watch: {
        real_id: {
            immediate: true,
            handler() {
                let _cache = sessionStorage.getItem(this.cache_key);
                if (_cache) {
                    try {
                        this.source = JSON.parse(_cache);
                    } catch (e) {
                        console.log(e, "[Item]无法解析本地缓存");
                        this.get_data(this.real_id);
                    }
                } else {
                    this.get_data(this.real_id);
                }
            },
        },
        item_id: {
            immediate: true,
            handler() {
                this.real_id = this.item_id;
            },
        },
    },
};
</script>

<style lang="less">
@import "~@/assets/css/book/common/item_icon.less";
</style>
