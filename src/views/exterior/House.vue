<template>
    <PvxSurface padding="medium" class="grid gap-5">
        <PvxSectionHeader :title="$t('exterior.warehouse.title')" level="h1">
            <template #action>
                <PvxActionButton variant="light" @click="$router.push({ name: 'exterior-list' })">
                    {{ $t("exterior.back") }}
                </PvxActionButton>
            </template>
        </PvxSectionHeader>

        <PvxEmptyState v-if="!loggedIn" :title="$t('exterior.warehouse.loginRequired')">
            <template #action>
                <PvxActionButton @click="login">{{ $t("exterior.warehouse.login") }}</PvxActionButton>
            </template>
        </PvxEmptyState>

        <template v-else>
            <div class="flex flex-wrap gap-2">
                <el-select
                    v-model="groupFilter"
                    :placeholder="$t('exterior.warehouse.allGroups')"
                    :aria-label="$t('exterior.warehouse.group')"
                    class="!w-48"
                >
                    <el-option value="" :label="$t('exterior.warehouse.allGroups')" />
                    <el-option v-for="group in groups" :key="group.id" :value="group.id" :label="group.name" />
                </el-select>
                <el-button :disabled="!groupsReady || saving" @click="openGroup">{{
                    $t("exterior.warehouse.createGroup")
                }}</el-button>
            </div>
            <p v-if="notice" class="m-0 text-sm text-red-700" role="alert">
                {{ notice }}
                <el-button text type="primary" :disabled="loading || saving" @click="load">{{
                    $t("exterior.retry")
                }}</el-button>
            </p>

            <div v-loading="loading" class="min-h-24">
                <el-table v-if="entries.length" :data="filteredEntries">
                    <el-table-column :label="$t('pages.index.ui.menus.exterior')" min-width="190">
                        <template #default="{ row }">
                            <router-link
                                v-if="isExteriorKey(row.exterior_id)"
                                :to="{ name: 'exterior-list', query: { id: row.exterior_id } }"
                                class="text-indigo-700"
                            >
                                {{ row.exterior?.name || row.exterior_id }}
                            </router-link>
                            <span v-else>{{ row.exterior?.name || row.exterior_id }}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="count" :label="$t('exterior.warehouse.count')" width="76" />
                    <el-table-column prop="in_price" :label="$t('exterior.warehouse.inPrice')" min-width="100" />
                    <el-table-column prop="out_price" :label="$t('exterior.warehouse.outPrice')" min-width="100" />
                    <el-table-column :label="$t('exterior.warehouse.group')" min-width="100">
                        <template #default="{ row }">{{ groupNames.get(row.group_id) || "—" }}</template>
                    </el-table-column>
                    <el-table-column prop="remark" :label="$t('exterior.warehouse.remark')" min-width="120" />
                    <el-table-column :label="$t('exterior.warehouse.actions')" width="200">
                        <template #default="{ row }">
                            <el-button
                                text
                                type="primary"
                                :disabled="saving || row.id == null"
                                @click="openEntry('edit', row)"
                                >{{ $t("exterior.warehouse.edit") }}</el-button
                            >
                            <el-button
                                v-if="!row.out_date && row.out_price == null"
                                text
                                type="primary"
                                :disabled="saving || row.id == null"
                                @click="openEntry('out', row)"
                                >{{ $t("exterior.warehouse.checkout") }}</el-button
                            >
                            <el-button text type="danger" :disabled="saving || row.id == null" @click="remove(row)">{{
                                $t("exterior.warehouse.remove")
                            }}</el-button>
                        </template>
                    </el-table-column>
                </el-table>
                <PvxEmptyState v-else-if="!loading && !notice" :title="$t('exterior.warehouse.empty')" />
            </div>
        </template>

        <el-dialog
            v-model="dialogOpen"
            :title="$t(`exterior.warehouse.${dialogTitle}`)"
            width="min(460px, calc(100vw - 32px))"
            :close-on-click-modal="!saving"
            :close-on-press-escape="!saving"
            :show-close="!saving"
            @closed="clearAddQuery"
        >
            <el-form label-position="top" @submit.prevent="save">
                <el-form-item v-if="mode === 'group'" :label="$t('exterior.warehouse.group')">
                    <el-input v-model.trim="form.name" />
                </el-form-item>
                <template v-else>
                    <p class="mt-0">{{ entryName }}</p>
                    <el-form-item v-if="mode !== 'out'" :label="$t('exterior.warehouse.inPrice')">
                        <el-input-number v-model="form.in_price" :min="0" :step="0.01" :precision="2" />
                    </el-form-item>
                    <el-form-item v-else :label="$t('exterior.warehouse.outPrice')">
                        <el-input-number v-model="form.out_price" :min="0" :step="0.01" :precision="2" />
                    </el-form-item>
                    <el-form-item v-if="mode !== 'edit'" :label="$t('exterior.warehouse.count')">
                        <el-input-number
                            v-model="form.count"
                            :min="1"
                            :max="mode === 'out' ? Math.min(entry.count, 32) : 32"
                            :precision="0"
                        />
                    </el-form-item>
                    <template v-if="mode !== 'out'">
                        <el-form-item :label="$t('exterior.warehouse.group')">
                            <el-select v-model="form.group_id" :disabled="!groupsReady" :clearable="mode === 'add'">
                                <el-option
                                    v-for="group in groups"
                                    :key="group.id"
                                    :value="group.id"
                                    :label="group.name"
                                />
                            </el-select>
                        </el-form-item>
                        <el-form-item :label="$t('exterior.warehouse.remark')">
                            <el-input v-model="form.remark" type="textarea" />
                        </el-form-item>
                    </template>
                </template>
                <p v-if="formError" class="text-sm text-red-700" role="alert">{{ formError }}</p>
                <div class="flex justify-end">
                    <el-button native-type="submit" type="primary" :loading="saving" :disabled="!canSave">
                        {{ $t("exterior.warehouse.save") }}
                    </el-button>
                </div>
            </el-form>
        </el-dialog>
    </PvxSurface>
</template>

<script>
import { ElMessage, ElMessageBox } from "element-plus";
import User from "@jx3box/jx3box-common/js/user";
import PvxActionButton from "@/components/design/PvxActionButton.vue";
import PvxSurface from "@/components/design/PvxSurface.vue";
import PvxSectionHeader from "@/components/design/PvxSectionHeader.vue";
import PvxEmptyState from "@/components/design/PvxEmptyState.vue";
import {
    addWarehouseEntry,
    checkOutWarehouseEntry,
    createWarehouseGroup,
    deleteWarehouseEntry,
    getWarehouseEntries,
    getWarehouseGroups,
    updateWarehouseEntry,
} from "@/service/exterior";

export default {
    name: "ExteriorHouse",
    components: { PvxActionButton, PvxSurface, PvxSectionHeader, PvxEmptyState },
    data() {
        return {
            loggedIn: User.isLogin(),
            entries: [],
            account: User.getInfo()?.uid,
            serverGroups: [],
            groupFilter: "",
            groupsReady: false,
            loading: false,
            saving: false,
            notice: "",
            dialogOpen: false,
            formError: "",
            mode: "add",
            entry: null,
            form: {},
        };
    },
    computed: {
        pendingGroups() {
            return this.$store.state.pendingWarehouseGroups[this.account] || [];
        },
        groups() {
            return [...this.serverGroups, ...this.pendingGroups];
        },
        groupNames() {
            return new Map(this.groups.map(({ id, name }) => [id, name]));
        },
        filteredEntries() {
            return this.groupFilter === ""
                ? this.entries
                : this.entries.filter((entry) => entry.group_id === this.groupFilter);
        },
        dialogTitle() {
            return { add: "add", edit: "edit", out: "checkout", group: "createGroup" }[this.mode];
        },
        entryName() {
            return this.entry?.exterior?.name || this.entry?.exterior_id;
        },
        canSave() {
            if (this.mode === "group") return Boolean(this.form.name);
            if (this.mode === "edit") return Number.isFinite(this.form.in_price);
            const price = this.mode === "out" ? this.form.out_price : this.form.in_price;
            return Number.isFinite(price) && Number.isInteger(this.form.count) && this.form.count > 0;
        },
    },
    created() {
        if (!this.loggedIn) return;
        this.load();
        const key = this.$route.query.add;
        if (typeof key === "string" && this.isExteriorKey(key)) this.openEntry("add", { exterior_id: key });
    },
    methods: {
        login() {
            User.toLogin();
        },
        isExteriorKey(key) {
            return /^[a-z_]+_[a-z0-9]+$/.test(key);
        },
        errorMessage(error) {
            return error.response?.data?.msg || error.message || this.$t("exterior.requestError");
        },
        async load() {
            this.loading = true;
            this.notice = "";
            const [entries, groups] = await Promise.allSettled([getWarehouseEntries(), getWarehouseGroups()]);
            if (entries.status === "fulfilled") {
                this.entries = entries.value.map((entry) => ({ ...entry, id: entry.store_id ?? entry.id }));
            } else {
                this.notice = this.errorMessage(entries.reason);
            }
            if (groups.status === "fulfilled") {
                this.serverGroups = groups.value.map((group) => ({ ...group, id: group.group_id ?? group.id }));
                const confirmed = new Set(this.serverGroups.map(({ id }) => id));
                this.setPendingGroups(this.pendingGroups.filter(({ id }) => !confirmed.has(id)));
                this.groupsReady = true;
            } else if (!this.notice) {
                this.notice = this.errorMessage(groups.reason);
            }
            this.loading = false;
        },
        setPendingGroups(groups) {
            this.$store.commit("setPendingWarehouseGroups", { account: this.account, groups });
        },
        openGroup() {
            this.mode = "group";
            this.form = { name: "" };
            this.formError = "";
            this.dialogOpen = true;
        },
        openEntry(mode, entry) {
            this.mode = mode;
            this.entry = entry;
            this.form = {
                in_price: Number(entry.in_price ?? 0),
                out_price: 0,
                count: 1,
                group_id: entry.group_id ?? undefined,
                remark: entry.remark || "",
            };
            this.formError = "";
            this.dialogOpen = true;
        },
        clearAddQuery() {
            if (this.$route.name === "exterior-house" && this.$route.query.add)
                this.$router.replace({ name: "exterior-house" });
        },
        async save() {
            if (!this.canSave || this.saving) return;
            this.saving = true;
            this.formError = "";
            const { in_price, out_price, count, group_id, remark, name } = this.form;
            try {
                if (this.mode === "group") {
                    const { id, name: savedName } = await createWarehouseGroup(name);
                    // 分组列表可能暂时读不到已成功写入的记录。
                    this.setPendingGroups([...this.pendingGroups, { id, name: savedName }]);
                } else if (this.mode === "add")
                    await addWarehouseEntry({ exterior_id: this.entry.exterior_id, in_price, count, group_id, remark });
                else if (this.mode === "edit")
                    await updateWarehouseEntry(this.entry.id, { in_price, group_id, remark });
                else await checkOutWarehouseEntry(this.entry.id, { out_price, count });

                this.dialogOpen = false;
                ElMessage.success(this.$t("exterior.warehouse.saved"));
                await this.load();
            } catch (error) {
                this.formError = this.errorMessage(error);
            } finally {
                this.saving = false;
            }
        },
        async remove(entry) {
            try {
                await ElMessageBox.confirm(
                    this.$t("exterior.warehouse.confirmRemove"),
                    this.$t("exterior.warehouse.remove"),
                    { type: "warning" }
                );
            } catch {
                return;
            }
            if (this.saving) return;
            this.saving = true;
            this.notice = "";
            try {
                await deleteWarehouseEntry(entry.id);
                await this.load();
            } catch (error) {
                this.notice = this.errorMessage(error);
            } finally {
                this.saving = false;
            }
        },
    },
};
</script>
