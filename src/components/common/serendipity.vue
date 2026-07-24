<template>
    <div class="m-serendipity" v-if="title" v-loading="loading">
        <WikiPanel>
            <template #head-title>
                <i class="u-icon el-icon-present"></i>
                <span class="u-txt">{{ $t("pages.adventure.single.ui.records.title") }}</span>
                <el-select
                    v-model="server"
                    :placeholder="$t('pages.adventure.single.ui.records.serverPlaceholder')"
                    class="u-server"
                    @change="changeServer"
                >
                    <el-option v-for="item in servers" :key="item" :label="item" :value="item"></el-option>
                </el-select>
            </template>
            <template #head-actions>
                <a class="u-more" href="https://j3cx.com/serendipity" target="_blank">
                    {{ $t("pages.adventure.single.ui.records.viewMore") }} &raquo;
                </a>
            </template>
            <template #body>
                <ul class="u-list" v-if="list && list.length > 0">
                    <li class="u-header">
                        <span class="u-date">{{ $t("pages.adventure.single.ui.records.date") }}</span>
                        <span class="u-time">{{ $t("pages.adventure.single.ui.records.activeTime") }}</span>
                        <span class="u-server">{{ $t("pages.adventure.single.ui.records.server") }}</span>
                        <span class="u-name">{{ $t("pages.adventure.single.ui.records.player") }}</span>
                    </li>
                    <li v-for="(item, i) in list" :key="i">
                        <span class="u-date">
                            <em class="u-mobile-label">{{ $t("pages.adventure.single.ui.records.date") }}</em>
                            {{ formatDate(item.date_str) }}
                        </span>
                        <span class="u-time">
                            <em class="u-mobile-label">{{ $t("pages.adventure.single.ui.records.activeTime") }}</em>
                            {{ formatWikiDate(item.dwTime) }}
                        </span>
                        <span class="u-server">
                            <em class="u-mobile-label">{{ $t("pages.adventure.single.ui.records.server") }}</em>
                            {{ item.region }}-{{ item.server }}
                        </span>
                        <span class="u-name">
                            <em class="u-mobile-label">{{ $t("pages.adventure.single.ui.records.player") }}</em>
                            {{ item.name || $t("pages.adventure.single.ui.records.anonymous") }}
                        </span>
                    </li>
                </ul>
                <el-alert
                    v-else
                    class="u-alert"
                    :title="$t('pages.adventure.single.ui.records.empty')"
                    type="info"
                    center
                    :closable="false"
                />
            </template>
        </WikiPanel>
    </div>
</template>
<script>
import servers from "@jx3box/jx3box-data/data/server/server_cn.json";
import WikiPanel from "@jx3box/jx3box-ui/src/wiki/WikiPanel";
import { getUserInfo, getSerendipity } from "@/service/adventure/serendipity";
import { showRecently, showDate as showDateFn } from "@/utils/moment";
import User from "@jx3box/jx3box-common/js/user";
export default {
    name: "serendipity",
    props: ["title"],
    components: {
        WikiPanel,
    },
    data: function () {
        return {
            servers,
            server: "长安城",
            list: [],
            loading: false,
        };
    },
    computed: {
        params: function () {
            return {
                server: this.server,
                serendipity: this.title,
                start: 0,
                pageIndex: 1,
                pageSize: 10,
            };
        },
    },
    methods: {
        formatWikiDate(val) {
            return showRecently(val * 1000, this.$i18n.locale);
        },
        formatDate(val) {
            return showDateFn(val);
        },
        loadSerendipity() {
            this.loading = true;
            getSerendipity(this.params)
                .then((res) => {
                    this.list = res.data.data.data;
                })
                .finally(() => {
                    this.loading = false;
                });
        },
        changeServer() {
            this.loadSerendipity();
        },
    },
    mounted: function () {
        if (User.isLogin()) {
            getUserInfo()
                .then((res) => {
                    this.server = res.data.data.jx3_server || "长安城";
                })
                .then(() => {
                    this.loadSerendipity();
                });
        } else {
            this.loadSerendipity();
        }
    },
};
</script>

<style lang="less">
@import "~@/assets/css/common/serendipity.less";
</style>
