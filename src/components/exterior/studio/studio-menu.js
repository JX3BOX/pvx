// 自由试衣间商城风格左侧导航配置与舞台背景定义。
import { WEAPON_SCHOOLS } from "../meta";

export const STUDIO_MENU = [
    {
        id: "favorites",
        labelKey: "exteriorStudio.favorites",
        descKey: "exteriorStudio.favoritesDesc",
        icon: "Star",
        source: "favorites",
    },
    {
        id: "history",
        labelKey: "exteriorStudio.history",
        descKey: "exteriorStudio.historyDesc",
        icon: "Clock",
        source: "history",
    },
    {
        id: "outfit",
        labelKey: "exteriorStudio.outfitParts",
        descKey: "exteriorStudio.outfitDesc",
        icon: "Suitcase",
        defaultSub: "outfit",
        subs: [
            { id: "outfit", labelKey: "exterior.domains.outfit", domain: "outfit" },
            { id: "cloak", label: "披风", domain: "pendant", slot: "BackCloak", category: "8_10_6_3" },
            { id: "hat", label: "帽子", domain: "part", slot: "hat" },
            { id: "chest", label: "上衣", domain: "part", slot: "chest", exclude_full_outfit: 1 },
            { id: "bangle", label: "护腕", domain: "part", slot: "bangle" },
            { id: "waist", label: "腰带", domain: "part", slot: "waist" },
            { id: "pants", label: "下装", domain: "part", slot: "pants" },
            { id: "boots", labelKey: "exteriorStudio.footwear", domain: "part", slot: "boots" },
        ],
    },
    {
        id: "hair",
        labelKey: "exterior.domains.hair",
        descKey: "exteriorStudio.hairDesc",
        icon: "Scissor",
        domain: "hair",
    },
    {
        id: "pendant",
        labelKey: "exterior.domains.pendant",
        descKey: "exteriorStudio.pendantDesc",
        icon: "MagicStick",
        defaultSub: "all",
        subs: [
            { id: "all", labelKey: "exterior.allTypes", domain: "pendant" },
            { id: "Back", labelKey: "exteriorStudio.backSlot", domain: "pendant", slot: "Back", category: "8_12_6_5" },
            { id: "Waist", labelKey: "exteriorStudio.waistSlot", domain: "pendant", slot: "Waist", category: "8_13_6_6" },
            { id: "Face", labelKey: "exteriorStudio.faceView", domain: "pendant", slot: "Face", category: "8_11_6_4" },
            { id: "Glasses", label: "眼饰", domain: "pendant", slot: "Glasses", category: "8_21_6_62" },
            { id: "Head", label: "头饰", domain: "pendant", slot: "Head", category: "8_17_6_65" },
            { id: "LShoulder", labelKey: "exteriorStudio.leftShoulder", domain: "pendant", slot: "LShoulder", category: "8_15_6_8" },
            { id: "RShoulder", labelKey: "exteriorStudio.rightShoulder", domain: "pendant", slot: "RShoulder", category: "8_16_6_9" },
            { id: "Bag", label: "佩囊", domain: "pendant", slot: "Bag", category: "8_20_6_12" },
            { id: "PendantPet", label: "挂宠", domain: "pendant", slot: "PendantPet", category: "12_1_6_60" },
        ],
    },
    {
        id: "weapon",
        labelKey: "exterior.domains.weapon",
        descKey: "exteriorStudio.weaponDesc",
        icon: "View",
        defaultSub: "all",
        subs: [
            { id: "all", labelKey: "exterior.allTypes", domain: "weapon" },
            ...WEAPON_SCHOOLS.map(({ key, name, school }) => ({ id: key, label: name, domain: "weapon", school })),
        ],
    },
    {
        id: "motion",
        labelKey: "exteriorStudio.motion",
        descKey: "exteriorStudio.motionDesc",
        icon: "Camera",
        defaultSub: "posture",
        subs: [
            { id: "posture", labelKey: "exterior.domains.posture", domain: "posture" },
            { id: "expression", labelKey: "exteriorStudio.expression", domain: "expression" },
        ],
    },
    {
        id: "effect",
        labelKey: "exterior.domains.effect",
        descKey: "exteriorStudio.effectDesc",
        icon: "Sunny",
        defaultSub: "all",
        subs: [
            { id: "all", labelKey: "exterior.allTypes", domain: "effect" },
            { id: "footprint", labelKey: "exteriorStudio.footprint", domain: "effect", slot: "Footprint" },
            { id: "circle", labelKey: "exteriorStudio.aura", domain: "effect", slot: "CircleBody" },
        ],
    },
    {
        id: "body",
        labelKey: "exterior.bodyType",
        descKey: "exteriorStudio.bodyDesc",
        icon: "User",
        editor: "body",
    },
    {
        id: "face",
        labelKey: "exteriorStudio.face",
        descKey: "exteriorStudio.faceDesc",
        icon: "Brush",
        editor: "face",
    },
];

export const STUDIO_SKYBOXES = [
    { value: "pavilion", labelKey: "exteriorStudio.pavilion" },
    { value: "mist", labelKey: "exteriorStudio.mist" },
    { value: "warm", labelKey: "exteriorStudio.warm" },
    { value: "dusk", labelKey: "exteriorStudio.dusk" },
    { value: "dark", labelKey: "exteriorStudio.dark" },
    { value: "white", labelKey: "exteriorStudio.white" },
];
