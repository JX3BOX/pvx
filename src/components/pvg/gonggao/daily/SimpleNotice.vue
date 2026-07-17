<template>
    <div class="m-news">
        <div class="m-news-header" role="tablist" :aria-label="$t('pages.pvg.gonggao.ui.news.category')">
            <button
                :class="`u-mode u-mode-${mode} ${item.value == mode ? 'is-active' : ''}`"
                v-for="item in mode_list"
                :key="item.value"
                type="button"
                :aria-pressed="item.value === mode"
                @click="switchMode(item.value)"
                >{{ item.label }}</button
            >
        </div>
        <ul class="m-news-list" v-if="data">
            <li
                v-for="(item, i) in data"
                :key="i"
                :class="[`is-${item.type}`, { 'has-source': mode === 'all' }]"
            >
                <em v-if="item.time">{{ dateFormat(item.time) }}</em>
                <span v-if="mode === 'all'" class="u-news-source">{{ getModeLabel(item.type) }}</span>
                <a :href="item.url" target="_blank" rel="noopener noreferrer" :title="item.title">
                    {{ item.title }}
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
import { getGameNews, getPosts, getChangelog } from "@/service/pvg/gonggao";
import dateFormat from "@/utils/dateFormat.js";
import { getLink } from "@jx3box/jx3box-common/js/utils";
import zlpData from "@jx3box/jx3box-common/data/jx3_zlp.json";
import dayjs from "dayjs";
const { all_map } = zlpData;
export default {
    name: "SimpleNotice",
    components: {},
    data: function () {
        return {
            mode: "all",
            // 游戏
            all_links: {
                std: "https://jx3.xoyo.com/allnews/",
                origin: "https://jx3yq.xoyo.com/index/#/latest",
            },
            game_links: {
                std: "https://jx3.xoyo.com/allnews/",
                origin: "https://jx3yq.xoyo.com/index/#/latest",
            },
            skill_change_links: {
                std: "/pvp/changelog",
                origin: "/pvp/changelog",
            },
            game_data: [],

            // 魔盒
            box_links: {
                std: "/notice",
                origin: "/notice",
            },
            box_data: [],

            // 技改
            skill_change_data: [],
            pageNumber: 6,
        };
    },
    computed: {
        mode_list() {
            return [
                { label: this.$t("pages.pvg.gonggao.ui.news.all"), value: "all" },
                { label: this.$t("pages.pvg.gonggao.ui.news.game"), value: "game" },
                { label: this.$t("pages.pvg.gonggao.ui.news.skillChange"), value: "skill_change" },
                { label: this.$t("pages.pvg.gonggao.ui.news.box"), value: "box" },
            ];
        },
        client: function () {
            return this.$store.state.client;
        },
        more_link: function () {
            return this[this.mode + "_links"]?.[this.client] || "/";
        },
        all_data: function () {
            let list = [...this.game_data.slice(0, 5), ...this.box_data.slice(0, 2)];
            return list.slice(0, this.pageNumber);
        },
        data: function () {
            return this.mode == "all" ? this.all_data : this[this.mode + "_data"];
        },
        zlp_map() {
            // 生成对象 {key: value}
            return all_map.reduce((obj, item) => {
                obj[item.value] = item.label;
                return obj;
            }, {});
        },
    },
    methods: {
        dateFormat: function (val) {
            return dateFormat(val, "-");
        },
        linkFormat: function (val) {
            if (val.startsWith("/")) {
                return "https://jx3.xoyo.com" + val;
            } else {
                return val;
            }
        },
        switchMode: function (val) {
            this.mode = val;
        },
        getModeLabel(type) {
            return this.mode_list.find((item) => item.value === type)?.label || "";
        },
        loadGameData: function () {
            getGameNews(this.client).then((res) => {
                this.game_data = res?.data.data.list
                    .map((item) => {
                        item.time = dayjs(item.post_date).toDate();
                        item.type = "game";
                        item.title = item.post_title;
                        item.url = item.post_url;
                        return item;
                    })
                    .slice(0, this.pageNumber);
            });
        },
        loadBoxData: function () {
            getPosts(this.client, "notice", this.pageNumber).then((res) => {
                this.box_data = res.data.data?.list?.map((item) => {
                    item.title = item.post_title;
                    item.url = `/notice/${item.ID}`;
                    item.time = new Date(item.post_modified);
                    item.type = "box";
                    return item;
                });
            });
        },
        loadSkillChangeData: function () {
            const params = {
                client: this.client,
            };
            getChangelog(params).then((res) => {
                this.skill_change_data = (res.data.data?.list || []).slice(0, this.pageNumber).map((item) => {
                    item.title = `【${this.zlp_map[item.zlp]}】${item.title}`;
                    item.url = item.link || getLink("bps", item.post_id);
                    item.time = new Date(item.date);
                    item.type = "skill_change";
                    return item;
                });
            });
        },
    },
    mounted: function () {
        this.loadGameData();
        this.loadBoxData();
        this.loadSkillChangeData();
    },
};
</script>
