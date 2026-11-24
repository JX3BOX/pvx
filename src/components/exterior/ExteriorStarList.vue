<template>
    <div v-loading="loading" class="min-h-48 space-y-3">
        <div v-if="!requiresLogin && !loadError && rawEntries.length" class="flex flex-wrap gap-1.5">
            <button
                v-for="tab in domainTabs"
                :key="tab.value"
                type="button"
                class="rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
                :class="
                    activeDomain === tab.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                "
                @click="activeDomain = tab.value"
            >
                {{ tab.label }}
            </button>
        </div>

        <PvxEmptyState v-if="requiresLogin" :title="$t('exterior.star.loginRequired')">
            <template #action>
                <PvxActionButton @click="login">{{ $t("exterior.star.login") }}</PvxActionButton>
            </template>
        </PvxEmptyState>
        <PvxEmptyState v-else-if="loadError" :title="$t('exterior.loadError')" :description="loadError" illustrated>
            <template #action>
                <el-button @click="loadEntries">{{ $t("exterior.retry") }}</el-button>
            </template>
        </PvxEmptyState>
        <component
            :is="isFavorites ? 'ul' : 'ol'"
            v-else-if="entries.length"
            class="m-0 list-none divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0"
        >
            <li
                v-for="(entry, index) in entries"
                :key="entryKey(entry)"
                class="grid items-center gap-2 px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 focus-within:bg-slate-50 sm:gap-3 sm:px-4"
                :class="isFavorites ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[1.5rem_minmax(0,1fr)_auto]'"
            >
                <span
                    v-if="!isFavorites"
                    class="grid size-6 place-items-center rounded-full text-xs leading-none font-semibold tabular-nums"
                    :class="rankColors[index] || 'bg-slate-100 text-slate-500'"
                >
                    {{ index + 1 }}
                </span>
                <router-link
                    v-if="entry.exterior"
                    :to="{ name: 'exterior-list', query: { id: entry.exterior.key, view } }"
                    class="flex min-w-0 items-center gap-2.5 rounded-lg font-medium text-slate-700 hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-indigo-500"
                >
                    <img
                        v-if="entryThumb(entry)"
                        :src="entryThumb(entry)"
                        alt=""
                        class="size-10 shrink-0 rounded-lg border border-slate-100 bg-slate-100 object-cover object-top"
                    />
                    <span class="min-w-0 flex-1">
                        <span class="flex items-center gap-1.5 leading-5 wrap-anywhere">
                            <span
                                v-if="isFavorites && entry.pinned"
                                class="inline-flex shrink-0 items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700"
                            >
                                置顶
                            </span>
                            <span>{{ entry.exterior.name }}</span>
                        </span>
                        <span v-if="domainLabel(entry)" class="mt-0.5 block text-xs text-slate-400">
                            {{ domainLabel(entry) }}
                        </span>
                    </span>
                </router-link>
                <div v-else class="min-w-0">
                    <p class="m-0 break-all font-semibold text-slate-700">{{ entryKey(entry) }}</p>
                    <p class="m-0 text-xs text-slate-500">{{ $t("exterior.star.unavailable") }}</p>
                </div>
                <div v-if="isFavorites" class="flex shrink-0 items-center gap-1">
                    <el-button
                        plain
                        size="small"
                        :type="entry.pinned ? 'warning' : 'default'"
                        :loading="pinning.has(entryKey(entry))"
                        @click="togglePin(entry)"
                    >
                        {{ entry.pinned ? $t("exterior.star.unpin") : $t("exterior.star.pin") }}
                    </el-button>
                    <el-button
                        plain
                        size="small"
                        :aria-label="$t('exterior.star.removeNamed', { name: entry.exterior?.name || entryKey(entry) })"
                        :loading="removing.has(entryKey(entry))"
                        @click="remove(entryKey(entry))"
                    >
                        {{ $t("exterior.star.remove") }}
                    </el-button>
                </div>
                <span
                    v-else
                    class="inline-flex min-w-11 items-center justify-center gap-1 rounded-full bg-slate-100 px-2 py-1 whitespace-nowrap text-xs font-medium tabular-nums text-slate-600"
                    :title="$t('exterior.star.count', { count: entry.count })"
                >
                    <StarFilled class="size-3 text-indigo-500" aria-hidden="true" />
                    <span aria-hidden="true">{{ entry.count }}</span>
                    <span class="sr-only">{{ $t("exterior.star.count", { count: entry.count }) }}</span>
                </span>
            </li>
        </component>
        <PvxEmptyState
            v-else-if="!loading"
            :title="$t(`exterior.star.${isFavorites ? 'emptyFavorites' : 'emptyRanking'}`)"
            illustrated
        />
    </div>
</template>

<script>
import { ElMessage } from "element-plus";
import { StarFilled } from "@element-plus/icons-vue";
import User from "@jx3box/jx3box-common/js/user";
import { iconLink } from "@jx3box/jx3box-common/js/utils";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import { DOMAIN_META, pickExteriorCover } from "@/components/exterior/meta";
import {
    getExteriorStars,
    getExteriorStarRanking,
    removeExteriorStar,
    updateExteriorStar,
} from "@/service/exterior";

const FILTER_DOMAINS = [
    { value: "", label: "全部" },
    { value: "bundle", label: "礼盒" },
    { value: "outfit", label: "成衣" },
    { value: "hair", label: "发型" },
    { value: "pendant", label: "挂件" },
    { value: "weapon", label: "武器" },
];

export default {
    name: "ExteriorStarList",
    components: { PvxActionButton, PvxEmptyState, StarFilled },
    props: {
        view: { type: String, required: true },
        visible: { type: Boolean, default: false },
    },
    data() {
        return {
            rankColors: ["bg-rose-100 text-rose-700", "bg-amber-100 text-amber-800", "bg-indigo-100 text-indigo-700"],
            domainTabs: FILTER_DOMAINS,
            activeDomain: "",
            rawEntries: [],
            removing: new Set(),
            pinning: new Set(),
            requiresLogin: false,
            loading: false,
            loadError: "",
            requestId: 0,
        };
    },
    computed: {
        isFavorites() {
            return this.view === "favorites";
        },
        activeRole() {
            return this.$store.state.preferredRole || 2;
        },
        entries() {
            if (!this.activeDomain) return this.rawEntries;
            return this.rawEntries.filter((entry) => entry.exterior?.domain === this.activeDomain);
        },
    },
    watch: {
        visible: {
            immediate: true,
            handler(visible) {
                if (visible) this.loadEntries();
            },
        },
    },
    beforeUnmount() {
        this.requestId++;
    },
    methods: {
        iconLink,
        entryKey(entry) {
            return entry.exterior_key || entry.exterior_id || entry.exterior?.key || "";
        },
        entryThumb(entry) {
            const cover = pickExteriorCover(entry.exterior?.images, this.activeRole);
            if (cover) return cover;
            if (Number(entry.exterior?.icon_id) > 0) {
                return iconLink(entry.exterior.icon_id, this.$store.state.client);
            }
            return "";
        },
        domainLabel(entry) {
            const domain = entry.exterior?.domain;
            return domain ? DOMAIN_META[domain]?.label || domain : "";
        },
        login() {
            User.toLogin();
        },
        errorMessage(error) {
            const { code, msg } = error.response?.data || error.data || { code: error.code, msg: error.message };
            return msg ? (code ? `[${code}] ${msg}` : msg) : this.$t("exterior.requestError");
        },
        async loadEntries() {
            const requestId = ++this.requestId;
            this.rawEntries = [];
            this.loadError = "";
            this.requiresLogin = this.isFavorites && !User.isLogin();
            this.loading = !this.requiresLogin;
            if (this.requiresLogin) return;
            try {
                const entries = await (this.isFavorites ? getExteriorStars() : getExteriorStarRanking({ limit: 30 }));
                if (requestId !== this.requestId) return;
                this.rawEntries = entries;
            } catch (error) {
                if (requestId === this.requestId) this.loadError = this.errorMessage(error);
            } finally {
                if (requestId === this.requestId) this.loading = false;
            }
        },
        async togglePin(entry) {
            const key = this.entryKey(entry);
            if (!key || this.pinning.has(key)) return;
            this.pinning.add(key);
            try {
                const nextPinned = !entry.pinned;
                await updateExteriorStar(key, { pinned: nextPinned });
                entry.pinned = nextPinned;
                this.rawEntries = [...this.rawEntries].sort(
                    (a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned))
                );
            } catch (error) {
                ElMessage.error(this.errorMessage(error));
            } finally {
                this.pinning.delete(key);
            }
        },
        async remove(key) {
            if (!key || this.removing.has(key)) return;
            if (!User.isLogin()) {
                this.login();
                return;
            }
            this.removing.add(key);
            try {
                await removeExteriorStar(key);
                this.rawEntries = this.rawEntries.filter((entry) => this.entryKey(entry) !== key);
                if (this.loading && this.visible) this.loadEntries();
            } catch (error) {
                ElMessage.error(this.errorMessage(error));
            } finally {
                this.removing.delete(key);
            }
        },
    },
};
</script>
