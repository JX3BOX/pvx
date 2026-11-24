<!-- 试衣间体型编辑器：支持浏览/应用魔盒体型库作品、分组微调体型参数滑杆、导入本地 .dat 及一键重置。 -->
<template>
    <div class="m-studio-editor">
        <div class="m-editor-tabs">
            <button
                type="button"
                class="u-editor-tab"
                :class="{ 'is-active': subTab === 'library' }"
                @click="subTab = 'library'"
            >
                魔盒体型库
            </button>
            <button
                type="button"
                class="u-editor-tab"
                :class="{ 'is-active': subTab === 'tune' }"
                @click="subTab = 'tune'"
            >
                精细微调
            </button>
        </div>

        <!-- 魔盒体型库 -->
        <template v-if="subTab === 'library'">
            <div class="m-editor-head">
                <el-input
                    v-model="searchInput"
                    clearable
                    placeholder="搜索体型作品名称或作者…"
                    @input="onSearchInput"
                    @clear="loadLibrary(1)"
                    @keyup.enter="loadLibrary(1)"
                >
                    <template #prefix>
                        <el-icon><Search /></el-icon>
                    </template>
                </el-input>
            </div>

            <div v-loading="libLoading" class="m-editor-scroll">
                <div v-if="!libLoading && !libItems.length" class="m-editor-empty">
                    暂无匹配的{{ bodyLabel }}体型作品
                </div>

                <div v-else class="m-preset-grid">
                    <button
                        v-for="item in libItems"
                        :key="item.id"
                        type="button"
                        class="u-preset-card"
                        :class="{ 'is-active': activePresetId === item.id, 'is-busy': applyingId === item.id }"
                        @click="applyLibraryItem(item)"
                    >
                        <div class="u-preset-thumb">
                            <img v-if="presetCover(item)" :src="presetCover(item)" :alt="item.title" loading="lazy" />
                            <div v-else class="u-preset-placeholder">暂无预览</div>
                            <span v-if="applyingId === item.id" class="u-preset-busy">应用中…</span>
                        </div>
                        <div class="u-preset-info">
                            <div class="u-preset-title" :title="item.title">{{ item.title || `体型 #${item.id}` }}</div>
                            <div class="u-preset-author">{{ item.author_name || "匿名作者" }}</div>
                        </div>
                    </button>
                </div>

                <div v-if="libTotal > libPageSize" class="m-preset-pager">
                    <el-button size="small" :disabled="libPage <= 1" @click="loadLibrary(libPage - 1)">上一页</el-button>
                    <span>{{ libPage }} / {{ Math.ceil(libTotal / libPageSize) }}</span>
                    <el-button
                        size="small"
                        :disabled="libPage * libPageSize >= libTotal"
                        @click="loadLibrary(libPage + 1)"
                    >
                        下一页
                    </el-button>
                </div>
            </div>
        </template>

        <!-- 精细微调 -->
        <template v-else>
            <div class="m-tune-toolbar">
                <label class="u-file-btn">
                    <el-icon><Upload /></el-icon>
                    <span>导入 .dat</span>
                    <input type="file" accept=".dat,.ini,.txt" hidden @change="onFileSelected" />
                </label>
                <el-button size="small" plain round :disabled="!ready" @click="resetBody">
                    <el-icon class="el-icon--left"><RefreshLeft /></el-icon>
                    恢复默认
                </el-button>
            </div>

            <div class="m-editor-scroll">
                <div v-if="!ready || !controls.length" class="m-editor-empty">
                    模型加载完成后即可使用全部体型微调参数
                </div>

                <el-collapse v-else v-model="openGroups" class="m-tune-collapse">
                    <el-collapse-item v-for="grp in groupedControls" :key="grp.name" :title="grp.name" :name="grp.name">
                        <div class="m-slider-list">
                            <div v-for="ctrl in grp.items" :key="ctrl.id" class="m-slider-row">
                                <div class="m-slider-label">
                                    <span>{{ ctrl.label || ctrl.name }}</span>
                                    <span class="u-slider-val">{{ bodyValues[ctrl.id] ?? 0 }}</span>
                                </div>
                                <el-slider
                                    :model-value="bodyValues[ctrl.id] ?? 0"
                                    :min="ctrl.min"
                                    :max="ctrl.max"
                                    :step="1"
                                    :show-tooltip="false"
                                    @input="onSliderChange(ctrl.id, $event)"
                                />
                            </div>
                        </div>
                    </el-collapse-item>
                </el-collapse>
            </div>
        </template>
    </div>
</template>

<script>
import { RefreshLeft, Search, Upload } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { characterProfileFromData, parseCharacterProfile } from "@jx3box/jx3box-exterior";
import { BODY_LABEL_MAP, resolveExteriorAssetUrl } from "@/components/exterior/meta";
import { fetchMallAttachment, searchMallBodies } from "@/service/exterior";

const BODY_GROUPS = [
    { name: "头部与肩颈", test: /(头|颈|脖|肩)/ },
    { name: "胸背与腰腹", test: /(胸|腹|腰|背|躯|胯|臀)/ },
    { name: "手臂与手腕", test: /(臂|手|腕|肘|指)/ },
    { name: "腿足与身高", test: /(腿|膝|踝|足|脚|高|全)/ },
];

export default {
    name: "StudioBodyEditor",
    components: { RefreshLeft, Search, Upload },
    props: {
        preview: { type: Object, default: null },
        role: { type: Number, required: true },
        ready: { type: Boolean, default: false },
    },
    data() {
        return {
            subTab: "library",
            searchInput: "",
            searchTimer: null,
            libItems: [],
            libLoading: false,
            libPage: 1,
            libPageSize: 16,
            libTotal: 0,
            applyingId: null,
            activePresetId: null,

            controls: [],
            bodyValues: {},
            openGroups: ["头部与肩颈", "胸背与腰腹", "手臂与手腕", "腿足与身高", "其他部位"],
            flushing: false,
        };
    },
    computed: {
        bodyLabel() {
            return BODY_LABEL_MAP[this.role] || "";
        },
        groupedControls() {
            const buckets = new Map([
                ["头部与肩颈", []],
                ["胸背与腰腹", []],
                ["手臂与手腕", []],
                ["腿足与身高", []],
                ["其他部位", []],
            ]);
            for (const ctrl of this.controls) {
                const label = `${ctrl.label || ""}${ctrl.name || ""}`;
                const matched = BODY_GROUPS.find((g) => g.test.test(label));
                buckets.get(matched ? matched.name : "其他部位").push(ctrl);
            }
            return [...buckets.entries()]
                .filter(([, items]) => items.length > 0)
                .map(([name, items]) => ({ name, items }));
        },
    },
    watch: {
        role() {
            this.activePresetId = null;
            this.loadLibrary(1);
            this.refreshControls();
        },
        ready(val) {
            if (val) this.refreshControls();
        },
    },
    created() {
        this._pendingChanges = {};
        this.loadLibrary(1);
        if (this.ready) this.refreshControls();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
    },
    methods: {
        presetCover(item) {
            const raw = (Array.isArray(item.images) && item.images[0]) || item.cover || item.banner || "";
            return resolveExteriorAssetUrl(raw);
        },
        onSearchInput() {
            clearTimeout(this.searchTimer);
            this.searchTimer = setTimeout(() => this.loadLibrary(1), 260);
        },
        async loadLibrary(page = 1) {
            this.libPage = page;
            this.libLoading = true;
            try {
                const params = {
                    client: "std",
                    body_type: this.role,
                    code_mode: 0,
                    pageIndex: page,
                    pageSize: this.libPageSize,
                };
                if (this.searchInput.trim()) params.title = this.searchInput.trim();
                const data = await searchMallBodies(params);
                this.libItems = Array.isArray(data?.list) ? data.list : [];
                this.libTotal = Number(data?.page?.total) || 0;
            } catch {
                this.libItems = [];
                this.libTotal = 0;
            } finally {
                this.libLoading = false;
            }
        },
        async refreshControls() {
            if (!this.preview || !this.ready) {
                this.controls = [];
                this.bodyValues = {};
                return;
            }
            try {
                const [controls, profile] = await Promise.all([
                    this.preview.getBodyControls(),
                    this.preview.getBodyProfile(),
                ]);
                this.controls = Array.isArray(controls) ? controls : [];
                const nextValues = {};
                const tBody = profile?.data?.tBody || {};
                for (const c of this.controls) {
                    const val = tBody[c.id] ?? tBody[String(c.id)] ?? 0;
                    nextValues[c.id] = Number.isInteger(val) ? val : 0;
                }
                this.bodyValues = nextValues;
            } catch {
                this.controls = [];
            }
        },
        async applyProfileObject(profile) {
            if (!this.preview || !this.ready) {
                ElMessage.warning("请等待角色模型加载完成");
                return false;
            }
            if (profile.kind !== "body") {
                ElMessage.error("该文件不是体型数据");
                return false;
            }
            if (profile.roleType !== this.role) {
                ElMessage.warning(`该体型适用于「${BODY_LABEL_MAP[profile.roleType] || profile.roleType}」，请先切换体型`);
                return false;
            }
            await this.preview.applyProfile(profile);
            await this.refreshControls();
            return true;
        },
        async applyLibraryItem(item) {
            if (!this.ready) {
                ElMessage.warning("请等待角色模型加载完成");
                return;
            }
            this.applyingId = item.id;
            try {
                const att = await fetchMallAttachment("pvxbody", item.id);
                const profile = att.data
                    ? characterProfileFromData(att.data)
                    : parseCharacterProfile(att.bytes);
                if (await this.applyProfileObject(profile)) {
                    this.activePresetId = item.id;
                    ElMessage.success(`已应用体型「${item.title || `#${item.id}`}」`);
                }
            } catch (err) {
                ElMessage.error(err?.message || "体型数据读取或应用失败");
            } finally {
                this.applyingId = null;
            }
        },
        async onFileSelected(e) {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
                const buf = new Uint8Array(await file.arrayBuffer());
                const profile = parseCharacterProfile(buf);
                if (await this.applyProfileObject(profile)) {
                    this.activePresetId = null;
                    ElMessage.success(`已导入并应用「${file.name}」`);
                }
            } catch (err) {
                ElMessage.error(err?.message || "无法解析体型 .dat 文件");
            }
        },
        async resetBody() {
            if (!this.preview || !this.ready) return;
            try {
                await this.preview.resetBodyProfile();
                this.activePresetId = null;
                await this.refreshControls();
                ElMessage.success("已恢复官方默认体型");
            } catch (err) {
                ElMessage.error(err?.message || "重置体型失败");
            }
        },
        onSliderChange(id, value) {
            const intVal = Math.round(Number(value) || 0);
            this.bodyValues = { ...this.bodyValues, [id]: intVal };
            this._pendingChanges[id] = intVal;
            this.flushSliderChanges();
        },
        async flushSliderChanges() {
            if (this.flushing || !this.preview || !this.ready) return;
            this.flushing = true;
            try {
                while (Object.keys(this._pendingChanges).length > 0) {
                    const batch = JSON.parse(JSON.stringify(this._pendingChanges));
                    this._pendingChanges = {};
                    await this.preview.updateBodyParameters(batch);
                }
            } catch (err) {
                ElMessage.error(err?.message || "体型调节失败");
            } finally {
                this.flushing = false;
            }
        },
    },
};
</script>

<style lang="less" scoped>
@import (reference) "~@/assets/css/design-system/_tokens.less";

.m-studio-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
}

.m-editor-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 12px 14px 10px;
    border-bottom: 1px solid @pvx-border-light;
    flex-shrink: 0;
}

.u-editor-tab {
    padding: 7px 10px;
    border: 1px solid @pvx-border;
    border-radius: 10px;
    background: #fff;
    color: @pvx-text-regular;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.14s;

    &.is-active {
        border-color: @pvx-primary;
        background: @pvx-primary-soft;
        color: @pvx-primary-hover;
    }
}

.m-editor-head,
.m-tune-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid @pvx-border-light;
    flex-shrink: 0;
}

.m-tune-toolbar {
    justify-content: space-between;
}

.u-file-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border: 1px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #ffffff;
    color: @pvx-text-primary;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
        border-color: @pvx-primary;
        color: @pvx-primary-hover;
    }
}

.m-editor-scroll {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 12px 14px 20px;
}

.m-editor-empty {
    padding: 40px 12px;
    text-align: center;
    font-size: 13px;
    color: @pvx-text-secondary;
}

.m-preset-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
}

.u-preset-card {
    display: flex;
    flex-direction: column;
    padding: 0;
    border: 1.5px solid @pvx-border;
    border-radius: 12px;
    background: #fff;
    overflow: hidden;
    text-align: left;
    cursor: pointer;
    transition: all 0.16s;

    &:hover {
        border-color: #a5b4fc;
    }

    &.is-active {
        border-color: @pvx-primary;
        box-shadow: 0 0 0 2px rgba(91, 92, 245, 0.18);
    }
}

.u-preset-thumb {
    position: relative;
    width: 100%;
    aspect-ratio: 4 / 5;
    background: #f1f5f9;
    overflow: hidden;

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top center;
    }

    .u-preset-placeholder {
        display: grid;
        place-items: center;
        width: 100%;
        height: 100%;
        font-size: 12px;
        color: #94a3b8;
    }

    .u-preset-busy {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: rgba(15, 23, 42, 0.48);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
    }
}

.u-preset-info {
    padding: 7px 8px;
    display: grid;
    gap: 2px;

    .u-preset-title {
        font-size: 12px;
        font-weight: 600;
        color: @pvx-text-primary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .u-preset-author {
        font-size: 11px;
        color: @pvx-text-secondary;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.m-preset-pager {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-top: 14px;
    font-size: 12px;
    color: @pvx-text-secondary;
}

.m-tune-collapse {
    border-top: none;
}

.m-slider-list {
    display: grid;
    gap: 10px;
}

.m-slider-row {
    display: grid;
    gap: 2px;

    .m-slider-label {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: @pvx-text-regular;
    }

    .u-slider-val {
        font-weight: 600;
        color: @pvx-primary-hover;
        font-variant-numeric: tabular-nums;
    }

    :deep(.el-slider) {
        height: 22px;
    }
}
</style>
