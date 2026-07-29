<template>
    <div class="m-pvx-imperial-list" v-loading="loading">
        <div class="m-search">
            <div class="m-search-control">
                <el-input
                    v-model="search"
                    clearable
                    :placeholder="$t('pages.exam.ui.imperial.placeholder')"
                    :minlength="2"
                >
                    <template #prefix><Search /></template>
                </el-input>
                <el-button class="u-random" :loading="loading" @click="loadRandom">
                    <RefreshRight />
                    {{ $t("pages.exam.ui.imperial.random") }}
                </el-button>
            </div>
            <p class="u-tip" v-if="displayMode === 'random'">
                {{ $t("pages.exam.ui.imperial.randomResult", { count: total }) }}
            </p>
            <p class="u-tip" v-else-if="!normalizedSearch">{{ $t("pages.exam.ui.imperial.tip") }}</p>
            <p class="u-tip" v-else-if="normalizedSearch.length < 2">
                {{ $t("pages.exam.ui.imperial.minLength") }}
            </p>
            <p class="u-tip" v-else>
                {{ $t("pages.exam.ui.imperial.result", { keyword: normalizedSearch, count: total }) }}
            </p>
        </div>

        <div v-if="list.length" class="u-list">
            <article class="u-item" v-for="item in list" :key="item.rid">
                <h3 class="u-title">
                    <template v-for="(part, index) in getTitleParts(item.title)" :key="`${item.rid}-${index}`">
                        <mark v-if="part.highlight">{{ part.text }}</mark>
                        <template v-else>{{ part.text }}</template>
                    </template>
                </h3>
                <div class="u-answer">
                    <span class="u-answer-label">{{ $t("pages.exam.ui.imperial.answer") }}</span>
                    <span class="u-answer-value">{{ getAnswer(item) }}</span>
                </div>
            </article>
        </div>

        <PvxEmptyState
            v-else-if="!loading"
            class="u-empty"
            illustrated
            :title="emptyTitle"
            :description="emptyDescription"
        />
    </div>
</template>

<script>
import { getExamByKey, getExamRandom } from "@/service/exam";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import { RefreshRight, Search } from "@element-plus/icons-vue";
export default {
    name: "ImperialExaminationList",
    components: { PvxEmptyState, RefreshRight, Search },
    data() {
        return {
            search: "",
            total: 0,
            list: [],
            loading: false,
            requestToken: 0,
            searchTimer: null,
            displayMode: "idle",
        };
    },
    computed: {
        normalizedSearch() {
            return this.search.trim();
        },
        emptyTitle() {
            return this.normalizedSearch.length >= 2
                ? this.$t("pages.exam.ui.empty.title")
                : this.$t("pages.exam.ui.imperial.emptyTitle");
        },
        emptyDescription() {
            return this.normalizedSearch.length >= 2
                ? this.$t("pages.exam.ui.empty.description")
                : this.$t("pages.exam.ui.imperial.emptyDescription");
        },
    },
    watch: {
        normalizedSearch(key) {
            const token = ++this.requestToken;
            clearTimeout(this.searchTimer);
            if (key.length < 2) {
                this.displayMode = "idle";
                this.list = [];
                this.total = 0;
                this.loading = false;
                return;
            }

            this.searchTimer = setTimeout(() => {
                this.displayMode = "search";
                this.loading = true;
                getExamByKey({ key })
                    .then((res) => {
                        if (token !== this.requestToken) return;
                        this.list = res.data?.data || [];
                        this.total = this.list.length;
                    })
                    .catch(() => {
                        if (token !== this.requestToken) return;
                        this.list = [];
                        this.total = 0;
                        this.$message.error(this.$t("pages.exam.ui.loadFailed"));
                    })
                    .finally(() => {
                        if (token === this.requestToken) this.loading = false;
                    });
            }, 350);
        },
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
    },
    methods: {
        loadRandom() {
            clearTimeout(this.searchTimer);
            this.search = "";
            this.$nextTick(() => {
                const token = ++this.requestToken;
                this.displayMode = "random";
                this.loading = true;
                getExamRandom(12)
                    .then((res) => {
                        if (token !== this.requestToken) return;
                        this.list = res.data?.data || [];
                        this.total = this.list.length;
                    })
                    .catch(() => {
                        if (token !== this.requestToken) return;
                        this.list = [];
                        this.total = 0;
                        this.$message.error(this.$t("pages.exam.ui.loadFailed"));
                    })
                    .finally(() => {
                        if (token === this.requestToken) this.loading = false;
                    });
            });
        },
        parseArray(value) {
            if (Array.isArray(value)) return value;
            try {
                const result = JSON.parse(value || "[]");
                return Array.isArray(result) ? result : [];
            } catch (_) {
                return [];
            }
        },
        getAnswer(item) {
            const answers = this.parseArray(item.answer);
            const options = this.parseArray(item.options);
            return options.filter((option, index) => answers.includes(index)).join("、") || this.$t("pages.exam.ui.common.noData");
        },
        getTitleParts(title = "") {
            const keyword = this.normalizedSearch;
            if (!keyword) return [{ text: title, highlight: false }];
            const index = title.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase());
            if (index < 0) return [{ text: title, highlight: false }];
            return [
                { text: title.slice(0, index), highlight: false },
                { text: title.slice(index, index + keyword.length), highlight: true },
                { text: title.slice(index + keyword.length), highlight: false },
            ].filter((part) => part.text);
        },
    },
};
</script>
