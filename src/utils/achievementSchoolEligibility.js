import schoolIdMap from "@jx3box/jx3box-data/data/xf/schoolid.json";
import schoolRelation from "@jx3box/jx3box-data/data/xf/relation.json";
import { collectMenuAchievementIds } from "@/utils/achievementStatistics";

export const ACHIEVEMENT_SCHOOL_ELIGIBILITY_VERSION = "school-v1";

const SHARED_SCHOOL = "*";
const TASK_CATEGORY = "任务";
const MARTIAL_CATEGORY = "武学";
const JOURNEY_CATEGORY = "风雨江湖路";
const JOURNEY_SECOND_ACT = "第二幕";
const SHARED_MARTIAL_DETAIL = "无相楼招式";

const SCHOOL_ALIASES = Object.freeze({
    天策府: "天策",
    藏剑山庄: "藏剑",
    唐家堡: "唐门",
    凌雪阁: "凌雪",
    衍天宗: "衍天",
    北天药宗: "药宗",
    万灵山庄: "万灵",
    南诏段氏: "段氏",
    无相楼: "无相",
});

// 风雨江湖路第二幕的目录只提供成就 ID，不包含门派名，因此先在前端显式维护。
// 后续接口提供 restriction.school 后，显式字段会优先于本表。
export const JOURNEY_SECOND_ACT_SCHOOL_BY_ID = Object.freeze({
    3024: "纯阳",
    3025: "万花",
    3026: "少林",
    3027: "五毒",
    3028: "天策",
    3029: "唐门",
    3030: "藏剑",
    3031: "七秀",
    3321: "明教",
    3725: "丐帮",
    4422: "苍云",
    5046: "长歌",
    5580: "霸刀",
    6535: "蓬莱",
    7233: "凌雪",
    8650: "衍天",
    9459: "药宗",
    10411: "刀宗",
    11227: "万灵",
    11881: "段氏",
});

function normalizeMenuEntries(menus) {
    return Array.isArray(menus) ? menus : Object.values(menus || {});
}

function normalizeText(value) {
    return String(value ?? "").trim();
}

function normalizeSchoolAlias(value) {
    const name = normalizeText(value);
    if (!name) return null;
    return SCHOOL_ALIASES[name] || name;
}

function getCanonicalSchools() {
    return new Set(Object.values(schoolIdMap || {}).map(normalizeSchoolAlias).filter(Boolean));
}

const CANONICAL_SCHOOLS = getCanonicalSchools();
const MOUNT_BELONG_SCHOOL = schoolRelation?.mount_belong_school || {};
const MOUNT_ID_BELONG_SCHOOL = Object.entries(schoolRelation?.school_contains_mount || {}).reduce(
    (result, [school, mountIds]) => {
        (mountIds || []).forEach((mountId) => {
            result[String(mountId)] = school;
        });
        return result;
    },
    {}
);
const UNRESTRICTED_SCHOOL_TOKENS = new Set(["*", "all", "none", "不限", "无", "通用", "江湖"]);

export function normalizeAchievementRoleSchool(value) {
    const raw = normalizeText(value);
    if (!raw) return null;
    const fromSchoolId = schoolIdMap?.[raw];
    const fromMount = MOUNT_BELONG_SCHOOL?.[raw];
    const fromMountId = MOUNT_ID_BELONG_SCHOOL?.[raw];
    const normalized = normalizeSchoolAlias(fromSchoolId || fromMount || fromMountId || raw);
    return CANONICAL_SCHOOLS.has(normalized) ? normalized : null;
}

function resolveSchoolFromDetailName(detailName, suffix) {
    const name = normalizeText(detailName);
    if (!name.endsWith(suffix)) return null;
    return normalizeAchievementRoleSchool(name.slice(0, -suffix.length));
}

function appendRestriction(restrictionById, ids, schools, source) {
    const allowedSchools = [...new Set((schools || []).map(normalizeAchievementRoleSchool).filter(Boolean))];
    if (!allowedSchools.length) return;

    [...collectMenuAchievementIds([{ achievements: ids }])].forEach((id) => {
        const key = String(id);
        const current = restrictionById.get(key);
        restrictionById.set(key, {
            schools: [...new Set([...(current?.schools || []), ...allowedSchools])],
            source: current?.source || source,
        });
    });
}

function buildManualRestrictionIndex(menus) {
    const restrictionById = new Map();

    normalizeMenuEntries(menus).forEach((menu) => {
        const categoryName = normalizeText(menu?.name);
        const children = Array.isArray(menu?.children) ? menu.children : [];

        if (categoryName === TASK_CATEGORY) {
            children.forEach((child) => {
                const school = resolveSchoolFromDetailName(child?.name, "任务");
                if (school) appendRestriction(restrictionById, child?.achievements, [school], "task-school");
            });
        }

        if (categoryName === MARTIAL_CATEGORY) {
            children.forEach((child) => {
                const detailName = normalizeText(child?.name);
                if (detailName === SHARED_MARTIAL_DETAIL) return;
                const school = resolveSchoolFromDetailName(detailName, "招式");
                if (school) appendRestriction(restrictionById, child?.achievements, [school], "martial-school");
            });
        }

        if (categoryName === JOURNEY_CATEGORY) {
            const secondAct = children.find((child) => normalizeText(child?.name) === JOURNEY_SECOND_ACT);
            if (!secondAct) return;
            [...collectMenuAchievementIds([secondAct])].forEach((id) => {
                const school = JOURNEY_SECOND_ACT_SCHOOL_BY_ID[String(id)];
                if (school) appendRestriction(restrictionById, [id], [school], "journey-second-act");
            });
        }
    });

    return restrictionById;
}

export function buildAchievementSchoolEligibilityContext({ menus = {}, roleSchool = null } = {}) {
    const school = normalizeAchievementRoleSchool(roleSchool);
    return {
        version: ACHIEVEMENT_SCHOOL_ELIGIBILITY_VERSION,
        school,
        restrictionById: buildManualRestrictionIndex(menus),
    };
}

function normalizeRestrictionSchools(value) {
    const rawValues = (Array.isArray(value) ? value : normalizeText(value).split(/[、,，/|]/))
        .map(normalizeText)
        .filter(Boolean);
    if (rawValues.some((item) => UNRESTRICTED_SCHOOL_TOKENS.has(item.toLowerCase()))) return [];
    const normalized = rawValues.map(normalizeAchievementRoleSchool).filter(Boolean);
    return normalized.length ? [...new Set(normalized)] : null;
}

function resolveExplicitRestriction(record, metadataItem) {
    const values = [
        record?.restriction?.school,
        record?.schoolLimit,
        record?.SchoolLimit,
        metadataItem?.restriction?.school,
        metadataItem?.schoolLimit,
        metadataItem?.SchoolLimit,
    ];
    const value = values.find((item) => item !== undefined && item !== null && item !== "");
    if (value === undefined) return null;
    const schools = normalizeRestrictionSchools(value);
    return schools === null ? null : { schools, source: "api" };
}

export function resolveAchievementSchoolRestriction({ id, record = null, metadataItem = null, context = null } = {}) {
    const explicitRestriction = resolveExplicitRestriction(record, metadataItem);
    if (explicitRestriction) return explicitRestriction;
    return context?.restrictionById?.get(String(id)) || null;
}

export function isAchievementEligibleForSchool({ id, record = null, metadataItem = null, context = null } = {}) {
    const roleSchool = context?.school || null;
    if (!roleSchool) return true;
    const restriction = resolveAchievementSchoolRestriction({ id, record, metadataItem, context });
    if (!restriction?.schools?.length || restriction.schools.includes(SHARED_SCHOOL)) return true;
    return restriction.schools.includes(roleSchool);
}
