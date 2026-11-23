// 外观大全状态管理：持久化用户偏好展示体型、3D 画质与试穿舞台背景，未手动选择体型时自动跟随账号默认游戏角色体型。
import { createStore } from "vuex";
import { jx3ClientType } from "@jx3box/jx3box-common/js/utils";
import { normalizeBodyType } from "@/components/exterior/meta";
import { getDefaultUserBodyType } from "@/service/exterior";

const ROLE_STORAGE_KEY = "pvx_exterior_preferred_role";
const QUALITY_STORAGE_KEY = "pvx_exterior_3d_quality";
const STAGE_BG_STORAGE_KEY = "pvx_exterior_3d_bg";

const VALID_QUALITIES = new Set(["auto", "high", "medium", "low"]);
const VALID_STAGE_BGS = new Set(["pavilion", "mist", "dark"]);

function readStoredValue(key, validator, fallback) {
    try {
        const value = localStorage.getItem(key);
        return validator(value) ? value : fallback;
    } catch {
        return fallback;
    }
}

function writeStoredValue(key, value) {
    try {
        localStorage.setItem(key, String(value));
    } catch {
        // 忽略隐私模式存储限制
    }
}

function readStoredRole() {
    try {
        return normalizeBodyType(localStorage.getItem(ROLE_STORAGE_KEY));
    } catch {
        return null;
    }
}

const storedRole = readStoredRole();
const storedQuality = readStoredValue(QUALITY_STORAGE_KEY, (v) => VALID_QUALITIES.has(v), "auto");
const storedStageBg = readStoredValue(STAGE_BG_STORAGE_KEY, (v) => VALID_STAGE_BGS.has(v), "pavilion");

export default createStore({
    state: {
        pendingWarehouseGroups: {},
        client: jx3ClientType() === 2 ? "origin" : "std",
        preferredRole: storedRole || 2,
        roleSource: storedRole ? "user" : "default",
        characterRole: null,
        roleInitialized: false,
        preferredQuality: storedQuality,
        preferredStageBg: storedStageBg,
    },
    mutations: {
        setPendingWarehouseGroups(state, { account, groups }) {
            state.pendingWarehouseGroups[account] = groups;
        },
        setPreferredRole(state, { role, persist = true }) {
            const valid = normalizeBodyType(role);
            if (!valid) return;
            state.preferredRole = valid;
            state.roleSource = persist ? "user" : "character";
            if (persist) {
                writeStoredValue(ROLE_STORAGE_KEY, valid);
            }
        },
        setCharacterRole(state, characterRole) {
            state.characterRole = characterRole;
            state.roleInitialized = true;
            if (characterRole?.role && state.roleSource === "default") {
                state.preferredRole = characterRole.role;
                state.roleSource = "character";
            }
        },
        setPreferredQuality(state, quality) {
            if (!VALID_QUALITIES.has(quality)) return;
            state.preferredQuality = quality;
            writeStoredValue(QUALITY_STORAGE_KEY, quality);
        },
        setPreferredStageBg(state, stageBg) {
            if (!VALID_STAGE_BGS.has(stageBg)) return;
            state.preferredStageBg = stageBg;
            writeStoredValue(STAGE_BG_STORAGE_KEY, stageBg);
        },
    },
    actions: {
        async initPreferredRole({ state, commit }) {
            if (state.roleInitialized) return state.preferredRole;
            const characterRole = await getDefaultUserBodyType();
            commit("setCharacterRole", characterRole);
            return state.preferredRole;
        },
    },
});
