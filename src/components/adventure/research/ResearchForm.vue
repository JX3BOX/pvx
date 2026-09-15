<script>
import { getResearchRoles, getResearchAdventures, loadResearchSnapshot } from "@/service/adventure/research";
import ResearchImageUpload from "./ResearchImageUpload.vue";
import { fetchAchievementWorkbenchMaps } from "@/service/achievementWorkbench";
import dailyKeys from "@/assets/data/daily_keys.json";
import { formatResearchTime } from "@/utils/adventureResearch";
export default {
    components: { ResearchImageUpload },
    props: { busy: Boolean },
    emits: ["submit"],
    data() {
        return {
            roles: [],
            adventures: [],
            roleId: "",
            adventureId: "",
            adventureType: "perfect",
            maps: [],
            completedDailies: [],
            dailyOptions: [
                ...dailyKeys.filter((item) => item.type === 1).map((item) => item.name),
                "茶馆日常",
                "门派日常",
                "阵营日常",
            ],
            triggeredAt: "",
            map: "",
            activity: "",
            notes: "",
            images: [],
            uploading: false,
            snapshot: null,
            loading: false,
            error: "",
            requestId: 0,
            snapshotRequestId: 0,
            snapshotLoading: false,
            snapshotError: "",
            unsynced: false,
        };
    },
    computed: {
        canSubmit() {
            const time = new Date(this.triggeredAt).getTime();
            return Boolean(
                !this.busy &&
                    !this.loading &&
                    !this.snapshotLoading &&
                    !this.uploading &&
                    this.snapshot &&
                    this.role &&
                    ["perfect", "normal"].includes(this.adventureType) &&
                    this.filteredAdventures.some((a) => a.id === this.adventureId) &&
                    this.maps.some((m) => m.id === this.map) &&
                    this.triggeredAt &&
                    Number.isFinite(time) &&
                    time <= Date.now() &&
                    this.activity.trim()
            );
        },
        filteredAdventures() {
            return this.adventures.filter((a) => a.type === this.adventureType);
        },
        role() {
            return this.roles.find((r) => r.jx3id === this.roleId);
        },
    },
    created() {
        this.initialize();
    },
    watch: {
        adventureType() {
            this.adventureId = "";
        },
        roleId() {
            this.load();
        },
    },
    methods: {
        formatResearchTime,
        async initialize() {
            const request = ++this.requestId;
            this.snapshot = null;
            this.roleId = "";
            this.adventureId = "";
            this.roles = [];
            this.adventures = [];
            this.error = "";
            this.loading = true;
            try {
                const results = await Promise.allSettled([
                    getResearchRoles(),
                    getResearchAdventures(),
                    fetchAchievementWorkbenchMaps("std"),
                ]);
                if (request !== this.requestId) return;
                const fields = ["roles", "adventures", "maps"];
                const names = ["角色", "奇遇", "地图"];
                const failures = [];
                results.forEach((result, index) => {
                    if (result.status === "fulfilled") this[fields[index]] = result.value;
                    else failures.push(names[index]);
                });
                if (failures.length) this.error = `${failures.join("、")}加载失败，请重试（角色需登录后读取）。`;
                else if (!this.roles.length) this.error = "暂无绑定角色，请登录魔盒并在游戏内绑定、同步。";
            } catch (e) {
                if (request === this.requestId) this.error = "角色、奇遇或地图列表加载失败，请确认登录后重试。";
            } finally {
                if (request === this.requestId) this.loading = false;
            }
        },
        async load() {
            const request = ++this.snapshotRequestId;
            this.snapshot = null;
            this.snapshotError = "";
            this.unsynced = false;
            this.snapshotLoading = false;
            if (!this.role) return;
            this.snapshotLoading = true;
            try {
                const snapshot = await loadResearchSnapshot(this.role);
                if (request === this.snapshotRequestId) this.snapshot = snapshot;
            } catch (e) {
                if (request !== this.snapshotRequestId) return;
                this.unsynced = e.code === "ROLE_NOT_SYNCED";
                if (!this.unsynced) this.snapshotError = "同步信息读取失败";
            } finally {
                if (request === this.snapshotRequestId) this.snapshotLoading = false;
            }
        },
        submit() {
            this.error = "";
            if (!this.canSubmit) {
                this.error = "请填写全部必填项、确认触发时间有效，并等待成就和截图加载完成";
                return;
            }
            const time = new Date(this.triggeredAt).getTime();
            this.$emit("submit", {
                client: "std",
                role: { ...this.role },
                adventure: this.adventures.find((a) => a.id === this.adventureId),
                snapshot: JSON.parse(JSON.stringify(this.snapshot)),
                triggeredAt: new Date(time).toISOString(),
                map: this.maps.find((m) => m.id === this.map)?.name || "",
                mapId: this.map,
                completedDailies: [...this.completedDailies],
                activity: this.activity.trim(),
                notes: this.notes.trim(),
                images: this.images.filter(Boolean),
            });
        },
        resetAfterSave() {
            this.activity = "";
            this.notes = "";
            this.images = [];
            this.$refs.images.clear();
            this.completedDailies = [];
            this.snapshot = null;
            this.triggeredAt = "";
            this.roleId = "";
        },
    },
};
</script>
<template>
    <form class="research-card" @submit.prevent="submit">
        <div class="research-section-title">
            <div>
                <h2>记录一次新的触发</h2>
            </div>
        </div>
        <p v-if="error" role="alert" class="research-error">
            {{ error }} <el-button native-type="button" @click="initialize">重新加载</el-button>
        </p>
        <div class="research-grid">
            <label
                ><span class="research-role-label"
                    ><span><span class="research-required" aria-hidden="true">*</span> 游戏角色</span>
                    <span v-if="snapshotLoading" class="research-muted" role="status">正在读取同步信息…</span>
                    <span v-else-if="snapshot" class="research-muted"
                        >最近同步：{{ formatResearchTime(snapshot.updatedAt) }}</span
                    >
                    <template v-else-if="unsynced"
                        ><span class="research-muted">尚未同步</span
                        ><a href="/pvx/achievements/guide#sync" target="_blank" rel="noopener">查看绑定与同步指引 ↗</a
                        ><el-button link @click.prevent="load">刷新</el-button></template
                    >
                    <template v-else-if="snapshotError"
                        ><span class="research-muted" role="alert">{{ snapshotError }}</span
                        ><el-button link @click.prevent="load">重试</el-button></template
                    > </span
                ><el-select
                    popper-class="research-control-popper"
                    v-model="roleId"
                    aria-required="true"
                    filterable
                    placeholder="选择已绑定角色"
                    :disabled="loading"
                    aria-label="游戏角色"
                    ><el-option
                        v-for="r in roles"
                        :key="r.jx3id"
                        :value="r.jx3id"
                        :label="`${r.name} · ${r.server}`" /></el-select
            ></label>
            <label
                ><span class="research-required" aria-hidden="true">*</span> 奇遇类型<el-select
                    popper-class="research-control-popper"
                    v-model="adventureType"
                    aria-required="true"
                    ><el-option label="绝世奇遇" value="perfect" /><el-option
                        label="普通奇遇"
                        value="normal" /></el-select
            ></label>
            <label
                ><span class="research-required" aria-hidden="true">*</span> 触发奇遇<el-select
                    popper-class="research-control-popper"
                    v-model="adventureId"
                    aria-required="true"
                    filterable
                    placeholder="搜索或选择奇遇"
                    :disabled="loading"
                    ><el-option v-for="a in filteredAdventures" :key="a.id" :value="a.id" :label="a.name" /></el-select
            ></label>
            <label
                ><span class="research-required" aria-hidden="true">*</span> 触发时间<el-date-picker
                    v-model="triggeredAt"
                    aria-required="true"
                    type="datetime"
                    placeholder="选择触发时间"
                    format="YYYY/MM/DD HH:mm"
                    value-format="YYYY-MM-DDTHH:mm:ss"
                    popper-class="research-control-popper"
            /></label>
            <label
                ><span class="research-required" aria-hidden="true">*</span> 所在地图<el-select
                    popper-class="research-control-popper"
                    v-model="map"
                    aria-required="true"
                    filterable
                    clearable
                    placeholder="搜索或选择地图"
                    ><el-option
                        v-for="m in maps"
                        :key="m.id"
                        :value="m.id"
                        :label="`${m.regionName} · ${m.name}`" /></el-select
            ></label>
        </div>
        <label
            ><span class="research-required" aria-hidden="true">*</span> 触发时正在做什么
            <el-input
                type="textarea"
                v-model="activity"
                required
                aria-required="true"
                maxlength="2000"
                :rows="3"
                placeholder="例如：刚完成再来镇日常，走到河边准备钓鱼时触发。"
            />
        </label>
        <section class="research-upload-section">
            <div class="research-field-label">背包和仓库截图</div>
            <ResearchImageUpload ref="images" :disabled="busy" @change="images = $event" @busy="uploading = $event" />
        </section>
        <label
            >当时已完成的日常（可多选）
            <el-select
                popper-class="research-control-popper"
                v-model="completedDailies"
                multiple
                filterable
                allow-create
                default-first-option
                placeholder="选择日常，也可输入任务名后按回车添加"
            >
                <el-option v-for="daily in dailyOptions" :key="daily" :label="daily" :value="daily" />
            </el-select>
        </label>
        <label
            >其他补充<el-input
                type="textarea"
                v-model="notes"
                maxlength="2000"
                :rows="3"
                placeholder="其他值得记录的细节（选填）"
        /></label>
        <div class="research-submit-row">
            <el-button
                native-type="submit"
                type="primary"
                class="research-primary"
                :loading="busy"
                :disabled="!canSubmit"
            >
                {{ busy ? "提交中…" : "提交" }}
            </el-button>
        </div>
    </form>
</template>
