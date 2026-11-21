<template>
    <div v-loading="loading" class="min-h-48">
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
            class="m-0 list-none divide-y divide-slate-200 p-0"
        >
            <li
                v-for="(entry, index) in entries"
                :key="entry.exterior_id"
                class="grid items-center gap-2 py-3 text-sm"
                :class="isFavorites ? 'grid-cols-[minmax(0,1fr)_auto]' : 'grid-cols-[1.75rem_minmax(0,1fr)_auto]'"
            >
                <span
                    v-if="!isFavorites"
                    class="grid size-7 place-items-center rounded-full font-bold tabular-nums"
                    :class="rankColors[index] || 'bg-slate-100 text-slate-600'"
                >
                    {{ index + 1 }}
                </span>
                <router-link
                    v-if="entry.exterior"
                    :to="{ name: 'exterior-list', query: { id: entry.exterior.key, view } }"
                    class="flex min-w-0 items-center gap-2 font-semibold hover:text-indigo-600"
                >
                    <img
                        :src="iconLink(entry.exterior.icon_id, $store.state.client)"
                        alt=""
                        class="size-9 shrink-0 rounded-lg"
                    />
                    <span class="min-w-0 break-words">{{ entry.exterior.name }}</span>
                </router-link>
                <div v-else class="min-w-0">
                    <p class="m-0 break-all font-semibold text-slate-700">{{ entry.exterior_id }}</p>
                    <p class="m-0 text-xs text-slate-500">{{ $t("exterior.star.unavailable") }}</p>
                </div>
                <el-button
                    v-if="isFavorites"
                    plain
                    :aria-label="$t('exterior.star.removeNamed', { name: entry.exterior?.name || entry.exterior_id })"
                    :loading="removing.has(entry.exterior_id)"
                    @click="remove(entry.exterior_id)"
                >
                    {{ $t("exterior.star.remove") }}
                </el-button>
                <span
                    v-else
                    class="inline-flex items-center gap-1 whitespace-nowrap tabular-nums text-slate-600"
                    :title="$t('exterior.star.count', { count: entry.count })"
                >
                    <StarFilled class="size-4 text-indigo-500" aria-hidden="true" />
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
import { getExteriorStars, getExteriorStarRanking, removeExteriorStar } from "@/service/exterior";

export default {
    name: "ExteriorStarList",
    components: { PvxActionButton, PvxEmptyState, StarFilled },
    props: {
        view: { type: String, required: true },
        visible: { type: Boolean, default: false },
    },
    data() {
        return {
            rankColors: ["bg-amber-100 text-amber-800", "bg-slate-200 text-slate-700", "bg-orange-100 text-orange-800"],
            entries: [],
            removing: new Set(),
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
        login() {
            User.toLogin();
        },
        errorMessage(error) {
            const { code, msg } = error.response?.data || error.data || { code: error.code, msg: error.message };
            return msg ? (code ? `[${code}] ${msg}` : msg) : this.$t("exterior.requestError");
        },
        async loadEntries() {
            const requestId = ++this.requestId;
            this.entries = [];
            this.loadError = "";
            this.requiresLogin = this.isFavorites && !User.isLogin();
            this.loading = !this.requiresLogin;
            if (this.requiresLogin) return;
            try {
                const entries = await (this.isFavorites ? getExteriorStars() : getExteriorStarRanking());
                if (requestId !== this.requestId) return;
                this.entries = entries;
            } catch (error) {
                if (requestId === this.requestId) this.loadError = this.errorMessage(error);
            } finally {
                if (requestId === this.requestId) this.loading = false;
            }
        },
        async remove(key) {
            if (this.removing.has(key)) return;
            if (!User.isLogin()) {
                this.login();
                return;
            }
            this.removing.add(key);
            try {
                await removeExteriorStar(key);
                this.entries = this.entries.filter(({ exterior_id }) => exterior_id !== key);
                // 重新进入列表时发出的查询可能早于本次删除提交。
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
