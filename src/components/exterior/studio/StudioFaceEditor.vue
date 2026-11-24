<!-- 试衣间捏脸编辑器：支持写意/写实双体系切换、魔盒捏脸库检索应用、全量妆容贴花恢复、骨骼与妆容调色微调及 .dat 导入。 -->
<template>
    <div class="m-studio-editor">
        <!-- 写意 / 写实双体系切换栏 -->
        <div class="m-face-style-switch">
            <button
                type="button"
                class="u-style-btn"
                :class="{ 'is-active': faceStyle === 'stylized' }"
                :disabled="switchingFaceStyle"
                @click="$emit('switch-face-style', 'stylized')"
            >
                写意捏脸
            </button>
            <button
                type="button"
                class="u-style-btn"
                :class="{ 'is-active': faceStyle === 'meta' }"
                :disabled="switchingFaceStyle"
                @click="$emit('switch-face-style', 'meta')"
            >
                写实捏脸
            </button>
        </div>

        <div class="m-editor-tabs">
            <button
                type="button"
                class="u-editor-tab"
                :class="{ 'is-active': subTab === 'library' }"
                @click="subTab = 'library'"
            >
                魔盒捏脸库
            </button>
            <button
                type="button"
                class="u-editor-tab"
                :class="{ 'is-active': subTab === 'tune' }"
                @click="subTab = 'tune'"
            >
                骨骼与妆容
            </button>
        </div>

        <!-- 魔盒捏脸库 -->
        <template v-if="subTab === 'library'">
            <div class="m-editor-head">
                <el-input
                    v-model="searchInput"
                    clearable
                    placeholder="搜索捏脸作品名称…"
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
                    暂无匹配的{{ bodyLabel }}{{ faceStyle === "meta" ? "写实" : "写意" }}捏脸作品
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
                            <span v-if="applyingId === item.id" class="u-preset-busy">
                                <span class="u-busy-spin" aria-hidden="true" />
                                <span>{{ faceProgress > 0 ? `应用中 ${faceProgress}%` : "读取中…" }}</span>
                            </span>
                        </div>
                        <div class="u-preset-info">
                            <div class="u-preset-title" :title="item.title">{{ item.title || `捏脸 #${item.id}` }}</div>
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

        <!-- 骨骼与妆容精细微调 -->
        <template v-else>
            <div class="m-tune-toolbar">
                <label class="u-file-btn">
                    <el-icon><Upload /></el-icon>
                    <span>导入 .dat</span>
                    <input type="file" accept=".dat,.ini,.txt" hidden @change="onFileSelected" />
                </label>
                <div class="flex items-center gap-1.5">
                    <el-button size="small" plain round @click="$emit('focus-face')">面部特写</el-button>
                    <el-button size="small" plain round :disabled="!ready" @click="resetFace">
                        <el-icon class="el-icon--left"><RefreshLeft /></el-icon>
                        重置
                    </el-button>
                </div>
            </div>

            <div class="m-editor-scroll">
                <div v-if="!ready || (!boneAreas.length && !activeMakeups.length)" class="m-editor-empty">
                    模型加载完成后即可微调面部骨骼与妆容参数
                </div>

                <el-collapse v-else v-model="openAreas" class="m-tune-collapse">
                    <!-- 写实妆容实时调节 -->
                    <el-collapse-item
                        v-if="faceStyle === 'meta' && activeMakeups.length"
                        title="妆容调色与浓淡"
                        name="__makeup__"
                    >
                        <div class="m-makeup-list">
                            <div v-for="slot in activeMakeups" :key="slot.slotKey" class="m-makeup-card">
                                <div class="m-makeup-card__head">
                                    <span class="u-slot-title">{{ slot.label }}</span>
                                    <el-color-picker
                                        v-if="slot.customRGB"
                                        :model-value="slot.hex"
                                        size="small"
                                        @change="onMakeupColorChange(slot, $event)"
                                    />
                                </div>
                                <div v-for="slider in slot.sliders" :key="slider.key" class="m-slider-row">
                                    <div class="m-slider-label">
                                        <span>{{ slider.label }}</span>
                                        <span class="u-slider-val">{{ Number(slider.value).toFixed(2) }}</span>
                                    </div>
                                    <el-slider
                                        :model-value="slider.value"
                                        :min="slider.min"
                                        :max="slider.max"
                                        :step="0.01"
                                        :show-tooltip="false"
                                        @input="onMakeupSliderChange(slot.slotKey, slider.key, $event)"
                                    />
                                </div>
                            </div>
                        </div>
                    </el-collapse-item>

                    <!-- 骨骼调节按部位分组 -->
                    <el-collapse-item v-for="area in boneAreas" :key="area.name" :title="area.name" :name="area.name">
                        <div class="m-slider-list">
                            <div v-for="ctrl in area.items" :key="ctrl.key" class="m-slider-row">
                                <div class="m-slider-label">
                                    <span>{{ ctrl.group ? `${ctrl.group} · ` : "" }}{{ ctrl.label }}</span>
                                    <span class="u-slider-val">{{ boneValues[ctrl.key] ?? 0 }}</span>
                                </div>
                                <el-slider
                                    :model-value="boneValues[ctrl.key] ?? 0"
                                    :min="ctrl.min"
                                    :max="ctrl.max"
                                    :step="ctrl.step || 1"
                                    :show-tooltip="false"
                                    @input="onBoneSliderChange(ctrl.key, $event)"
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
import { fetchMallAttachment, getFaceDecalManifestUrl, searchMallFaces } from "@/service/exterior";

const LIVE_META_MAKEUP_TYPES = new Set([10, 11, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22]);

const META_SLOT_LABELS = {
    4: "腮红",
    7: "面纹 / 花钿 I",
    8: "面纹 / 花钿 II",
    9: "面纹 / 花钿 III",
    10: "唇釉底色",
    11: "唇彩细闪",
    12: "唇彩叠涂",
    13: "唇部高光",
    14: "唇型立体",
    15: "眼影底色",
    16: "眼影加深",
    17: "眼影高光",
    18: "眼影晕染",
    19: "眼影细闪 I",
    20: "眼影细闪 II",
    21: "眼影细闪 III",
    22: "眼影细闪 IV",
};

function rgbToHex(r255, g255, b255) {
    const clamp = (n) => Math.max(0, Math.min(255, Math.round(n || 0)));
    return (
        "#" +
        [clamp(r255), clamp(g255), clamp(b255)]
            .map((c) => c.toString(16).padStart(2, "0"))
            .join("")
    );
}

function hexToStoredChannels(hex) {
    const clean = String(hex || "").replace("#", "");
    if (clean.length !== 6) return null;
    const r = parseInt(clean.slice(0, 2), 16) / 100;
    const g = parseInt(clean.slice(2, 4), 16) / 100;
    const b = parseInt(clean.slice(4, 6), 16) / 100;
    return { fColorR: r, fColorG: g, fColorB: b };
}

export default {
    name: "StudioFaceEditor",
    components: { RefreshLeft, Search, Upload },
    props: {
        preview: { type: Object, default: null },
        role: { type: Number, required: true },
        ready: { type: Boolean, default: false },
        faceStyle: { type: String, default: "stylized" },
        switchingFaceStyle: { type: Boolean, default: false },
        applyFaceHandler: { type: Function, default: null },
        faceProgress: { type: Number, default: 0 },
    },
    emits: ["switch-face-style", "apply-face-profile", "focus-face"],
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

            boneControls: [],
            boneValues: {},
            decalOptions: [],
            faceProfileData: null,
            openAreas: ["__makeup__"],

            flushingBones: false,
            flushingMakeups: false,
        };
    },
    computed: {
        bodyLabel() {
            return BODY_LABEL_MAP[this.role] || "";
        },
        boneAreas() {
            const map = new Map();
            for (const c of this.boneControls) {
                const area = c.area || "面部骨骼";
                if (!map.has(area)) map.set(area, []);
                map.get(area).push(c);
            }
            return [...map.entries()].map(([name, items]) => ({ name, items }));
        },
        activeMakeups() {
            if (this.faceStyle !== "meta" || !this.faceProfileData?.tDecal) return [];
            const tDecal = this.faceProfileData.tDecal;
            const list = [];
            for (const [slotKey, selection] of Object.entries(tDecal)) {
                const type = Number(slotKey);
                if (!Number.isInteger(type) || !selection?.nShowID) continue;
                const opt =
                    this.decalOptions.find((d) => d.type === type && d.showId === selection.nShowID) ||
                    ((type === 8 || type === 9) &&
                        this.decalOptions.find((d) => d.type === 7 && d.showId === selection.nShowID));
                if (!opt) continue;
                const supportsLive =
                    typeof opt.liveMakeup === "boolean" ? opt.liveMakeup : LIVE_META_MAKEUP_TYPES.has(type);
                if (!supportsLive) continue;
                const disabled = Array.isArray(opt.rgbDisabledSlots)
                    ? opt.rgbDisabledSlots.includes(type)
                    : !opt.customRGB;
                const customRGB = type >= 10 || !disabled;
                const sliders = (opt.sliders || []).map((s) => ({
                    ...s,
                    value: selection.bUse && Number.isFinite(selection[s.key]) ? Number(selection[s.key]) : s.min,
                }));
                if (!customRGB && !sliders.length) continue;
                list.push({
                    slotKey: String(slotKey),
                    type,
                    label: opt.name || META_SLOT_LABELS[type] || `妆容 ${type}`,
                    customRGB,
                    hex: rgbToHex(
                        (selection.fColorR ?? 1) * 100,
                        (selection.fColorG ?? 1) * 100,
                        (selection.fColorB ?? 1) * 100
                    ),
                    sliders,
                });
            }
            return list;
        },
    },
    watch: {
        role() {
            this.activePresetId = null;
            this.loadLibrary(1);
        },
        faceStyle() {
            this.activePresetId = null;
            this.loadLibrary(1);
            this.refreshControls();
        },
        ready(val) {
            if (val) this.refreshControls();
        },
    },
    created() {
        // Worker Comlink payload 与预设中止句柄挂在普通实例字段上，避免 Vue Reactive Proxy 触发 DataCloneError。
        this._pendingBones = {};
        this._pendingMakeups = {};
        this._presetAbort = null;
        this._presetSeq = 0;
        this.loadLibrary(1);
        if (this.ready) this.refreshControls();
    },
    beforeUnmount() {
        clearTimeout(this.searchTimer);
        this._presetAbort?.abort();
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
                    is_new_face: this.faceStyle === "meta" ? 1 : 0,
                    code_mode: 0,
                    pageIndex: page,
                    pageSize: this.libPageSize,
                };
                if (this.searchInput.trim()) params.title = this.searchInput.trim();
                const data = await searchMallFaces(params);
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
                this.boneControls = [];
                this.decalOptions = [];
                this.boneValues = {};
                this.faceProfileData = null;
                return;
            }
            try {
                const [bones, decals, profile] = await Promise.all([
                    this.preview.getFaceBoneControls(),
                    this.preview.getFaceDecalOptions(),
                    this.preview.getFaceProfile(),
                ]);
                this.boneControls = Array.isArray(bones) ? bones : [];
                this.decalOptions = Array.isArray(decals) ? decals : [];
                this.faceProfileData = profile?.data || null;

                const tBone = profile?.data?.tBone || {};
                const nextValues = {};
                for (const ctrl of this.boneControls) {
                    const val = tBone[ctrl.key] ?? 0;
                    nextValues[ctrl.key] = Number.isFinite(val) ? val : 0;
                }
                this.boneValues = nextValues;
                if (this.boneAreas.length && !this.openAreas.some((a) => this.boneAreas.some((b) => b.name === a))) {
                    this.openAreas = ["__makeup__", this.boneAreas[0].name];
                }
            } catch {
                this.boneControls = [];
                this.decalOptions = [];
            }
        },
        async handleFaceProfile(profile, label) {
            if (profile.kind === "body") {
                ElMessage.warning("这是体型文件，请前往左侧「体型」分类中导入");
                return false;
            }
            if (!["stylized-face", "realistic-face"].includes(profile.kind)) {
                ElMessage.error("不支持的捏脸数据格式");
                return false;
            }
            if (profile.roleType !== this.role) {
                ElMessage.warning(`该捏脸适用于「${BODY_LABEL_MAP[profile.roleType] || profile.roleType}」，请先切换体型`);
                return false;
            }
            const payload = {
                profile,
                textureDefinitionUrl: getFaceDecalManifestUrl(this.role),
                label,
            };
            if (this.applyFaceHandler) {
                return Boolean(await this.applyFaceHandler(payload));
            }
            this.$emit("apply-face-profile", payload);
            return true;
        },
        async applyLibraryItem(item) {
            const seq = ++this._presetSeq;
            this._presetAbort?.abort();
            const controller = new AbortController();
            this._presetAbort = controller;
            this.applyingId = item.id;
            try {
                const att = await fetchMallAttachment("face", item.id, controller.signal);
                if (seq !== this._presetSeq) return;
                const profile = att.data
                    ? characterProfileFromData(att.data)
                    : parseCharacterProfile(att.bytes);
                const applied = await this.handleFaceProfile(profile, item.title || `捏脸 #${item.id}`);
                if (seq === this._presetSeq && applied) {
                    this.activePresetId = item.id;
                }
            } catch (err) {
                if (err?.name === "AbortError" || seq !== this._presetSeq) return;
                ElMessage.error(err?.message || "捏脸数据加载失败");
            } finally {
                if (seq === this._presetSeq) {
                    this.applyingId = null;
                }
            }
        },
        async onFileSelected(e) {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
                const buf = new Uint8Array(await file.arrayBuffer());
                const profile = parseCharacterProfile(buf);
                await this.handleFaceProfile(profile, file.name);
            } catch (err) {
                ElMessage.error(err?.message || "无法解析捏脸 .dat 文件");
            }
        },
        async resetFace() {
            if (!this.preview || !this.ready) return;
            try {
                await this.preview.resetFaceProfile();
                this.activePresetId = null;
                await this.refreshControls();
                ElMessage.success("已恢复默认脸型与妆容");
            } catch (err) {
                ElMessage.error(err?.message || "重置脸型失败");
            }
        },
        onBoneSliderChange(key, value) {
            const intVal = Math.round(Number(value) || 0);
            this.boneValues = { ...this.boneValues, [key]: intVal };
            this._pendingBones[key] = intVal;
            this.flushBoneChanges();
        },
        async flushBoneChanges() {
            if (this.flushingBones || !this.preview || !this.ready) return;
            this.flushingBones = true;
            try {
                while (Object.keys(this._pendingBones).length > 0) {
                    const batch = JSON.parse(JSON.stringify(this._pendingBones));
                    this._pendingBones = {};
                    await this.preview.updateFaceBones(batch);
                }
            } catch (err) {
                ElMessage.error(err?.message || "调节脸部骨骼失败");
            } finally {
                this.flushingBones = false;
            }
        },
        onMakeupColorChange(slot, hex) {
            const channels = hexToStoredChannels(hex);
            if (!channels) return;
            this.queueMakeupPatch(slot.slotKey, { bUse: true, ...channels });
        },
        onMakeupSliderChange(slotKey, field, val) {
            this.queueMakeupPatch(slotKey, { bUse: true, [field]: Number(val) });
        },
        queueMakeupPatch(slotKey, patch) {
            this._pendingMakeups[slotKey] = {
                ...(this._pendingMakeups[slotKey] || {}),
                ...patch,
            };
            if (this.faceProfileData?.tDecal?.[slotKey]) {
                this.faceProfileData = {
                    ...this.faceProfileData,
                    tDecal: {
                        ...this.faceProfileData.tDecal,
                        [slotKey]: { ...this.faceProfileData.tDecal[slotKey], ...patch },
                    },
                };
            }
            this.flushMakeupChanges();
        },
        async flushMakeupChanges() {
            if (this.flushingMakeups || !this.preview || !this.ready) return;
            this.flushingMakeups = true;
            try {
                while (Object.keys(this._pendingMakeups).length > 0) {
                    const batch = JSON.parse(JSON.stringify(this._pendingMakeups));
                    this._pendingMakeups = {};
                    await this.preview.updateFaceMakeup(batch);
                }
            } catch (err) {
                ElMessage.error(err?.message || "调节妆容失败");
            } finally {
                this.flushingMakeups = false;
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

.m-face-style-switch {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 12px 14px 4px;
    flex-shrink: 0;
}

.u-style-btn {
    padding: 7px 10px;
    border: 1.5px solid @pvx-border;
    border-radius: @pvx-radius-pill;
    background: #f8fafc;
    color: @pvx-text-regular;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.16s;

    &.is-active {
        border-color: @pvx-primary;
        background: @pvx-primary;
        color: #ffffff;
        box-shadow: 0 3px 10px rgba(91, 92, 245, 0.25);
    }

    &:disabled {
        opacity: 0.65;
        cursor: wait;
    }
}

.m-editor-tabs {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    padding: 8px 14px 10px;
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
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 6px;
        background: rgba(15, 23, 42, 0.56);
        backdrop-filter: blur(2px);
        color: #fff;
        font-size: 12px;
        font-weight: 600;
    }

    .u-busy-spin {
        width: 18px;
        height: 18px;
        border: 2px solid rgba(255, 255, 255, 0.28);
        border-top-color: #a5b4fc;
        border-radius: 50%;
        animation: face-preset-spin 0.8s linear infinite;
    }
}

@keyframes face-preset-spin {
    to {
        transform: rotate(360deg);
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

.m-makeup-list {
    display: grid;
    gap: 10px;
}

.m-makeup-card {
    padding: 8px 10px;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    display: grid;
    gap: 6px;

    .m-makeup-card__head {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .u-slot-title {
        font-size: 12px;
        font-weight: 700;
        color: @pvx-text-primary;
    }
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
        gap: 6px;
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
